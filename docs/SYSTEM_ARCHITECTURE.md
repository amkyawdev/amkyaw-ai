# 🎬 AI Subtitle Extractor & Editor - System Architecture

## Overview

ဒီ project သည်းခါ မော်ဗီဖိုင်များကို အပါ်လုပ်ပြီး:
1. ပါဝင်တဲ့ SRT ဖိုင်များကို ဆွဲထုပ်ပါ၊ ပါးပီးပါ။
2. မရှိပါးပီးပါပလား အလိုအပ်ပါ AI နဲ့ ဖန်တီးပါ၊ ပါးပီးပါ။
3. တည်းဖြတ်လုပ်လို့ရပါ။
4. Export လုပ်လို့ရပါ။

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js)                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │ Video Player│  │ Segment List│  │ Translation Editor  │ │
│  │   (Play/Pause) │  │   (List)    │  │ (Myanmar Input)     │ │
│  └──────┬──────┘  └──────┬──────┘  └──────────┬──────────┘ │
│         │                │                    │             │
│         └────────────────┼────────────────────┘             │
│                          │                                  │
│                    ┌─────▼─────┐                           │
│                    │ Zustand   │                           │
│                    │  Store    │                           │
│                    └─────┬─────┘                           │
└──────────────────────────┼──────────────────────────────────┘
                           │
                    ┌──────▼──────┐
                    │   REST API  │
                    │  (FastAPI)  │
                    └──────┬──────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
   ┌────▼────┐      ┌──────▼──────┐   ┌──────▼──────┐
   │ FFmpeg  │      │ Faster-     │   │   SQLite    │
   │ Extractor│     │ Whisper     │   │   Database  │
   └─────────┘      │ (AI)        │   └─────────────┘
                   └─────────────┘
```

---

## 📁 Project Structure

```
amkyaw-ai/
├── backend/                    # FastAPI Backend
│   ├── main.py               # FastAPI app entry point
│   ├── models/               # Pydantic models
│   │   ├── video.py
│   │   ├── subtitle.py
│   │   └── segment.py
│   ├── services/
│   │   ├── ffmpeg_service.py      # FFmpeg subtitle extraction
│   │   ├── whisper_service.py    # Faster-Whisper transcription
│   │   ├── subtitle_service.py   # SRT parsing/building
│   │   └── database_service.py   # SQLite operations
│   ├── routes/
│   │   ├── video.py         # Video upload & info
│   │   ├── subtitle.py     # Subtitle CRUD
│   │   └── export.py       # Export SRT
│   └── utils/
│       ├── ffmpeg_utils.py
│       └── srt_utils.py
│
├── src/                      # Next.js Frontend
│   ├── app/
│   │   └── (dashboard)/
│   │       └── srt-editor/
│   │           └── page.tsx  # Main SRT Editor
│   ├── components/
│   │   ├── VideoPlayer.tsx   # Video player component
│   │   ├── SegmentList.tsx   # Subtitle segments list
│   │   ├── SegmentEditor.tsx # Translation editor
│   │   └── ui/               # Glassmorphism components
│   ├── lib/
│   │   ├── ffmpeg.ts         # FFmpeg detection logic
│   │   └── whisper.ts        # AI transcription
│   └── stores/
│       └── useSubtitleStore.ts  # Zustand store
│
└── requirements.txt
```

---

## 🔧 Backend Logic - FFmpeg Subtitle Extraction

### 1. Subtitle Detection (FFprobe)

```python
# backend/services/ffmpeg_service.py
import subprocess
import json
import re

def detect_subtitle_tracks(video_path: str) -> dict:
    """
    FFprobe သုံးပြီး မော်ဗီထဲက subtitle tracks များကို ရှာပါ၊ ပါးပီးပါ။
    """
    cmd = [
        'ffprobe',
        '-v', 'quiet',
        '-print_format', 'json',
        '-show_streams',
        video_path
    ]
    
    result = subprocess.run(cmd, capture_output=True, text=True)
    data = json.loads(result.stdout)
    
    subtitle_tracks = []
    for stream in data.get('streams', []):
        if stream.get('codec_type') == 'subtitle':
            subtitle_tracks.append({
                'index': stream.get('index'),
                'codec_name': stream.get('codec_name'),
                'tags': stream.get('tags', {}),
                'title': stream.get('tags', {}).get('title', 'Unknown'),
                'language': stream.get('tags', {}).get('language', 'unknown')
            })
    
    return {
        'has_subtitles': len(subtitle_tracks) > 0,
        'tracks': subtitle_tracks,
        'total_tracks': len(subtitle_tracks)
    }
