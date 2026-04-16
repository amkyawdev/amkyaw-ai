"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import { 
  Play, Pause, Volume2, VolumeX, Maximize, Upload,
  Languages, Save, Clock, FileText, Download, X, Check,
  Loader2, Sparkles, GripVertical, Trash2, Plus, RefreshCw,
  ChevronUp, ChevronDown
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
  const [currentSegmentId, setCurrentSegmentId] = useState<number | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [editMode, setEditMode] = useState<number | null>(null);
  const [editText, setEditText] = useState("");
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Sample segments for demo
  const sampleSegments: Segment[] = [
    { id: 1, start: 0, end: 5, originalText: "Welcome to this tutorial on Python programming.", translatedText: "" },
    { id: 2, start: 5, end: 10, originalText: "In this video, we will learn about variables and data types.", translatedText: "" },
    { id: 3, start: 10, end: 15, originalText: "Let's start by understanding what a variable is.", translatedText: "" },
    { id: 4, start: 15, end: 20, originalText: "A variable is like a container that stores data.", translatedText: "" },
    { id: 5, start: 20, end: 25, originalText: "You can think of it as a labeled box.", translatedText: "" },
    { id: 6, start: 25, end: 30, originalText: "Now let's see how to create a variable.", translatedText: "" },
    { id: 7, start: 30, end: 35, originalText: "First, let's define a simple variable.", translatedText: "" },
    { id: 8, start: 35, end: 40, originalText: "We use the equals sign to assign a value.", translatedText: "" },
  ];

  // Auto-scroll to current segment
  useEffect(() => {
    if (currentSegmentId && scrollRef.current) {
      const element = document.getElementById(`segment-${currentSegmentId}`);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    }
  }, [currentSegmentId]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoFile(file);
      setVideoUrl(URL.createObjectURL(file));
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
        setCurrentSegmentId(segment.id);
      }
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
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
    setCurrentSegmentId(segment.id);
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
        // Small delay between requests
        await new Promise(resolve => setTimeout(resolve, 300));
      }
    }
    setIsTranscribing(false);
  };

  const handleEditStart = (segment: Segment) => {
    setEditMode(segment.id);
    setEditText(segment.translatedText || segment.originalText);
  };

  const handleEditSave = (segmentId: number) => {
    setSegments(prev => prev.map(s => 
      s.id === segmentId 
        ? { ...s, translatedText: editText }
        : s
    ));
    setEditMode(null);
    setEditText("");
  };

  const handleEditCancel = () => {
    setEditMode(null);
    setEditText("");
  };

  const handleAddSegment = () => {
    const newId = Math.max(...segments.map(s => s.id), 0) + 1;
    const newSegment: Segment = {
      id: newId,
      start: duration,
      end: duration + 5,
      originalText: "",
      translatedText: ""
    };
    setSegments([...segments, newSegment]);
    setEditMode(newId);
    setEditText("");
  };

  const handleDeleteSegment = (segmentId: number) => {
    setSegments(prev => prev.filter(s => s.id !== segmentId));
    if (currentSegmentId === segmentId) {
      setCurrentSegmentId(null);
    }
  };

  const handleReorder = (newOrder: Segment[]) => {
    // Re-assign IDs based on new order
    const reindexed = newOrder.map((s, index) => ({ ...s, id: index + 1 }));
    setSegments(reindexed);
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newSegments = [...segments];
    const temp = newSegments[index - 1];
    newSegments[index - 1] = newSegments[index];
    newSegments[index] = temp;
    handleReorder(newSegments);
  };

  const handleMoveDown = (index: number) => {
    if (index === segments.length - 1) return;
    const newSegments = [...segments];
    const temp = newSegments[index];
    newSegments[index] = newSegments[index + 1];
    newSegments[index + 1] = temp;
    handleReorder(newSegments);
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

  const currentSegment = segments.find(s => s.id === currentSegmentId);

  return (
    <div className="flex flex-col h-full bg-zinc-950 text-zinc-100 p-4 md:p-6 overflow-hidden">
      <div className="flex flex-col h-full space-y-4">
        
        {/* Header */}
        <div className="flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-violet-500 rounded-xl flex items-center justify-center">
              <FileText size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">SRT Editor</h2>
              <p className="text-xs text-zinc-500">Drag to reorder segments</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleAddSegment}
              className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-zinc-400"
              title="Add segment"
            >
              <Plus size={18} />
            </button>
            <button
              onClick={handleTranslateAll}
              disabled={isTranscribing || segments.length === 0}
              className="px-3 py-2 bg-cyan-500 hover:bg-cyan-600 disabled:bg-zinc-800 disabled:text-zinc-500 text-white text-sm font-medium rounded-xl flex items-center gap-2"
            >
              {isTranscribing ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Languages size={14} />
              )}
              <span>Translate All</span>
            </button>
            <button
              onClick={handleExportSRT}
              disabled={segments.length === 0}
              className="px-3 py-2 bg-violet-500 hover:bg-violet-600 disabled:bg-zinc-800 disabled:text-zinc-500 text-white text-sm font-medium rounded-xl flex items-center gap-2"
            >
              <Download size={14} />
              <span>Export</span>
            </button>
          </div>
        </div>

        <div className="flex flex-1 gap-4 overflow-hidden">
          {/* Video Player */}
          <div className="w-1/3 space-y-4 flex-shrink-0">
            {!videoUrl ? (
              <div 
                onClick={handleUploadClick}
                className="relative h-48 bg-zinc-900/50 border-2 border-dashed border-zinc-800 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-cyan-500/50 transition-colors"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Upload size={32} className="text-zinc-500 mb-2" />
                <p className="text-sm text-zinc-400">Upload Video</p>
              </div>
            ) : (
              <div className="relative bg-black rounded-xl overflow-hidden">
                <video
                  ref={videoRef}
                  src={videoUrl}
                  className="w-full"
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={handleLoadedMetadata}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                />
                
                {/* Controls */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                  <div className="flex items-center gap-2">
                    <button onClick={togglePlayPause} className="text-white">
                      {isPlaying ? <Pause size={18} /> : <Play size={18} />}
                    </button>
                    <span className="text-xs text-white">
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => { setVideoUrl(""); setVideoFile(null); setSegments([]); }}
                  className="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-white hover:bg-black/70"
                >
                  <X size={14} />
                </button>
              </div>
            )}

            {/* Current Segment Preview */}
            {currentSegment && (
              <div className="bg-zinc-900/50 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-400">
                    {formatTime(currentSegment.start)} - {formatTime(currentSegment.end)}
                  </span>
                  <button
                    onClick={() => handleTranslateText(currentSegment.id, currentSegment.originalText)}
                    disabled={isSaving}
                    className="text-xs text-cyan-400 flex items-center gap-1 hover:text-cyan-300"
                  >
                    <Sparkles size={12} />
                    Translate
                  </button>
                </div>
                <p className="text-sm text-zinc-300">{currentSegment.originalText}</p>
                {currentSegment.translatedText && (
                  <p className="text-sm text-violet-400">{currentSegment.translatedText}</p>
                )}
              </div>
            )}
          </div>

          {/* Segments List - Reorderable */}
          <div className="flex-1 overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-zinc-400 flex items-center gap-2">
                <Clock size={14} />
                SRT Segments ({segments.length})
              </h3>
              <button
                onClick={handleCopyAll}
                className="text-xs text-zinc-500 hover:text-white flex items-center gap-1"
              >
                {copied ? <Check size={12} className="text-green-500" /> : <Save size={12} />}
                {copied ? "Copied" : "Copy All"}
              </button>
            </div>
            
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto space-y-2 pr-2"
            >
              {segments.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-zinc-500">
                  <FileText size={32} strokeWidth={1} />
                  <p className="text-sm mt-2">Upload video to see segments</p>
                </div>
              ) : (
                <Reorder.Group axis="y" values={segments} onReorder={handleReorder} className="space-y-2">
                  {segments.map((segment, index) => (
                    <Reorder.Item
                      key={segment.id}
                      value={segment}
                      id={`segment-${segment.id}`}
                      className={`p-3 rounded-xl transition-all cursor-pointer ${
                        currentSegmentId === segment.id
                          ? "bg-cyan-500/20 border border-cyan-500/30"
                          : "bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {/* Drag Handle & Move Buttons */}
                        <div className="flex flex-col items-center gap-1 pt-1">
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleMoveUp(index); }}
                            disabled={index === 0}
                            className="text-zinc-600 hover:text-zinc-400 disabled:opacity-30"
                          >
                            <ChevronUp size={14} />
                          </button>
                          <GripVertical size={14} className="text-zinc-600" />
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleMoveDown(index); }}
                            disabled={index === segments.length - 1}
                            className="text-zinc-600 hover:text-zinc-400 disabled:opacity-30"
                          >
                            <ChevronDown size={14} />
                          </button>
                        </div>

                        {/* Content */}
                        <div 
                          onClick={() => handleSegmentClick(segment)}
                          className="flex-1 min-w-0 cursor-pointer"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-zinc-500">
                              {formatTime(segment.start)} - {formatTime(segment.end)}
                            </span>
                            <div className="flex items-center gap-1">
                              {segment.translatedText && (
                                <span className="text-xs text-violet-400">
                                  <Sparkles size={10} />
                                </span>
                              )}
                              <button
                                onClick={(e) => { e.stopPropagation(); handleEditStart(segment); }}
                                className="text-xs text-zinc-600 hover:text-zinc-400"
                              >
                                Edit
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); handleDeleteSegment(segment.id); }}
                                className="text-xs text-red-500/60 hover:text-red-500"
                              >
                                <Trash2 size={10} />
                              </button>
                            </div>
                          </div>
                          
                          {editMode === segment.id ? (
                            <div className="space-y-2" onClick={e => e.stopPropagation()}>
                              <textarea
                                value={editText}
                                onChange={(e) => setEditText(e.target.value)}
                                placeholder="Enter translation..."
                                className="w-full h-20 p-2 bg-zinc-800 rounded-lg text-sm text-zinc-200 placeholder-zinc-500 focus:border-violet-500 focus:outline-none"
                              />
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleEditSave(segment.id)}
                                  className="px-2 py-1 bg-violet-500 hover:bg-violet-600 text-white text-xs rounded"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={handleEditCancel}
                                  className="px-2 py-1 bg-zinc-700 hover:bg-zinc-600 text-zinc-300 text-xs rounded"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-1">
                              <p className="text-sm text-zinc-300 line-clamp-2">
                                {segment.translatedText || segment.originalText || "(empty)"}
                              </p>
                              {!segment.translatedText && (
                                <p className="text-xs text-zinc-600 line-clamp-1">
                                  {segment.originalText}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </Reorder.Item>
                  ))}
                </Reorder.Group>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}