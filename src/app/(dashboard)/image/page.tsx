"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Image as ImageIcon, Download, Loader2, Sparkles, Wand2, 
  AlertCircle, X, Clock, Crop, Palette, Zap, 
  Maximize2, RotateCcw, History, ChevronDown
} from "lucide-react";
import { useUsage } from "@/components/layout/Sidebar";

// Image styles with visual indicators
const IMAGE_STYLES = [
  { id: "realistic", name: "Realistic", icon: "📷", desc: "Photorealistic images" },
  { id: "anime", name: "Anime", icon: "🎨", desc: "Japanese animation style" },
  { id: "digital", name: "Digital Art", icon: "🎭", desc: "Digital illustration" },
  { id: "abstract", name: "Abstract", icon: "🔮", desc: "Abstract art" },
  { id: "cyberpunk", name: "Cyberpunk", icon: "🌃", desc: "Futuristic neon" },
];

// Aspect ratios
const ASPECT_RATIOS = [
  { id: "1:1", name: "Square", width: 1024, height: 1024 },
  { id: "16:9", name: "Landscape", width: 1344, height: 768 },
  { id: "9:16", name: "Portrait", width: 768, height: 1344 },
  { id: "4:3", name: "Standard", width: 1152, height: 864 },
  { id: "3:4", name: "Tall", width: 864, height: 1152 },
];

interface GeneratedImage {
  id: string;
  image: string;
  prompt: string;
  style: string;
  aspectRatio: string;
  timestamp: number;
}

