"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Play, Pause, Volume2, VolumeX, Maximize, Settings, Upload,
  Languages, Save, Clock, FileText, Download, X, Check,
  Loader2, Sparkles, ChevronRight, ChevronLeft
} from "lucide-react";

interface Segment {
  id: number;
  start: number;
  end: number;
  originalText: string;
  translatedText: string;
}

export default function SrtTranscriptPage() {
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  
  const [segments, setSegments] = useState<Segment[]>([]);
  const [currentSegment, setCurrentSegment] = useState<Segment | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sample segments for demo (will be replaced with actual transcription)
  const sampleSegments: Segment[] = [
    { id: 1, start: 0, end: 5, originalText: "Welcome to this tutorial on Python programming.", translatedText: "" },
    { id: 2, start: 5, end: 10, originalText: "In this video, we will learn about variables and data types.", translatedText: "" },
    { id: 3, start: 10, end: 15, originalText: "Let's start by understanding what a variable is.", translatedText: "" },
    { id: 4, start: 15, end: 20, originalText: "A variable is like a container that stores data.", translatedText: "" },
    { id: 5, start: 20, end: 25, originalText: "You can think of it as a labeled box.", translatedText: "" },
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoFile(file);
      setVideoUrl(URL.createObjectURL(file));
      // Load sample segments
      setSegments(sampleSegments);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      
      // Find current segment
      const segment = segments.find(
        s => videoRef.current!.currentTime >= s.start && videoRef.current!.currentTime <= s.end
      );
      if (segment) {
        setCurrentSegment(segment);
      }
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setVolume(value);
    if (videoRef.current) {
      videoRef.current.volume = value;
    }
    setIsMuted(value === 0);
  };

  const toggleMute = () => {
    if (videoRef.current) {
      if (isMuted) {
        videoRef.current.volume = volume || 1;
        setIsMuted(false);
      } else {
        videoRef.current.volume = 0;
        setIsMuted(true);
      }
    }
  };

  const handleFullscreen = () => {
    if (videoRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        videoRef.current.requestFullscreen();
      }
    }
  };

  const handleSeek = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleSegmentClick = (segment: Segment) => {
    handleSeek(segment.start);
    setCurrentSegment(segment);
  };

  const handleTranslateText = async (segmentId: number, text: string) => {
    if (!text.trim()) return;
    
    setIsSaving(true);
    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          text,
          targetLang: "my"
        }),
      });
      
      const data = await res.json();
      
      if (data.translatedText) {
        setSegments(prev => prev.map(s => 
          s.id === segmentId 
            ? { ...s, translatedText: data.translatedText }
            : s
        ));
      }
    } catch (err) {
      console.error("Translation failed:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTranslateAll = async () => {
    setIsTranscribing(true);
    for (const segment of segments) {
      if (!segment.translatedText && segment.originalText) {
        await handleTranslateText(segment.id, segment.originalText);
      }
    }
    setIsTranscribing(false);
  };

  const handleExportSRT = () => {
    let srtContent = "";
    segments.forEach((segment, index) => {
      const startTime = formatSRTTime(segment.start);
      const endTime = formatSRTTime(segment.end);
      const text = segment.translatedText || segment.originalText;
      srtContent += `${index + 1}\n${startTime} --> ${endTime}\n${text}\n\n`;
    });

    const blob = new Blob([srtContent], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "translated_subtitle.srt";
    link.click();
  };

  const formatSRTTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 1000);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')},${ms.toString().padStart(3, '0')}`;
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCopyAll = () => {
    const allText = segments
      .map(s => s.translatedText || s.originalText)
      .filter(Boolean)
      .join('\n');
    navigator.clipboard.writeText(allText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-zinc-950 text-zinc-100 p-4 md:p-6 overflow-y-auto">
      <div className="max-w-7xl mx-auto w-full space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-violet-500 rounded-xl flex items-center justify-center">
              <FileText size={24} className="text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">SRT Transcript Editor</h2>
              <p className="text-sm text-zinc-500">Video subtitle editor with Myanmar translation</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleTranslateAll}
              disabled={isTranscribing || segments.length === 0}
              className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 disabled:bg-zinc-800 disabled:text-zinc-500 text-white font-medium rounded-xl flex items-center gap-2"
            >
              {isTranscribing ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Languages size={16} />
              )}
              <span>Translate All</span>
            </button>
            <button
              onClick={handleExportSRT}
              disabled={segments.length === 0}
              className="px-4 py-2 bg-violet-500 hover:bg-violet-600 disabled:bg-zinc-800 disabled:text-zinc-500 text-white font-medium rounded-xl flex items-center gap-2"
            >
              <Download size={16} />
              <span>Export SRT</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Video Player & Editor */}
          <div className="lg:col-span-2 space-y-4">
            
            {/* Video Upload */}
            {!videoUrl && (
              <div 
                onClick={handleUploadClick}
                className="relative h-64 bg-zinc-900/50 border-2 border-dashed border-zinc-800 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-cyan-500/50 transition-colors group"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Upload size={32} className="text-zinc-400 group-hover:text-cyan-400" />
                </div>
                <p className="text-lg font-medium text-zinc-400">Click to upload video</p>
                <p className="text-sm text-zinc-500 mt-2">Supports MP4, WebM, MOV</p>
              </div>
            )}

            {/* Video Player */}
            {videoUrl && (
              <div className="relative bg-black rounded-2xl overflow-hidden group">
                <video
                  ref={videoRef}
                  src={videoUrl}
                  className="w-full aspect-video"
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={handleLoadedMetadata}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                />
                
                {/* Video Controls Overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  {/* Progress Bar */}
                  <div className="relative h-1 bg-zinc-700 rounded-full mb-4 cursor-pointer">
                    <div 
                      className="absolute h-full bg-cyan-500 rounded-full"
                      style={{ width: `${(currentTime / duration) * 100}%` }}
                    />
                    <input
                      type="range"
                      min={0}
                      max={duration}
                      value={currentTime}
                      onChange={(e) => handleSeek(parseFloat(e.target.value))}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <button onClick={togglePlayPause} className="text-white hover:text-cyan-400">
                        {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                      </button>
                      <div className="flex items-center gap-2">
                        <button onClick={toggleMute} className="text-white hover:text-cyan-400">
                          {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                        </button>
                        <input
                          type="range"
                          min={0}
                          max={1}
                          step={0.1}
                          value={isMuted ? 0 : volume}
                          onChange={handleVolumeChange}
                          className="w-20 h-1"
                        />
                      </div>
                      <span className="text-white text-sm">
                        {formatTime(currentTime)} / {formatTime(duration)}
                      </span>
                    </div>
                    <button onClick={handleFullscreen} className="text-white hover:text-cyan-400">
                      <Maximize size={20} />
                    </button>
                  </div>
                </div>

                {/* Close button */}
                <button
                  onClick={() => { setVideoUrl(""); setVideoFile(null); setSegments([]); }}
                  className="absolute top-4 right-4 p-2 bg-black/50 rounded-full text-white hover:bg-black/70"
                >
                  <X size={16} />
                </button>
              </div>
            )}

            {/* Sub-Editor Panel */}
            <div className="backdrop-blur-md bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 space-y-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <FileText size={20} className="text-cyan-400" />
                Sub-Editor
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Original AI Transcription */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-400 flex items-center gap-2">
                    <Languages size={14} />
                    Original AI Transcription
                  </label>
                  <div className="relative">
                    <textarea
                      value={currentSegment?.originalText || ""}
                      readOnly
                      placeholder="Original transcription will appear here..."
                      className="w-full h-40 p-4 bg-zinc-800/50 border border-zinc-700 rounded-xl text-zinc-300 placeholder-zinc-500 resize-none focus:outline-none"
                    />
                    <div className="absolute bottom-3 right-3 text-xs text-zinc-500">
                      {currentSegment ? `${formatTime(currentSegment.start)} - ${formatTime(currentSegment.end)}` : ""}
                    </div>
                  </div>
                </div>

                {/* Myanmar Translation Input */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-400 flex items-center gap-2">
                    <Sparkles size={14} className="text-violet-400" />
                    Myanmar Translation
                  </label>
                  <div className="relative">
                    <textarea
                      value={currentSegment?.translatedText || ""}
                      onChange={(e) => {
                        if (currentSegment) {
                          setSegments(prev => prev.map(s => 
                            s.id === currentSegment.id 
                              ? { ...s, translatedText: e.target.value }
                              : s
                          ));
                        }
                      }}
                      placeholder="Type Myanmar translation here..."
                      className="w-full h-40 p-4 bg-zinc-800/50 border border-violet-500/50 rounded-xl text-zinc-300 placeholder-zinc-500 resize-none focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/50 shadow-lg shadow-violet-500/10"
                    />
                    {currentSegment && (
                      <button
                        onClick={() => currentSegment && handleTranslateText(currentSegment.id, currentSegment.originalText)}
                        disabled={isSaving || !currentSegment.originalText}
                        className="absolute bottom-3 right-3 px-3 py-1 bg-violet-500 hover:bg-violet-600 disabled:bg-zinc-700 text-white text-xs rounded-lg flex items-center gap-1"
                      >
                        {isSaving ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                        Auto Translate
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Sync & Save Button */}
              <div className="flex justify-end">
                <button
                  onClick={handleCopyAll}
                  className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-violet-500 hover:from-cyan-600 hover:to-violet-600 text-white font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 transition-all"
                >
                  {copied ? <Check size={18} /> : <Save size={18} />}
                  <span>{copied ? "Copied!" : "Sync & Save"}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar - SRT Segments */}
          <div className="space-y-4">
            <div className="backdrop-blur-md bg-zinc-900/50 border border-zinc-800 rounded-2xl p-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
                <Clock size={20} className="text-cyan-400" />
                SRT Segments
              </h3>
              
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {segments.length === 0 ? (
                  <p className="text-zinc-500 text-center py-8">
                    Upload a video to see segments
                  </p>
                ) : (
                  segments.map((segment) => (
                    <button
                      key={segment.id}
                      onClick={() => handleSegmentClick(segment)}
                      className={`w-full text-left p-3 rounded-xl transition-all ${
                        currentSegment?.id === segment.id
                          ? "bg-cyan-500/20 border border-cyan-500/30"
                          : "bg-zinc-800/50 border border-transparent hover:bg-zinc-800"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-zinc-500">
                          {formatTime(segment.start)} - {formatTime(segment.end)}
                        </span>
                        {segment.translatedText && (
                          <span className="text-xs text-violet-400 flex items-center gap-1">
                            <Check size={10} />
                            Translated
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-zinc-300 line-clamp-2">
                        {segment.originalText}
                      </p>
                      {segment.translatedText && (
                        <p className="text-xs text-zinc-500 mt-1 line-clamp-1">
                          {segment.translatedText}
                        </p>
                      )}
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}