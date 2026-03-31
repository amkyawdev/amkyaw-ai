"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Image as ImageIcon, Download, Loader2, Sparkles, Wand2, AlertCircle, X } from "lucide-react";
import { useUsage } from "@/components/layout/Sidebar";

export default function ImagePage() {
  const [prompt, setPrompt] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isPremium, limits } = useUsage();

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isLoading) return;

    if (!isPremium && limits.image <= 0) {
      setError("Image generation limit reached! Please upgrade to premium.");
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const res = await fetch("/api/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      
      const data = await res.json();
      
      if (data.error) {
        setError(data.errorMy || data.error);
      } else {
        setImage(data.image);
      }
    } catch (err) {
      console.error("Failed to generate image:", err);
      setError("Failed to generate image. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (!image) return;
    const link = document.createElement("a");
    link.href = image;
    link.download = `amkyaw-ai-${Date.now()}.png`;
    link.click();
  };

  const handleClear = () => {
    setImage(null);
    setPrompt("");
  };

  return (
    <div className="flex flex-col h-full bg-zinc-950 text-zinc-100 p-4 md:p-8 overflow-y-auto">
      <div className="max-w-4xl mx-auto w-full space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-500 text-sm font-medium">
            <Sparkles size={14} />
            <span>AI Image Generation</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
            Turn your imagination into reality
          </h2>
          <p className="text-zinc-500 max-w-xl mx-auto text-lg">
            Describe what you want to see, and our AI will generate a unique image for you in seconds.
          </p>
        </div>

        {/* Input Form */}
        <form onSubmit={handleGenerate} className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 to-amber-500 rounded-3xl blur opacity-25 group-hover:opacity-40 transition-opacity duration-500" />
          <div className="relative flex flex-col md:flex-row gap-4 p-4 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="A futuristic city with neon lights and flying cars, digital art style..."
              className="flex-1 bg-transparent border-none focus:ring-0 text-lg py-4 px-4 resize-none min-h-[100px] text-zinc-100 placeholder:text-zinc-600"
            />
            <button
              type="submit"
              disabled={!prompt.trim() || isLoading}
              className="md:w-48 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:hover:bg-orange-500 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-3 py-4 md:py-0 shadow-lg shadow-orange-500/20"
            >
              {isLoading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  <Wand2 size={20} />
                  <span>Generate</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Error Message */}
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400"
          >
            <AlertCircle size={20} />
            <span>{error}</span>
            <button onClick={() => setError(null)} className="ml-auto hover:text-red-300">
              <X size={18} />
            </button>
          </motion.div>
        )}

        {/* Result Area */}
        <div className="relative min-h-[400px] flex items-center justify-center rounded-3xl border-2 border-dashed border-zinc-800 bg-zinc-900/30 overflow-hidden">
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-4"
              >
                <div className="relative">
                  <div className="w-20 h-20 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <ImageIcon className="text-orange-500/50" size={24} />
                  </div>
                </div>
                <p className="text-zinc-400 font-medium animate-pulse">Creating your masterpiece...</p>
              </motion.div>
            ) : image ? (
              <motion.div
                key="image"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative w-full h-full group/img"
              >
                <img
                  src={image}
                  alt="Generated"
                  className="w-full h-full object-contain rounded-2xl shadow-2xl max-h-[500px]"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center gap-4">
                  <button
                    onClick={handleDownload}
                    className="p-4 bg-white text-black rounded-full hover:scale-110 transition-transform flex items-center gap-2 font-bold"
                  >
                    <Download size={20} />
                    <span>Download</span>
                  </button>
                  <button
                    onClick={handleClear}
                    className="p-4 bg-zinc-800 text-white rounded-full hover:scale-110 transition-transform flex items-center gap-2 font-bold"
                  >
                    <X size={20} />
                    <span>Clear</span>
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center gap-4 text-zinc-600"
              >
                <ImageIcon size={64} strokeWidth={1} />
                <p className="text-lg font-medium">Your image will appear here</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Tips */}
        <div className="grid md:grid-cols-3 gap-4 text-center">
          {[
            { title: "Be Specific", desc: "Describe details like style, colors, lighting" },
            { title: "Try Styles", desc: "Add art styles like anime, photorealistic, abstract" },
            { title: "Start Simple", desc: "Begin with a clear subject, then add complexity" },
          ].map((tip, i) => (
            <div key={i} className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/50">
              <h4 className="font-bold text-zinc-300 mb-1">{tip.title}</h4>
              <p className="text-sm text-zinc-500">{tip.desc}</p>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}