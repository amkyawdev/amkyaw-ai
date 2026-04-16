"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Upload, Languages, Save, Clock, FileText, Download, X, Check,
  Loader2, Sparkles, GripVertical, Trash2, Plus, ChevronUp, ChevronDown, 
  FileJson, Copy, Bot, Zap
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
  const [segments, setSegments] = useState<Segment[]>([]);
  const [currentSegmentId, setCurrentSegmentId] = useState<number | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [editMode, setEditMode] = useState<number | null>(null);
  const [editText, setEditText] = useState("");
  const [fileName, setFileName] = useState<string>("");
  const [selectedModel, setSelectedModel] = useState<'llama-3.3-70b' | 'mixtral-8x7b-32768'>('mixtral-8x7b-32768');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

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

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const handleUploadClick = () => {
    fileInputRef.current?.click();
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

  // Handle segment click
  const handleSegmentClick = (segment: Segment) => {
    setCurrentSegmentId(segment.id);
  };

  // Handle translate single segment using Chat API with model selection
  const handleTranslateText = async (segmentId: number, text: string) => {
    if (!text.trim()) return;
    
    setIsSaving(true);
    try {
      // Use Chat API for translation with selected model
      const prompt = `Translate the following English text to Burmese (Myanmar) language. Just provide the translation, nothing else:\n\n${text}`;
      
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          prompt,
          model: selectedModel,
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
    for (const segment of segments) {
      if (!segment.translatedText && segment.text) {
        await handleTranslateText(segment.id, segment.text);
        await new Promise(resolve => setTimeout(resolve, 300));
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
    // Re-index
    const reindexed = newSegments.map((s, i) => ({ ...s, id: i + 1 }));
    setSegments(reindexed);
  };

  const handleMoveDown = (index: number) => {
    if (index === segments.length - 1) return;
    const newSegments = [...segments];
    const temp = newSegments[index];
    newSegments[index] = newSegments[index + 1];
    newSegments[index + 1] = temp;
    // Re-index
    const reindexed = newSegments.map((s, i) => ({ ...s, id: i + 1 }));
    setSegments(reindexed);
  };

  // Add new segment
  const handleAddSegment = () => {
    const newId = segments.length > 0 ? Math.max(...segments.map(s => s.id)) + 1 : 1;
    const lastSegment = segments[segments.length - 1];
    const newStart = lastSegment ? lastSegment.endTime : 0;
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
  };

  // Export SRT file
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

  // Copy all translations
  const handleCopyAll = () => {
    const allText = segments
      .map(s => s.translatedText || s.text)
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
              <FileJson size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">SRT Editor</h2>
              <p className="text-xs text-zinc-500">Upload SRT file to edit translations</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Model Selector */}
            <div className="flex items-center gap-1 px-1 py-1 bg-zinc-900 rounded-lg border border-zinc-800">
              <button
                type="button"
                onClick={() => setSelectedModel('llama-3.3-70b')}
                className={`px-2 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-1 ${
                  selectedModel === 'llama-3.3-70b'
                    ? "bg-orange-500/20 text-orange-400 border border-orange-500/30"
                    : "text-zinc-400 hover:text-zinc-300"
                }`}
              >
                <Bot size={10} />
                Llama 70B
              </button>
              <button
                type="button"
                onClick={() => setSelectedModel('mixtral-8x7b-32768')}
                className={`px-2 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-1 ${
                  selectedModel === 'mixtral-8x7b-32768'
                    ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                    : "text-zinc-400 hover:text-zinc-300"
                }`}
              >
                <Zap size={10} />
                Mixtral 8x7B
              </button>
            </div>
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
          {/* Left Panel - Preview & Actions */}
          <div className="w-1/3 space-y-4 flex-shrink-0">
            {!fileName ? (
              <div 
                onClick={handleUploadClick}
                className="relative h-48 bg-zinc-900/50 border-2 border-dashed border-zinc-800 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-cyan-500/50 transition-colors"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".srt"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Upload size={32} className="text-zinc-500 mb-2" />
                <p className="text-sm text-zinc-400">Upload SRT File</p>
                <p className="text-xs text-zinc-500 mt-1">.srt format only</p>
              </div>
            ) : (
              <div className="bg-zinc-900/50 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileJson size={16} className="text-cyan-400" />
                    <span className="text-sm font-medium text-white">{fileName}.srt</span>
                  </div>
                  <button
                    onClick={() => { setFileName(""); setSegments([]); }}
                    className="p-1 hover:bg-zinc-800 rounded"
                  >
                    <X size={14} className="text-zinc-500" />
                  </button>
                </div>
                
                <div className="text-xs text-zinc-500">
                  {segments.length} segments • {formatTime(segments[segments.length - 1]?.endTime || 0)} duration
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
                    onClick={() => handleTranslateText(currentSegment.id, currentSegment.text)}
                    disabled={isSaving}
                    className="text-xs text-cyan-400 flex items-center gap-1 hover:text-cyan-300"
                  >
                    <Sparkles size={12} />
                    Translate
                  </button>
                </div>
                
                {/* Original Text */}
                <div>
                  <p className="text-xs text-zinc-500 mb-1">Original:</p>
                  <p className="text-sm text-zinc-300">{currentSegment.text}</p>
                </div>
                
                {/* Translated Text */}
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
                Segments ({segments.length})
              </h3>
              <button
                onClick={handleCopyAll}
                className="text-xs text-zinc-500 hover:text-white flex items-center gap-1"
              >
                {copied ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
                {copied ? "Copied" : "Copy All"}
              </button>
            </div>
            
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto space-y-2 pr-2"
            >
              {segments.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-zinc-500">
                  <FileJson size={32} strokeWidth={1} />
                  <p className="text-sm mt-2">Upload SRT file to edit</p>
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
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-zinc-500">
                            {segment.start} - {segment.end}
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