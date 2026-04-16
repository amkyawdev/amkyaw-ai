#!/usr/bin/env python3
"""
YouTube Video Transcriber using Faster Whisper
Usage: python3 transcribe.py <youtube_url>
"""

import sys
import json
import tempfile
import os
from pathlib import Path

# Add current directory to path
sys.path.insert(0, str(Path(__file__).parent))

from faster_whisper import WhisperModel
import yt_dlp


def download_audio(youtube_url: str, output_path: str) -> str:
    """Download audio from YouTube video"""
    ydl_opts = {
        'format': 'bestaudio/best',
        'outtmpl': output_path,
        'postprocessors': [{
            'key': 'FFmpegExtractAudio',
            'preferredcodec': 'wav',
        }],
        'quiet': True,
        'no_warnings': True,
    }
    
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(youtube_url, download=True)
        title = info.get('title', 'Unknown Title')
        # The file will have .wav extension after postprocessing
        audio_file = output_path + '.wav'
        
    return audio_file, title


def transcribe_audio(audio_path: str, model_size: str = "large-v3") -> str:
    """Transcribe audio using Faster Whisper"""
    # Run in GPU if available, otherwise CPU
    # "large-v3" is the most accurate model
    model = WhisperModel(
        model_size,
        device="auto",  # auto-detect: cuda if available, else cpu
        compute_type="float16"  # faster on GPU
    )
    
    segments, info = model.transcribe(
        audio_path,
        language="en",
        beam_size=5,
        vad_filter=True,  # Voice activity detection
        vad_parameters=dict(min_silence_duration_ms=500)
    )
    
    print(f"Transcription language: {info.language}, probability: {info.language_probability:.2f}")
    
    # Combine all segments into a single transcript
    transcript_lines = []
    for segment in segments:
        transcript_lines.append(segment.text.strip())
    
    return "\n".join(transcript_lines)


def main():
    if len(sys.argv) < 2:
        print(json.dumps({"error": "YouTube URL required"}))
        sys.exit(1)
    
    youtube_url = sys.argv[1]
    
    try:
        # Create temp directory
        with tempfile.TemporaryDirectory() as temp_dir:
            audio_path = os.path.join(temp_dir, "audio")
            
            # Download audio
            print("Downloading audio from YouTube...")
            audio_file, title = download_audio(youtube_url, audio_path)
            print(f"Audio downloaded: {title}")
            
            # Transcribe
            print("Transcribing with Faster Whisper large-v3 model...")
            transcript = transcribe_audio(audio_file, model_size="large-v3")
            
            # Output result
            result = {
                "transcript": transcript,
                "title": title
            }
            print(json.dumps(result))
            
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)


if __name__ == "__main__":
    main()