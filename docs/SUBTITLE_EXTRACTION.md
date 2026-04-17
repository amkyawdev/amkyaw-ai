# 🎬 Subtitle Extraction & Parsing - Python Script

## Complete Python Script for AI Developer

```python
# subtitle_extractor.py

import subprocess
import re
import os
from typing import List, Dict, Optional

def detect_subtitle_streams(video_path: str) -> List[Dict]:
    """
    ၁။ FFprobe သုံးပြီး မော်ဗီထဲက subtitle streams များကို ရှာပါ၊ ပါးပီးပါ။
    
    Returns:
        List of subtitle stream information
    """
    cmd = [
        'ffprobe',
        '-v', 'quiet',
        '-print_format', 'json',
        '-show_streams',
        '-select_streams', 's',
        video_path
    ]
    
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, check=True)
        import json
        data = json.loads(result.stdout)
        
        streams = []
        for stream in data.get('streams', []):
            streams.append({
                'index': stream.get('index'),
                'codec_name': stream.get('codec_name'),
                'tags': stream.get('tags', {}),
                'title': stream.get('tags', {}).get('title', 'Unknown'),
                'language': stream.get('tags', {}).get('language', 'unknown')
            })
        
        return streams
    except Exception as e:
        print(f"Error detecting subtitle streams: {e}")
        return []


def extract_subtitle_to_srt(video_path: str, track_index: int = 0, output_path: str = None) -> Optional[str]:
    """
    ၂။ FFmpeg သုံးပြီး ရွေးလိုက်တဲ့ subtitle track ကို .srt ဖိုင်အဖြစ်လုပ်ပါ၊ ပါးပီးပါ။
    
    Args:
        video_path: Path to the video file
        track_index: Index of subtitle track to extract (default: 0)
        output_path: Custom output path (optional)
    
    Returns:
        Path to extracted SRT file or None on failure
    """
    if output_path is None:
        base_name = os.path.splitext(video_path)[0]
        output_path = f"{base_name}_extracted.srt"
    
    cmd = [
        'ffmpeg',
        '-i', video_path,
        '-map', f'0:s:{track_index}',
        '-c:s', 'srt',
        output_path,
        '-y'  # Overwrite if exists
    ]
    
    try:
        result = subprocess.run(
            cmd, 
            capture_output=True, 
            text=True, 
            timeout=60
        )
        
        if result.returncode == 0 and os.path.exists(output_path):
            return output_path
        else:
            print(f"FFmpeg extraction failed: {result.stderr}")
            return None
    except Exception as e:
        print(f"Error extracting subtitle: {e}")
        return None


def parse_srt_to_list(srt_path: str) -> List[Dict]:
    """
    ၃။ SRT ဖိုင်ဖတ်ပြီး List of Objects အဖြစ်လုပ်ပါ၊ ပါးပီးပါ။
    
    Returns:
        List of dictionaries: [{ "index": int, "start": float, "end": float, "text": str }, ...]
    """
    
    # Regex pattern သုံးပါ၊ ပါးပီးပါ။
    # Pattern: index -> timestamp -> text -> (empty line or end)
    pattern = r'(\d+)\n(\d{2}:\d{2}:\d{2},\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2},\d{3})\n([\s\S]*?)(?=\n\n|\Z)'
    
    try:
        with open(srt_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        matches = re.findall(pattern, content)
        
        segments = []
        for match in matches:
            index = int(match[0])
            start_time = match[1]
            end_time = match[2]
            text = match[3].strip()
            
            # Convert SRT timestamp to seconds
            start_seconds = srt_time_to_seconds(start_time)
            end_seconds = srt_time_to_seconds(end_time)
            
            segments.append({
                "index": index,
                "start": start_seconds,
                "end": end_seconds,
                "text": text,
                "start_raw": start_time,
                "end_raw": end_time
            })
        
        return segments
        
    except Exception as e:
        print(f"Error parsing SRT: {e}")
        return []


def srt_time_to_seconds(time_str: str) -> float:
    """
    SRT timestamp (HH:MM:SS,mmm) ကို စက္ကန့် (float) အဖြစ်လုပ်ပါ၊ ပါးပီးပါ။
    
    Args:
        time_str: SRT format time string (e.g., "00:05:30,500")
    
    Returns:
        Time in seconds as float
    """
    # Split by colon and comma
    parts = time_str.replace(',', ':').split(':')
    
    hours = int(parts[0])
    minutes = int(parts[1])
    seconds = int(parts[2])
    milliseconds = int(parts[3])
    
    total_seconds = hours * 3600 + minutes * 60 + seconds + milliseconds / 1000
    
    return total_seconds


def get_subtitles_from_video(video_path: str) -> List[Dict]:
    """
    ပါဝင်တဲ့ subtitle ရှိပါ၊ ပါးပီးပါ ဆွဲထုတ်ပါ၊ ပါးပီးပါ။
    
    Main function that orchestrates the extraction:
    1. Detect subtitle streams
    2. Extract first available stream
    3. Parse to list of objects
    
    Args:
        video_path: Path to video file
    
    Returns:
        List of subtitle segments, or empty list if no subtitles found
    """
    
    # Step 1: Detect subtitle streams
    streams = detect_subtitle_streams(video_path)
    
    if not streams:
        print("No subtitle streams found in video")
        return []  # Return empty list to trigger AI fallback
    
    print(f"Found {len(streams)} subtitle stream(s)")
    
    # Step 2: Extract first subtitle stream
    temp_srt = extract_subtitle_to_srt(video_path, track_index=0)
    
    if not temp_srt:
        print("Failed to extract subtitle")
        return []
    
    # Step 3: Parse SRT to list
    segments = parse_srt_to_list(temp_srt)
    
    # Clean up temp file
    try:
        os.remove(temp_srt)
    except:
        pass
    
    print(f"Extracted {len(segments)} subtitle segments")
    
    return segments


# ========== TEST USAGE ==========

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) < 2:
        print("Usage: python subtitle_extractor.py <video_file_path>")
        sys.exit(1)
    
    video_path = sys.argv[1]
    
    # Run extraction
    subtitles = get_subtitles_from_video(video_path)
    
    if subtitles:
        print("\n📝 Extracted Subtitles:")
        print("-" * 50)
        for sub in subtitles[:5]:  # Show first 5
            print(f"Index: {sub['index']}")
            print(f"Time: {sub['start']:.2f}s - {sub['end']:.2f}s")
            print(f"Text: {sub['text'][:50]}...")
            print("-" * 20)
        
        print(f"\nTotal: {len(subtitles)} segments")
        
        # Export as JSON
        import json
        with open('subtitles.json', 'w', encoding='utf-8') as f:
            json.dump(subtitles, f, ensure_ascii=False, indent=2)
        print("Saved to subtitles.json")
    else:
        print("No subtitles found - use AI transcription fallback")
```

