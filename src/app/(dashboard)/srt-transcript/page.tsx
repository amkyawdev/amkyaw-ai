"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Upload, Languages, Clock, FileText, Download, X, Check,
  Loader2, Sparkles, Trash2, Plus, ChevronUp, ChevronDown, 
  FileJson, Copy, Bot, Zap, Play, Pause, Volume2, VolumeX, Maximize
} from "lucide-react";

interface Segment {
  id: number;
  startTime: number;
  endTime: number;
  start: string;
  end: string;
  text: string;
  translatedText: string;
}

export default function SrtTranscriptPage() {
  // Video state
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  
  // SRT state
  const [segments, setSegments] = useState<Segment[]>([]);
  const [currentSegmentId, setCurrentSegmentId] = useState<number | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [editMode, setEditMode] = useState<number | null>(null);
  const [editText, setEditText] = useState("");
  const [fileName, setFileName] = useState<string>("");
  const [selectedModel, setSelectedModel] = useState<'llama-3.3-70b' | 'mixtral-8x7b-32768' | 'auto'>('auto');
  const [searchQuery, setSearchQuery] = useState<string>("");
  
  // Filtered segments based on search
  const filteredSegments = searchQuery
    ? segments.filter(s => 
        s.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.translatedText && s.translatedText.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : segments;
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const srtInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto translation - alternates between Llama 70B and Mixtral 8x7B
  const autoTranslate = async (segmentId: number, text: string, index: number) => {
    const model = index % 2 === 0 ? 'llama-3.3-70b' : 'mixtral-8x7b-32768';
    
    const prompt = `Translate to BurmeseUnicode using Myanmar script: ${text}`;
    
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        prompt,
        model,
        temperature: 0.2,
        messages: []
      }),
    });
    
    const data = await res.json();
    
    if (data.message || data.response) {
      const translatedText = data.message || data.response;
      setSegments(prev => prev.map(s => 
        s.id === segmentId 
          ? { ...s, translatedText: translatedText }
          : s
      ));
    }
  };

  // Parse SRT file content
  const parseSRT = (content: string): Segment[] => {
    const blocks = content.trim().split(/\n\n+/);
    const parsed: Segment[] = [];
    
    for (const block of blocks) {
      const lines = block.split('\n');
      if (lines.length >= 3) {
        const id = parseInt(lines[0]);
        const timeLine = lines[1];
        const timeMatch = timeLine.match(
          /(\d{2}:\d{2}:\d{2},\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2},\d{3})/
        );
        
        if (timeMatch) {
          parsed.push({
            id,
            start: timeMatch[1],
            end: timeMatch[2],
            startTime: parseTimeToSeconds(timeMatch[1]),
            endTime: parseTimeToSeconds(timeMatch[2]),
            text: lines.slice(2).join('\n'),
            translatedText: ''
          });
        }
      }
    }
    
    return parsed;
  };

  // Parse time string to seconds
  const parseTimeToSeconds = (timeStr: string): number => {
    const parts = timeStr.split(':');
    const hours = parseInt(parts[0]);
    const minutes = parseInt(parts[1]);
    const secondsParts = parts[2].split(',');
    const seconds = parseInt(secondsParts[0]);
    const ms = parseInt(secondsParts[1]);
    
    return hours * 3600 + minutes * 60 + seconds + ms / 1000;
  };

  // Convert seconds to SRT time format
  const formatSRTTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 1000);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')},${ms.toString().padStart(3, '0')}`;
  };

  // Format time for display
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle video file upload
  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('video/')) {
      setVideoFile(file);
      setVideoUrl(URL.createObjectURL(file));
      setFileName(file.name.replace(/\.[^/.]+$/, ''));
      setSegments([]);
    }
  };

  // Handle SRT file upload
  const handleSrtUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.name.endsWith('.srt')) {
      setFileName(file.name.replace('.srt', ''));
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        const parsed = parseSRT(content);
        setSegments(parsed);
        if (parsed.length > 0) {
          setCurrentSegmentId(parsed[0].id);
        }
      };
      reader.readAsText(file);
    }
  };

  // Video controls
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
        s => videoRef.current!.currentTime >= s.startTime && videoRef.current!.currentTime <= s.endTime
      );
      if (segment && segment.id !== currentSegmentId) {
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
    handleSeek(segment.startTime);
    setCurrentSegmentId(segment.id);
  };

  // Auto-scroll to current segment
  useEffect(() => {
    if (currentSegmentId && scrollRef.current) {
      const element = document.getElementById(`segment-${currentSegmentId}`);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    }
  }, [currentSegmentId]);

  // Translate function using Chat API
  const handleTranslateText = async (segmentId: number, text: string, index?: number) => {
    if (!text.trim()) return;
    
    setIsSaving(true);
    try {
      // Use auto translation if selected, otherwise use selected model
      const modelToUse = selectedModel === 'auto' 
        ? (index || 0) % 2 === 0 ? 'llama-3.3-70b' : 'mixtral-8x7b-32768'
        : selectedModel;
      
      const prompt = `Translate to BurmeseUnicode using Myanmar script: ${text}`;
      
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          prompt,
          model: modelToUse,
          temperature: 0.2,
          messages: []
        }),
      });
      
      const data = await res.json();
      
      if (data.message || data.response) {
        const translatedText = data.message || data.response;
        setSegments(prev => prev.map(s => 
          s.id === segmentId 
            ? { ...s, translatedText: translatedText }
            : s
        ));
      }
    } catch (err) {
      console.error("Translation failed:", err);
    } finally {
      setIsSaving(false);
    }
  };

  // Translate all segments
  const handleTranslateAll = async () => {
    setIsTranscribing(true);
    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];
      if (!segment.translatedText && segment.text) {
        await handleTranslateText(segment.id, segment.text, i);
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    setIsTranscribing(false);
  };

  // Edit functions
  const handleEditStart = (segment: Segment) => {
    setEditMode(segment.id);
    setEditText(segment.translatedText || segment.text);
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

  const handleDeleteSegment = (segmentId: number) => {
    setSegments(prev => prev.filter(s => s.id !== segmentId));
    if (currentSegmentId === segmentId) {
      setCurrentSegmentId(null);
    }
  };

  // Reorder functions
  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newSegments = [...segments];
    const temp = newSegments[index - 1];
    newSegments[index - 1] = newSegments[index];
    newSegments[index] = temp;
    const reindexed = newSegments.map((s, i) => ({ ...s, id: i + 1 }));
    setSegments(reindexed);
  };

  const handleMoveDown = (index: number) => {
    if (index === segments.length - 1) return;
    const newSegments = [...segments];
    const temp = newSegments[index];
    newSegments[index] = newSegments[index + 1];
    newSegments[index + 1] = temp;
    const reindexed = newSegments.map((s, i) => ({ ...s, id: i + 1 }));
    setSegments(reindexed);
  };

  // Add new segment with optional start time
  const addNewSegment = (startTime?: number) => {
    const newId = segments.length > 0 ? Math.max(...segments.map(s => s.id)) + 1 : 1;
    const lastSegment = segments[segments.length - 1];
    const newStart = startTime !== undefined ? startTime : (lastSegment ? lastSegment.endTime : 0);
    const newSegment: Segment = {
      id: newId,
      start: formatSRTTime(newStart),
      end: formatSRTTime(newStart + 5),
      startTime: newStart,
      endTime: newStart + 5,
      text: "",
      translatedText: ""
    };
    setSegments([...segments, newSegment]);
    setEditMode(newId);
    setEditText("");
    setCurrentSegmentId(newId);
  };

  // Add segment at end (for header button)
  const handleAddSegment = () => {
    addNewSegment();
  };

  // Update segment time
  const handleUpdateSegmentTime = (segmentId: number, field: 'start' | 'end', value: string) => {
    const seconds = parseTimeToSeconds(value);
    setSegments(prev => prev.map(s => {
      if (s.id === segmentId) {
        return {
          ...s,
          [field]: value,
          [field === 'start' ? 'startTime' : 'endTime']: seconds
        };
      }
      return s;
    }));
  };

  const handleExportSRT = () => {
    let srtContent = "";
    segments.forEach((segment, index) => {
      const text = segment.translatedText || segment.text;
      if (text) {
        srtContent += `${index + 1}\n${segment.start} --> ${segment.end}\n${text}\n\n`;
      }
    });

    const blob = new Blob([srtContent], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${fileName || 'translated'}_my.srt`;
    link.click();
  };

  const handleCopyAll = () => {
    const allText = segments
      .map(s => s.translatedText || s.text)
      .filter(Boolean)
      .join('\n');
    navigator.clipboard.writeText(allText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClearVideo = () => {
    setVideoUrl("");
    setVideoFile(null);
    setSegments([]);
    setCurrentTime(0);
    setDuration(0);
    setIsPlaying(false);
  };

  // Add segment at current video time
  const handleAddSegmentAtCurrentTime = () => {
    addNewSegment(currentTime);
  };

  const currentSegment = segments.find(s => s.id === currentSegmentId);

  return (
    <div className="flex flex-col h-full bg-zinc-950 text-zinc-100 p-4 md:p-6 overflow-hidden">
      <div className="flex flex-col h-full space-y-4">
        
        {/* Header */}
        <div className="flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-violet-500 rounded-xl flex items-center justify-center">
              <FileJson size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">SRT Editor</h2>
              <p className="text-xs text-zinc-500">Upload video + SRT file to edit</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Add segment at current time button */}
            <button
              onClick={handleAddSegmentAtCurrentTime}
              disabled={!videoUrl}
              className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 disabled:bg-zinc-900 disabled:text-zinc-600 text-zinc-300 text-sm font-medium rounded-xl flex items-center gap-2"
              title="Add segment at current video time"
            >
              <Plus size={14} />
              <span>Add Here</span>
            </button>
            {/* Translate All Button */}
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
              <span>Export SRT</span>
            </button>
          </div>
        </div>

        <div className="flex flex-1 gap-4 overflow-hidden">
          {/* Left Panel - Video Player */}
          <div className="w-1/3 space-y-4 flex-shrink-0">
            {/* Video Upload/Player */}
            {!videoUrl ? (
              <div className="space-y-3">
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="relative h-40 bg-zinc-900/50 border-2 border-dashed border-zinc-800 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-cyan-500/50 transition-colors"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="video/*"
                    onChange={handleVideoUpload}
                    className="hidden"
                  />
                  <Upload size={32} className="text-zinc-500 mb-2" />
                  <p className="text-sm text-zinc-400">1. Upload Video</p>
                  <p className="text-xs text-zinc-600 mt-1">MP4, MKV, WebM</p>
                </div>
                
                <div className="text-center text-xs text-zinc-500 py-1">
                  → Then upload SRT below
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-px bg-zinc-800"></div>
                  <span className="text-xs text-zinc-500">OR</span>
                  <div className="flex-1 h-px bg-zinc-800"></div>
                </div>
                
                <div 
                  onClick={() => srtInputRef.current?.click()}
                  className="relative h-32 bg-zinc-900/50 border-2 border-dashed border-zinc-800 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-violet-500/50 transition-colors"
                >
                  <input
                    ref={srtInputRef}
                    type="file"
                    accept=".srt"
                    onChange={handleSrtUpload}
                    className="hidden"
                  />
                  <FileJson size={24} className="text-zinc-500 mb-2" />
                  <p className="text-sm text-zinc-400">2. Upload SRT</p>
                  <p className="text-xs text-zinc-600 mt-1">.srt subtitle file</p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Video Player */}
                <div className="relative bg-black rounded-xl overflow-hidden">
                  <video
                    ref={videoRef}
                    src={videoUrl}
                    className="w-full aspect-video"
                    onTimeUpdate={handleTimeUpdate}
                    onLoadedMetadata={handleLoadedMetadata}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                  />
                  
                  {/* Video Controls */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                    <div className="flex items-center gap-3">
                      <button onClick={togglePlayPause} className="text-white hover:text-cyan-400">
                        {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                      </button>
                      <div className="flex-1">
                        <input
                          type="range"
                          min="0"
                          max={duration || 100}
                          value={currentTime}
                          onChange={(e) => handleSeek(parseFloat(e.target.value))}
                          className="w-full h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                        />
                      </div>
                      <span className="text-xs text-white whitespace-nowrap">
                        {formatTime(currentTime)} / {formatTime(duration)}
                      </span>
                      <button onClick={handleClearVideo} className="text-zinc-400 hover:text-red-400">
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* File Info */}
                <div className="bg-zinc-900/50 rounded-xl p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText size={16} className="text-cyan-400" />
                      <span className="text-sm text-white truncate">{fileName}</span>
                    </div>
                    <span className="text-xs text-zinc-500">
                      {segments.length} segments
                    </span>
                  </div>
                  
                  {/* Upload SRT for this video */}
                  <div className="pt-2 border-t border-zinc-800">
                    <label className="flex items-center justify-center gap-2 px-3 py-2 bg-violet-500/10 hover:bg-violet-500/20 rounded-lg cursor-pointer transition-colors border border-violet-500/30">
                      <FileJson size={14} className="text-violet-400" />
                      <span className="text-xs text-violet-300 font-medium">2. Upload SRT File</span>
                      <input
                        type="file"
                        accept=".srt"
                        onChange={handleSrtUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Current Segment Preview */}
            {currentSegment && (
              <div className="bg-zinc-900/50 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-400">
                    {currentSegment.start} - {currentSegment.end}
                  </span>
                  <button
                    onClick={() => {
                      const idx = segments.findIndex(s => s.id === currentSegment.id);
                      handleTranslateText(currentSegment.id, currentSegment.text, idx);
                    }}
                    disabled={isSaving}
                    className="text-xs text-cyan-400 flex items-center gap-1 hover:text-cyan-300"
                  >
                    <Sparkles size={12} />
                    {selectedModel === 'auto' ? 'Auto Translate' : 'Translate'}
                  </button>
                </div>
                
                <div>
                  <p className="text-xs text-zinc-500 mb-1">Original:</p>
                  <p className="text-sm text-zinc-300">{currentSegment.text}</p>
                </div>
                
                {currentSegment.translatedText && (
                  <div className="pt-2 border-t border-zinc-800">
                    <p className="text-xs text-violet-500 mb-1">Myanmar:</p>
                    <p className="text-sm text-violet-300">{currentSegment.translatedText}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Panel - Segments List */}
          <div className="flex-1 overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-zinc-400 flex items-center gap-2">
                <Clock size={14} />
                Segments ({searchQuery ? `${filteredSegments.length}/${segments.length}` : segments.length})
              </h3>
              <button
                onClick={handleCopyAll}
                className="text-xs text-zinc-500 hover:text-white flex items-center gap-1"
              >
                {copied ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
                {copied ? "Copied" : "Copy All"}
              </button>
            </div>
            
            {/* Search Input */}
            {segments.length > 0 && (
              <div className="mb-3">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search segments..."
                  className="w-full px-3 py-2 bg-zinc-900/50 border border-zinc-800 rounded-lg text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500"
                />
              </div>
            )}
            
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto space-y-2 pr-2"
            >
              {segments.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-zinc-500">
                  <FileJson size={48} strokeWidth={1} />
                  <p className="text-sm mt-3">Upload video + SRT file</p>
                  <p className="text-xs text-zinc-600 mt-1">to start editing</p>
                </div>
              ) : (
                segments.map((segment, index) => (
                  <motion.div
                    key={segment.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.02 }}
                    id={`segment-${segment.id}`}
                    onClick={() => handleSegmentClick(segment)}
                    className={`p-3 rounded-xl transition-all cursor-pointer ${
                      currentSegmentId === segment.id
                        ? "bg-cyan-500/20 border border-cyan-500/30"
                        : "bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Move Buttons */}
                      <div className="flex flex-col items-center gap-1 pt-0.5">
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleMoveUp(index); }}
                          disabled={index === 0}
                          className="text-zinc-600 hover:text-zinc-400 disabled:opacity-30"
                        >
                          <ChevronUp size={14} />
                        </button>
                        <span className="text-xs text-zinc-600 font-mono w-4 text-center">{segment.id}</span>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleMoveDown(index); }}
                          disabled={index === segments.length - 1}
                          className="text-zinc-600 hover:text-zinc-400 disabled:opacity-30"
                        >
                          <ChevronDown size={14} />
                        </button>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        {/* Editable Time Fields */}
                        <div className="flex items-center gap-2 mb-2" onClick={e => e.stopPropagation()}>
                          <button
                            onClick={() => handleSeek(segment.startTime)}
                            className="text-xs font-mono text-cyan-400 hover:text-cyan-300 bg-cyan-500/10 px-1.5 py-0.5 rounded"
                          >
                            ▶ {segment.start}
                          </button>
                          <span className="text-xs text-zinc-600">→</span>
                          <input
                            type="text"
                            value={segment.end}
                            onChange={(e) => handleUpdateSegmentTime(segment.id, 'end', e.target.value)}
                            className="text-xs font-mono text-zinc-400 bg-zinc-800/50 px-1.5 py-0.5 rounded w-24 focus:outline-none focus:ring-1 focus:ring-violet-500"
                          />
                        </div>
                        
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-zinc-500">
                            Duration: {(segment.endTime - segment.startTime).toFixed(1)}s
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
                              {segment.text || "(empty)"}
                            </p>
                            {segment.translatedText && (
                              <p className="text-xs text-violet-400 line-clamp-1">
                                {segment.translatedText}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}