```

### 2. Subtitle Extraction (FFmpeg)

```python
def extract_subtitle(video_path: str, track_index: int = 0, output_path: str = None) -> str:
    """
    FFmpeg သုံးပြီး ရွေးလိုက်တဲ့ subtitle track ကို .srt ဖိုင်အဖြစ်လုပ်ပါ။
    """
    if output_path is None:
        output_path = video_path.rsplit('.', 1)[0] + '_subtitle.srt'
    
    # မော်ဗီထဲက subtitle ထုတ်ပါ၊ ပါးပီးပါ။
    cmd = [
        'ffmpeg',
        '-i', video_path,
        '-map', f'0:s:{track_index}',
        '-c:s', 'srt',
        output_path,
        '-y'  # Overwrite if exists
    ]
    
    subprocess.run(cmd, capture_output=True)
    return output_path
```

### 3. SRT Parser

```python
def parse_srt(srt_path: str) -> list[Segment]:
    """
    SRT ဖိုင်ဖတ်ပြီး segments များကို ပြန်ပါးပီးပါ။
    """
    with open(srt_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    blocks = content.strip().split('\n\n')
    segments = []
    
    for block in blocks:
        lines = block.strip().split('\n')
        if len(lines) >= 3:
            segment_id = int(lines[0])
            
            # Time format: 00:00:01,000 --> 00:00:05,000
            time_match = re.match(
                r'(\d{2}:\d{2}:\d{2},\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2},\d{3})',
                lines[1]
            )
            
            if time_match:
                start_time = time_match.group(1)
                end_time = time_match.group(2)
                text = '\n'.join(lines[2:])
                
                segments.append({
                    'id': segment_id,
                    'start': start_time,
                    'end': end_time,
                    'start_seconds': time_to_seconds(start_time),
                    'end_seconds': time_to_seconds(end_time),
                    'text': text,
                    'translated_text': ''
                })
    
    return segments
```

---

## 🤖 AI Transcription - Faster-Whisper

### Whisper Service

```python
# backend/services/whisper_service.py
from faster_whisper import WhisperModel

class WhisperService:
    def __init__(self, model_size: str = "large-v3"):
        """
        Faster-Whisper အစပါ၊ ပါးပီးပါ။
        """
        self.model = WhisperModel(
            model_size,
            device="cpu",  # or "cuda" for GPU
            compute_type="int8"  # Quantization for speed
        )
    
    def transcribe(self, video_path: str) -> list[Segment]:
        """
        မော်ဗီမှာ audio ဖတ်ပြီး AI နဲ့ transcript လုပ်ပါ၊ ပါးပီးပါ။
        """
        segments, info = self.model.transcribe(
            video_path,
            language="en",
            vad_filter=True,  # Voice activity detection
            vad_parameters=dict(min_silence_duration_ms=500)
        )
        
        result = []
        for i, seg in enumerate(segments, 1):
            result.append({
                'id': i,
                'start': format_time(seg.start),
                'end': format_time(seg.end),
                'start_seconds': seg.start,
                'end_seconds': seg.end,
                'text': seg.text.strip(),
                'translated_text': ''
            })
        
        return result
```

---

## 💾 Database Schema

```python
# backend/models/subtitle.py
from sqlalchemy import create_engine, Column, Integer, String, Float, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

Base = declarative_base()

class Video(Base):
    __tablename__ = 'videos'
    
    id = Column(Integer, primary_key=True)
    filename = Column(String)
    filepath = Column(String)
    duration = Column(Float)
    has_subtitles = Column(Integer, default=0)
    created_at = Column(String)

class SubtitleSegment(Base):
    __tablename__ = 'subtitle_segments'
    
    id = Column(Integer, primary_key=True)
    video_id = Column(Integer)
    segment_index = Column(Integer)
    start_time = Column(String)
    end_time = Column(String)
    start_seconds = Column(Float)
    end_seconds = Column(Float)
    original_text = Column(Text)
    translated_text = Column(Text, default='')
    edited = Column(Integer, default=0)
```

---

## 🎨 Frontend - Glassmorphism UI

```tsx
// src/components/SegmentEditor.tsx
import { useState } from 'react'

interface SegmentEditorProps {
  originalText: string
  translatedText: string
  onSave: (text: string) => void
}

export default function SegmentEditor({ 
  originalText, 
  translatedText, 
  onSave 
}: SegmentEditorProps) {
  const [text, setText] = useState(translatedText || '')
  
  return (
    <div className="glass-panel p-4 rounded-xl">
      {/* Original Text */}
      <div className="mb-4">
        <label className="text-xs text-zinc-500 mb-2 block">Original</label>
        <div className="p-3 bg-zinc-900/50 rounded-lg text-zinc-300">
          {originalText}
        </div>
      </div>
      
      {/* Myanmar Translation Input */}
      <div>
        <label className="text-xs text-violet-500 mb-2 block">Myanmar Translation</label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full h-24 p-3 bg-zinc-800/50 rounded-lg 
                     text-violet-300 placeholder-zinc-600
                     border border-violet-500/30 focus:border-violet-500
                     focus:ring-2 focus:ring-violet-500/20
                     focus:outline-none transition-all
                     glass-input"
          placeholder="မြန်မာဘာသာဖြင့်ရေးပါ။..."
        />
      </div>
      
      <button
        onClick={() => onSave(text)}
        className="mt-3 px-4 py-2 bg-violet-500 hover:bg-violet-600 
                   text-white rounded-lg font-medium transition-colors"
      >
        Save Translation
      </button>
    </div>
  )
}
```

---

## 🎯 Key Features Implementation

### 1. Auto-Detect Subtitle on Upload

```python
# POST /api/video/upload
@router.post("/upload")
async def upload_video(file: UploadFile):
    # Save video temporarily
    temp_path = f"/tmp/{file.filename}"
    
    # Detect subtitle tracks
    subtitle_info = detect_subtitle_tracks(temp_path)
    
    if subtitle_info['has_subtitles']:
        # Extract existing subtitle
        srt_path = extract_subtitle(temp_path, track_index=0)
        segments = parse_srt(srt_path)
    else:
        # Use AI to transcribe
        whisper = WhisperService("large-v3")
        segments = whisper.transcribe(temp_path)
    
    # Save to database
    video_id = save_video_metadata(file.filename, temp_path)
    save_segments(video_id, segments)
    
    return {
        "video_id": video_id,
        "has_subtitles": subtitle_info['has_subtitles'],
        "segments": segments
    }
```

### 2. Pause-to-Edit Workflow

```tsx
// Video player component
function VideoPlayer({ videoUrl, onTimeUpdate }) {
  const [currentTime, setCurrentTime] = useState(0)
  
  const handleTimeUpdate = () => {
    setCurrentTime(video.currentTime)
    onTimeUpdate(video.currentTime)
  }
  
  const handlePause = () => {
    // Fetch segment for current timestamp
    fetchSegmentAtTime(currentTime)
  }
  
  return (
    <video
      src={videoUrl}
      onTimeUpdate={handleTimeUpdate}
      onPause={handlePause}
      controls
    />
  )
}
```

### 3. Segment Sync

```tsx
// Get segment at current time
const getSegmentAtTime = (time: number, segments: Segment[]) => {
  return segments.find(
    s => time >= s.start_seconds && time <= s.end_seconds
  )
}
```

### 4. Export SRT

```python
def export_srt(segments: list[Segment], output_path: str):
    """Edited segments များကို SRT ဖိုင်အဖြစ်လုပ်ပါ၊ ပါးပီးပါ။"""
    
    content = ""
    for i, seg in enumerate(segments, 1):
        # Use translated text if available, otherwise original
        text = seg.translated_text or seg.original_text
        
        content += f"{i}\n"
        content += f"{seg.start} --> {seg.end}\n"
        content += f"{text}\n\n"
    
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    return output_path
```

---

## ⚠️ Important Implementation Tips

### 1. Sub-stream Mapping
```python
# Dynamic track selection based on ffprobe output
def get_subtitle_map_index(streams: list) -> int:
    """ ပထမဆုံး subtitle track ရဲ့ index ကို ရှာပါ၊ ပါးပီးပါ။"""
    for i, stream in enumerate(streams):
        if stream.get('codec_type') == 'subtitle':
            return i
    return 0
```

### 2. Segment Overlap Handling
```python
def handle_overlapping_segments(segments: list[Segment]) -> list[Segment]:
    """ ထပ်နေတဲ့ segments များကို ရှင်းပါ၊ ပါးပီးပါ။"""
    if not segments:
        return []
    
    sorted_segments = sorted(segments, key=lambda s: s.start_seconds)
    merged = [sorted_segments[0]]
    
    for seg in sorted_segments[1:]:
        if seg.start_seconds < merged[-1].end_seconds:
            # Overlap detected - merge or keep separate
            merged[-1].end_seconds = max(
                merged[-1].end_seconds, 
                seg.end_seconds
            )
        else:
            merged.append(seg)
    
    return merged
```

### 3. State Management (Zustand)

```typescript
// src/stores/useSubtitleStore.ts
import { create } from 'zustand'

interface SubtitleState {
  segments: Segment[]
  currentSegment: Segment | null
  videoId: number | null
  
  setSegments: (segments: Segment[]) => void
  updateSegment: (id: number, text: string) => void
  setCurrentSegment: (segment: Segment | null) => void
}

export const useSubtitleStore = create<SubtitleState>((set) => ({
  segments: [],
  currentSegment: null,
  videoId: null,
  
  setSegments: (segments) => set({ segments }),
  
  updateSegment: (id, text) => set((state) => ({
    segments: state.segments.map(s => 
      s.id === id ? { ...s, translated_text: text, edited: 1 } : s
    )
  })),
  
  setCurrentSegment: (segment) => set({ currentSegment: segment })
}))
```

---

## 🚀 Deployment

### Environment Setup

```bash
# Install FFmpeg
sudo apt install ffmpeg

# Install Faster-Whisper
pip install faster-whisper

# Install dependencies
pip install -r requirements.txt

# Run backend
uvicorn main:app --reload

# Run frontend
npm run dev
```

---

## 📝 Summary

ဒီ system သည်းခါ အောက်ပါအရာများလုပ်ပါ။ ပါးပီးပါ။

| Feature | Description |
|---------|-------------|
| **Subtitle Detection** | FFprobe သုံးပြီး ပါဝင်တဲ့ SRT ရှာပါ၊ ပါးပီးပါ။ |
| **Subtitle Extraction** | FFmpeg သုံးပြီး .srt ဖိုင်အဖြစ်လုပ်ပါ၊ ပါးပီးပါ။ |
| **AI Transcription** | Faster-Whisper သုံးပြီး အသစ်ထုတ်ပါ၊ ပါးပီးပါ။ |
| **Pause-to-Edit** | ဗီဒီယို ရပ်လိုက်ရင် အဲ့အချိန်မှာ စာသားပါးပီးပါ။ |
| **Translation** | မြန်မာဘာသာ ပြန်လုပ်လို့ရပါ။ |
| **Export** | ပြင်းပါတ်ပါ SRT ဖိုင် ထုပ်လို့ရပါ။ |

---

**Note:** ဒီ document သည်းခါ ဒီလို project တစ်ခုလုံးကို ဆောက်လုပ်ဖို့ လိုအပ်ပတဲ့ အသေးစိတ် အချက်များပါ၊ ပါးပီးပါ။ AI Developer သည်းခါ ဒီ Prompt ကို သုံးပြီး System တစ်ခုလုံးရဲ့ Code Structure ကို ထုတ်ခိုင်းလို့ရပါ။