export default function ImagePage() {
  const [prompt, setPrompt] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<GeneratedImage[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState("realistic");
  const [selectedRatio, setSelectedRatio] = useState("1:1");
  const [showStyleDropdown, setShowStyleDropdown] = useState(false);
  const [showRatioDropdown, setShowRatioDropdown] = useState(false);
  const [seed, setSeed] = useState<number | null>(null);
  const { isPremium, limits } = useUsage();

  const generateSeed = () => Math.floor(Math.random() * 1000000);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isLoading) return;

    if (!isPremium && limits.image <= 0) {
      setError("Image generation limit reached! Please upgrade to premium.");
      return;
    }

    setIsLoading(true);
    setError(null);
    
    // Generate new seed for variation
    const newSeed = generateSeed();
    setSeed(newSeed);

    // Combine prompt with style
    const enhancedPrompt = `${prompt} --style ${selectedStyle} --ar ${selectedRatio.replace(":", "")}`;
    
    try {
      const res = await fetch("/api/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          prompt: enhancedPrompt,
          seed: newSeed,
          aspectRatio: selectedRatio
        }),
      });
      
      const data = await res.json();
      
      if (data.error) {
        setError(data.error);
      } else {
        const newImage = data.imageUrl || data.image;
        setImage(newImage);
        
        // Add to history
        const newEntry: GeneratedImage = {
          id: Date.now().toString(),
          image: newImage,
          prompt,
          style: selectedStyle,
          aspectRatio: selectedRatio,
          timestamp: Date.now(),
        };
        setHistory(prev => [newEntry, ...prev].slice(0, 20)); // Keep last 20
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
    setSeed(null);
  };

  const handleHistoryClick = (item: GeneratedImage) => {
    setImage(item.image);
    setPrompt(item.prompt);
    setSelectedStyle(item.style);
    setSelectedRatio(item.aspectRatio);
    setShowHistory(false);
  };

  const handleRegenerate = () => {
    const form = document.createElement('form');
    form.submit();
    const event = new Event('submit') as unknown as React.FormEvent;
    handleGenerate(event);
  };

  return (
    <div className="flex flex-col h-full bg-zinc-950 text-zinc-100 p-4 md:p-8 overflow-y-auto">
      <div className="max-w-5xl mx-auto w-full space-y-8">
        
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

        {/* Advanced Controls */}
        <div className="grid md:grid-cols-2 gap-4 p-4 bg-zinc-900/50 rounded-2xl border border-zinc-800">
          {/* Style Selector */}
          <div className="relative">
            <label className="block text-sm font-medium text-zinc-400 mb-2">
              <Palette size={14} className="inline mr-1" /> Art Style
            </label>
            <button
              onClick={() => { setShowStyleDropdown(!showStyleDropdown); setShowRatioDropdown(false); }}
              className="w-full flex items-center justify-between px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl hover:border-orange-500/50 transition-colors"
            >
              <span className="flex items-center gap-2">
                <span>{IMAGE_STYLES.find(s => s.id === selectedStyle)?.icon}</span>
                <span>{IMAGE_STYLES.find(s => s.id === selectedStyle)?.name}</span>
              </span>
              <ChevronDown size={16} className={`transition-transform ${showStyleDropdown ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {showStyleDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute z-20 w-full mt-2 bg-zinc-800 border border-zinc-700 rounded-xl shadow-xl overflow-hidden"
                >
                  {IMAGE_STYLES.map((style) => (
                    <button
                      key={style.id}
                      onClick={() => { setSelectedStyle(style.id); setShowStyleDropdown(false); }}
                      className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-zinc-700 transition-colors ${selectedStyle === style.id ? 'bg-orange-500/20 text-orange-400' : ''}`}
                    >
                      <span className="text-xl">{style.icon}</span>
                      <div className="text-left">
                        <div className="font-medium">{style.name}</div>
                        <div className="text-xs text-zinc-500">{style.desc}</div>
                      </div>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Aspect Ratio Selector */}
          <div className="relative">
            <label className="block text-sm font-medium text-zinc-400 mb-2">
              <Crop size={14} className="inline mr-1" /> Aspect Ratio
            </label>
            <button
              onClick={() => { setShowRatioDropdown(!showRatioDropdown); setShowStyleDropdown(false); }}
              className="w-full flex items-center justify-between px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl hover:border-orange-500/50 transition-colors"
            >
              <span className="flex items-center gap-2">
                <Maximize2 size={16} />
                <span>{ASPECT_RATIOS.find(r => r.id === selectedRatio)?.name}</span>
                <span className="text-zinc-500 text-sm">({selectedRatio})</span>
              </span>
              <ChevronDown size={16} className={`transition-transform ${showRatioDropdown ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {showRatioDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute z-20 w-full mt-2 bg-zinc-800 border border-zinc-700 rounded-xl shadow-xl overflow-hidden"
                >
                  {ASPECT_RATIOS.map((ratio) => (
                    <button
                      key={ratio.id}
                      onClick={() => { setSelectedRatio(ratio.id); setShowRatioDropdown(false); }}
                      className={`w-full flex items-center justify-between px-4 py-3 hover:bg-zinc-700 transition-colors ${selectedRatio === ratio.id ? 'bg-orange-500/20 text-orange-400' : ''}`}
                    >
                      <div className="flex items-center gap-3">
                        <Maximize2 size={16} />
                        <span className="font-medium">{ratio.name}</span>
                      </div>
                      <span className="text-zinc-500 text-sm">{ratio.width}x{ratio.height}</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Input Form */}
        <form onSubmit={handleGenerate} className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 to-amber-500 rounded-3xl blur opacity-25 group-hover:opacity-40 transition-opacity duration-500" />
          <div className="relative flex flex-col gap-4 p-4 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="A futuristic city with neon lights and flying cars, digital art style..."
              className="flex-1 bg-transparent border-none focus:ring-0 text-lg py-4 px-4 resize-none min-h-[100px] text-zinc-100 placeholder:text-zinc-600"
            />
            <div className="flex flex-col md:flex-row gap-4 items-stretch">
              {/* Quick Prompts */}
              <div className="flex-1 flex flex-wrap gap-2">
                {["Cyberpunk city", "Fantasy landscape", "Anime portrait", "Abstract art", "Space scene"].map((quick) => (
                  <button
                    key={quick}
                    type="button"
                    onClick={() => setPrompt(prev => prev ? `${prev}, ${quick}` : quick)}
                    className="px-3 py-1.5 text-sm bg-zinc-800 hover:bg-zinc-700 text-zinc-400 rounded-lg transition-colors"
                  >
                    + {quick}
                  </button>
                ))}
              </div>
              <button
                type="submit"
                disabled={!prompt.trim() || isLoading}
                className="md:w-48 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:hover:bg-orange-500 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-3 py-4 shadow-lg shadow-orange-500/20"
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
        <div className="relative min-h-[500px] flex items-center justify-center rounded-3xl border-2 border-dashed border-zinc-800 bg-zinc-900/30 overflow-hidden">
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
                  <div className="w-24 h-24 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <ImageIcon className="text-orange-500/50" size={32} />
                  </div>
                </div>
                <p className="text-zinc-400 font-medium animate-pulse">Creating your masterpiece...</p>
                <div className="flex items-center gap-2 text-zinc-500 text-sm">
                  <Zap size={14} />
                  <span>Style: {IMAGE_STYLES.find(s => s.id === selectedStyle)?.name}</span>
                  <span>•</span>
                  <span>Ratio: {selectedRatio}</span>
                </div>
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
                  className="w-full h-full object-contain rounded-2xl shadow-2xl max-h-[600px]"
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
                    onClick={handleRegenerate}
                    className="p-4 bg-orange-500 text-white rounded-full hover:scale-110 transition-transform flex items-center gap-2 font-bold"
                  >
                    <RotateCcw size={20} />
                    <span>Regenerate</span>
                  </button>
                  <button
                    onClick={handleClear}
                    className="p-4 bg-zinc-800 text-white rounded-full hover:scale-110 transition-transform flex items-center gap-2 font-bold"
                  >
                    <X size={20} />
                    <span>Clear</span>
                  </button>
                </div>
                {/* Image Info Badge */}
                <div className="absolute bottom-4 left-4 flex items-center gap-3 px-3 py-2 bg-black/60 backdrop-blur-sm rounded-lg text-sm">
                  <span className="text-zinc-400">
                    {IMAGE_STYLES.find(s => s.id === selectedStyle)?.icon} {IMAGE_STYLES.find(s => s.id === selectedStyle)?.name}
                  </span>
                  <span className="text-zinc-600">|</span>
                  <span className="text-zinc-400">{selectedRatio}</span>
                  {seed && (
                    <>
                      <span className="text-zinc-600">|</span>
                      <span className="text-zinc-500">#{seed}</span>
                    </>
                  )}
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

          {/* History Button */}
          {history.length > 0 && !image && (
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="absolute top-4 right-4 p-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors"
            >
              <History size={20} />
            </button>
          )}
        </div>

        {/* History Panel */}
        <AnimatePresence>
          {showHistory && history.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="p-4 bg-zinc-900/50 rounded-2xl border border-zinc-800"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-zinc-300 flex items-center gap-2">
                  <Clock size={18} /> Generation History
                </h3>
                <button
                  onClick={() => setShowHistory(false)}
                  className="p-1 hover:bg-zinc-800 rounded-lg"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {history.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleHistoryClick(item)}
                    className="relative group overflow-hidden rounded-xl border border-zinc-700 hover:border-orange-500/50 transition-colors"
                  >
                    <img
                      src={item.image}
                      alt={item.prompt}
                      className="w-full aspect-square object-cover"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-xs text-zinc-400 truncate px-2">{item.prompt.slice(0, 30)}...</div>
                        <div className="text-xs text-zinc-500 mt-1">{item.aspectRatio}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

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