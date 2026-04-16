"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Youtube, Loader2, Sparkles, AlertCircle, X, Copy, Check, 
  Download, Languages, FileText, Clock
} from "lucide-react";

// YouTube video ID extraction
const extractVideoId = (url: string): string | null => {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/shorts\/([^&\n?#]+)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
};

export default function TranscriptPage() {
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [transcript, setTranscript] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [videoTitle, setVideoTitle] = useState<string>("");
  const [isTranslated, setIsTranslated] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleExtract = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!youtubeUrl.trim() || isLoading) return;

    const videoId = extractVideoId(youtubeUrl);
    if (!videoId) {
      setError("Invalid YouTube URL! Please enter a valid YouTube link.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setTranscript("");
    setVideoTitle("");
    setIsTranslated(false);

    try {
      // Call API to get transcript
      const res = await fetch("/api/transcript", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          youtubeUrl,
          videoId 
        }),
      });
      
      const data = await res.json();
      
      if (data.error) {
        setError(data.error);
      } else {
        setTranscript(data.transcript || "");
        setVideoTitle(data.title || "YouTube Video");
        // Auto-translate to Myanmar
        if (data.transcript) {
          await handleTranslate(data.transcript);
        }
      }
    } catch (err) {
      console.error("Failed to extract transcript:", err);
      setError("Failed to extract transcript. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTranslate = async (text: string) => {
    if (!text) return;
    
    setIsLoading(true);
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
        setTranscript(data.translatedText);
        setIsTranslated(true);
      }
    } catch (err) {
      console.error("Translation failed:", err);
      // Keep original transcript if translation fails
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!transcript) return;
    navigator.clipboard.writeText(transcript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!transcript) return;
    const blob = new Blob([transcript], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `transcript-${videoTitle || 'youtube'}.txt`;
    link.click();
  };

  const handleClear = () => {
    setYoutubeUrl("");
    setTranscript("");
    setVideoTitle("");
    setError(null);
    setIsTranslated(false);
  };

  return (
    <div className="flex flex-col h-full bg-zinc-950 text-zinc-100 p-4 md:p-8 overflow-y-auto">
      <div className="max-w-4xl mx-auto w-full space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-medium">
            <Youtube size={14} />
            <span>YouTube Transcript</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
            Extract & Translate YouTube Transcripts
          </h2>
          <p className="text-zinc-500 max-w-xl mx-auto text-lg">
            Enter a YouTube link to automatically extract the transcript and translate it to Myanmar language.
          </p>
        </div>

        {/* Input Form */}
        <form onSubmit={handleExtract} className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">
                <Youtube size={20} />
              </div>
              <input
                type="text"
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                placeholder="Paste YouTube URL here (e.g., https://www.youtube.com/watch?v=...)"
                className="w-full pl-12 pr-4 py-4 bg-zinc-900 border border-zinc-800 rounded-2xl text-white placeholder-zinc-500 focus:border-red-500/50 focus:outline-none transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading || !youtubeUrl.trim()}
              className="px-8 py-4 bg-red-500 hover:bg-red-600 disabled:bg-zinc-800 disabled:text-zinc-500 text-white font-bold rounded-2xl transition-colors flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Extracting...</span>
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  <span>Extract</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400"
            >
              <AlertCircle size={20} />
              <span>{error}</span>
              <button onClick={() => setError(null)} className="ml-auto hover:text-red-300">
                <X size={18} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Transcript Result */}
        {transcript && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-zinc-900/50 rounded-2xl border border-zinc-800 overflow-hidden"
          >
            {/* Video Info & Actions */}
            <div className="p-4 border-b border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center">
                  <Youtube size={24} className="text-red-500" />
                </div>
                <div>
                  <h3 className="font-bold text-white">{videoTitle}</h3>
                  <p className="text-sm text-zinc-500 flex items-center gap-2">
                    <FileText size={14} />
                    <span>{transcript.split('\n').length} lines</span>
                    {isTranslated && (
                      <>
                        <span className="text-zinc-600">•</span>
                        <span className="text-orange-400 flex items-center gap-1">
                          <Languages size={14} />
                          <span>Myanmar</span>
                        </span>
                      </>
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="p-3 bg-zinc-800 hover:bg-zinc-700 rounded-xl transition-colors flex items-center gap-2 text-sm"
                >
                  {copied ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
                  <span>{copied ? "Copied!" : "Copy"}</span>
                </button>
                <button
                  onClick={handleDownload}
                  className="p-3 bg-zinc-800 hover:bg-zinc-700 rounded-xl transition-colors flex items-center gap-2 text-sm"
                >
                  <Download size={18} />
                  <span>Download</span>
                </button>
                <button
                  onClick={handleClear}
                  className="p-3 bg-zinc-800 hover:bg-zinc-700 rounded-xl transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Transcript Content */}
            <div className="p-6 max-h-[500px] overflow-y-auto">
              <div className="space-y-3">
                {transcript.split('\n').map((line, index) => (
                  line.trim() && (
                    <p key={index} className="text-zinc-300 leading-relaxed">
                      {line}
                    </p>
                  )
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-zinc-800 bg-zinc-950/50 flex items-center justify-between">
              <div className="flex items-center gap-2 text-zinc-500 text-sm">
                <Clock size={14} />
                <span>Auto-extracted from YouTube</span>
              </div>
              {!isTranslated && (
                <button
                  onClick={() => handleTranslate(transcript)}
                  disabled={isLoading}
                  className="px-4 py-2 bg-orange-500 hover:bg-orange-600 disabled:bg-zinc-800 text-white text-sm font-medium rounded-xl flex items-center gap-2"
                >
                  <Languages size={14} />
                  <span>Translate to Myanmar</span>
                </button>
              )}
            </div>
          </motion.div>
        )}

        {/* Loading State */}
        {isLoading && !transcript && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-16"
          >
            <div className="relative">
              <div className="w-20 h-20 border-4 border-red-500/20 border-t-red-500 rounded-full animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Youtube className="text-red-500/50" size={32} />
              </div>
            </div>
            <p className="text-zinc-400 font-medium mt-4 animate-pulse">Extracting transcript...</p>
            <p className="text-zinc-500 text-sm mt-2">This may take a few seconds</p>
          </motion.div>
        )}

        {/* Empty State */}
        {!transcript && !isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-16 text-zinc-600"
          >
            <FileText size={64} strokeWidth={1} />
            <p className="text-lg font-medium mt-4">Enter a YouTube URL to get started</p>
            <p className="text-sm text-zinc-500 mt-2">The transcript will be automatically translated to Myanmar</p>
          </motion.div>
        )}

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-4 text-center">
          {[
            { title: "Auto Extract", desc: "Automatically extract subtitles from any YouTube video" },
            { title: "Myanmar Translation", desc: "Instantly translate transcripts to Myanmar language" },
            { title: "Download & Copy", desc: "Save transcript as text file or copy to clipboard" },
          ].map((feature, i) => (
            <div key={i} className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/50">
              <h4 className="font-bold text-zinc-300 mb-1">{feature.title}</h4>
              <p className="text-sm text-zinc-500">{feature.desc}</p>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}