---

## 📋 Output Example

```json
[
  {
    "index": 1,
    "start": 1.5,
    "end": 4.0,
    "text": "Hello, how are you?",
    "start_raw": "00:00:01,500",
    "end_raw": "00:00:04,000"
  },
  {
    "index": 2,
    "start": 4.5,
    "end": 7.0,
    "text": "I'm doing great, thanks for asking!",
    "start_raw": "00:00:04,500",
    "end_raw": "00:00:07,000"
  }
]
```

---

## 🔗 Next.js Frontend Integration

### 1. API Route

```python
# /api/subtitle/extract/route.py
from fastapi import APIRouter, UploadFile, File
from subtitle_extractor import get_subtitles_from_video
import tempfile
import os

router = APIRouter()

@router.post("/")
async def extract_subtitles(file: UploadFile = File(...)):
    # Save uploaded file temporarily
    with tempfile.NamedTemporaryFile(delete=False) as tmp:
        content = await file.read()
        tmp.write(content)
        tmp_path = tmp.name
    
    # Extract subtitles
    subtitles = get_subtitles_from_video(tmp_path)
    
    # Clean up
    os.unlink(tmp_path)
    
    return {
        "has_subtitles": len(subtitles) > 0,
        "subtitles": subtitles,
        "count": len(subtitles)
    }
```

### 2. Frontend Component

