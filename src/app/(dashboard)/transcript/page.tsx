"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Loader2, Sparkles, AlertCircle, X, Copy, Check, 
  Download, Languages, FileText, Clock, ExternalLink, Mic
} from "lucide-react";

export default function TranscriptPage() {
  const [pastedText, setPastedText] = useState("");
  const [transcript, setTranscript] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [videoTitle, setVideoTitle] = useState<string>("");
  const [isTranslated, setIsTranslated] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleTranslate = async () => {
    if (!pastedText.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          text: pastedText,
          targetLang: "my"
        }),
      });
      
      const data = await res.json();
      
      if (data.error) {
        setError(data.error);
      } else if (data.translatedText) {
        setTranscript(data.translatedText);
        setVideoTitle("Pasted Text");
        setIsTranslated(true);
      }
    } catch (err) {
      console.error("Translation failed:", err);
      setError("Failed to translate text. Please try again.");
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
    link.download = `transcript-${videoTitle || 'translated'}.txt`;
    link.click();
  };

  const handleClear = () => {
    setPastedText("");
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
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-500 text-sm font-medium">
            <Languages size={14} />
            <span>Text Translator</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
            Translate Text to Myanmar
          </h2>
          <p className="text-zinc-500 max-w-xl mx-auto text-lg">
            Paste any text and translate it to Myanmar language instantly.
          </p>
        </div>

        {/* External Tools Links */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* YouTube to Transcript */}
          <a
            href="https://youtubetotranscript.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 p-4 bg-zinc-900/50 hover:bg-zinc-900 border border-zinc-800 rounded-2xl transition-all group"
          >
            <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center">
              <FileText size={24} className="text-red-500" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-white group-hover:text-red-400 transition-colors">
                YouTube Transcript
              </h3>
              <p className="text-sm text-zinc-500">
                Get transcript from YouTube videos
              </p>
            </div>
            <ExternalLink size={20} className="text-zinc-500 group-hover:text-red-400" />
          </a>

          {/* Burmese Voice */}
          <a
            href="https://crikk.com/text-to-speech"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 p-4 bg-zinc-900/50 hover:bg-zinc-900 border border-zinc-800 rounded-2xl transition-all group"
          >
            <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
              <Mic size={24} className="text-purple-500" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-white group-hover:text-purple-400 transition-colors">
                Burmese Voice
              </h3>
              <p className="text-sm text-zinc-500">
                Convert text to Burmese speech
              </p>
            </div>
            <ExternalLink size={20} className="text-zinc-500 group-hover:text-purple-400" />
          </a>
        </div>

        {/* Input Area */}
        <div className="space-y-4">
          <textarea
            value={pastedText}
            onChange={(e) => setPastedText(e.target.value)}
            placeholder="Paste text here to translate to Myanmar..."
            className="w-full h-40 p-4 bg-zinc-900 border border-zinc-800 rounded-2xl text-white placeholder-zinc-500 focus:border-orange-500/50 focus:outline-none transition-colors resize-none"
          />
          <button
            onClick={handleTranslate}
            disabled={isLoading || !pastedText.trim()}
            className="w-full py-4 bg-orange-500 hover:bg-orange-600 disabled:bg-zinc-800 disabled:text-zinc-500 text-white font-bold rounded-2xl transition-colors flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Translating...</span>
              </>
            ) : (
              <>
                <Sparkles size={18} />
                <span>Translate to Myanmar</span>
              </>
            )}
          </button>
        </div>

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

        {/* Translation Result */}
        {transcript && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-zinc-900/50 rounded-2xl border border-zinc-800 overflow-hidden"
          >
            {/* Header & Actions */}
            <div className="p-4 border-b border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center">
                  <Languages size={24} className="text-orange-500" />
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

            {/* Content */}
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
                <span>Translated to Myanmar</span>
              </div>
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
              <div className="w-20 h-20 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Languages className="text-orange-500/50" size={32} />
              </div>
            </div>
            <p className="text-zinc-400 font-medium mt-4 animate-pulse">Translating to Myanmar...</p>
            <p className="text-zinc-500 text-sm mt-2">Please wait</p>
          </motion.div>
        )}

        {/* Empty State */}
        {!transcript && !isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-16 text-zinc-600"
          >
            <Languages size={64} strokeWidth={1} />
            <p className="text-lg font-medium mt-4">Paste text to translate</p>
            <p className="text-sm text-zinc-500 mt-2">The text will be translated to Myanmar language</p>
          </motion.div>
        )}

      </div>
    </div>
  );
}