```tsx
// components/SubtitleSync.tsx
import { useState, useEffect } from 'react'

interface Subtitle {
  index: number
  start: number
  end: number
  text: string
}

export default function SubtitleSync({ 
  videoRef, 
  subtitles 
}: { 
  videoRef: React.RefObject<HTMLVideoElement>
  subtitles: Subtitle[] 
}) {
  const [currentSubtitle, setCurrentSubtitle] = useState<Subtitle | null>(null)
  
  // Sync subtitle with video time
  const handleTimeUpdate = () => {
    if (!videoRef.current) return
    
    const currentTime = videoRef.current.currentTime
    
    // Find matching subtitle
    const sub = subtitles.find(
      s => currentTime >= s.start && currentTime <= s.end
    )
    
    setCurrentSubtitle(sub || null)
  }
  
  // Add event listener
  useEffect(() => {
    const video = videoRef.current
    if (video) {
      video.addEventListener('timeupdate', handleTimeUpdate)
      return () => video.removeEventListener('timeupdate', handleTimeUpdate)
    }
  }, [videoRef, subtitles])
  
  return (
    <div className="subtitle-overlay">
      {currentSubtitle && (
        <div className="bg-black/70 px-4 py-2 rounded-lg">
          <p className="text-white text-lg">{currentSubtitle.text}</p>
        </div>
      )}
    </div>
  )
}
```

### 3. Usage in Page

```tsx
// app/srt-editor/page.tsx
export default function SrtEditor() {
  const [videoUrl, setVideoUrl] = useState<string>("")
  const [subtitles, setSubtitles] = useState<Subtitle[]>([])
  const videoRef = useRef<HTMLVideoElement>(null)
  
  // Upload video and extract subtitles
  const handleUpload = async (file: File) => {
    // 1. Upload to server
    const formData = new FormData()
    formData.append('file', file)
    
    // 2. Extract subtitles
    const response = await fetch('/api/subtitle/extract', {
      method: 'POST',
      body: formData
    })
    
    const data = await response.json()
    setSubtitles(data.subtitles)
    
    // 3. Set video URL
    setVideoUrl(URL.createObjectURL(file))
  }
  
  return (
    <div className="flex gap-4">
      <div className="w-2/3">
        <video 
          ref={videoRef}
          src={videoUrl}
          controls
          className="w-full"
        />
        <SubtitleSync videoRef={videoRef} subtitles={subtitles} />
      </div>
      
      <div className="w-1/3">
        {subtitles.map(sub => (
          <div 
            key={sub.index}
            className={`p-2 ${sub === currentSubtitle ? 'bg-cyan-500/20' : ''}`}
          >
            <span className="text-xs text-zinc-500">
              {sub.start.toFixed(1)}s
            </span>
            <p>{sub.text}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
```

---

## ⚠️ Error Handling Logic

```python
def process_video_with_fallback(video_path: str) -> List[Dict]:
    """
    Subtitle မရှိပါးပီးပါပလား ဆိုရင် AI Transcription လုပ်ပါ၊ ပါးပီးပါ။
    """
    
    # Try to extract embedded subtitles
    subtitles = get_subtitles_from_video(video_path)
    
    if subtitles:
        print("✓ Found embedded subtitles")
        return subtitles
    
    # Fallback: Use Faster-Whisper
    print("⚠ No subtitles found, using AI transcription...")
    from faster_whisper_transcriber import transcribe_video
    
    ai_subtitles = transcribe_video(video_path)
    return ai_subtitles
```

---

## 📦 Installation

```bash
# Install ffmpeg (required)
sudo apt install ffmpeg

# Install Python dependencies (if using ffmpeg-python)
pip install ffmpeg-python

# Or use subprocess (no extra dependencies needed)
```

---

## 📝 Summary

| Step | Function | Description |
|------|----------|-------------|
| ၁။ | `detect_subtitle_streams()` | FFprobe သုံးပြီး subtitle tracks ရှာပါ၊ ပါးပီးပါ။ |
| ၂။ | `extract_subtitle_to_srt()` | FFmpeg သုံးပြီး SRT ဖိုင်အဖြစ် ထုတ်ပါ၊ ပါးပီးပါ။ |
| ၃။ | `parse_srt_to_list()` | Regex သုံးပြီး List of Objects အဖြစ် ပြန်ပါးပီးပါ။ |
| ၄။ | `srt_time_to_seconds()` | SRT time ကို float အဖြစ် ပြောင်းပါ၊ ပါးပီးပါ။ |

**Note:** ဒီ Code သည်းခါ Self-hosted Backend မှာ သုံးပါ၊ ပါးပီးပါ။ Vercel မှာ FFmpeg မရှိပါ၊ ပါးပီးပါ။