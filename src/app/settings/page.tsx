"use client";

import { useState } from "react";
import { Settings as SettingsIcon, Moon, Sun, Type, Globe, Trash2, Download, Bell, Shield, Key } from "lucide-react";

export default function SettingsPage() {
  const [darkMode, setDarkMode] = useState(true);
  const [fontSize, setFontSize] = useState("medium");
  const [language, setLanguage] = useState("en");

  return (
    <div className="flex flex-col h-full bg-zinc-950 text-zinc-100 p-4 md:p-8 overflow-y-auto">
      <div className="max-w-2xl mx-auto w-full space-y-8">
        
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-orange-500 text-sm font-bold uppercase tracking-widest">
            <SettingsIcon size={14} /> Settings
          </div>
          <h2 className="text-3xl font-extrabold text-white">Preferences</h2>
          <p className="text-zinc-500">Customize your experience</p>
        </div>

        {/* Appearance */}
        <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-2xl space-y-6">
          <h3 className="font-bold text-white">Appearance</h3>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {darkMode ? <Moon size={20} className="text-orange-500" /> : <Sun size={20} className="text-amber-500" />}
              <span className="text-zinc-300">Dark Mode</span>
            </div>
            <button onClick={() => setDarkMode(!darkMode)} className={`w-14 h-8 rounded-full transition-all ${darkMode ? "bg-orange-500" : "bg-zinc-700"}`}>
              <div className={`w-6 h-6 bg-white rounded-full transition-transform ${darkMode ? "translate-x-6" : "translate-x-1"}`} />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Type size={20} className="text-zinc-500" />
              <span className="text-zinc-300">Font Size</span>
            </div>
            <div className="flex gap-2">
              {["small", "medium", "large"].map((size) => (
                <button key={size} onClick={() => setFontSize(size)} className={`px-4 py-2 rounded-lg text-sm font-bold uppercase ${fontSize === size ? "bg-orange-500 text-white" : "bg-zinc-950 text-zinc-500"}`}>
                  {size}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Language */}
        <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-2xl space-y-6">
          <h3 className="font-bold text-white">Language</h3>
          <div className="flex items-center gap-3">
            <Globe size={20} className="text-zinc-500" />
            <select value={language} onChange={(e) => setLanguage(e.target.value)} className="flex-1 p-3 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100">
              <option value="en">English</option>
              <option value="my">Myanmar (မြန်မာ)</option>
            </select>
          </div>
        </div>

        {/* Data */}
        <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-2xl space-y-6">
          <h3 className="font-bold text-white">Data Management</h3>
          <div className="flex gap-3">
            <button className="flex-1 flex items-center justify-center gap-2 p-3 bg-zinc-950 border border-zinc-800 rounded-xl hover:bg-zinc-800 transition-all">
              <Download size={18} className="text-zinc-500" />
              <span className="text-sm">Export Data</span>
            </button>
            <button className="flex-1 flex items-center justify-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl hover:bg-red-500/20 transition-all text-red-400">
              <Trash2 size={18} />
              <span className="text-sm">Clear Chat</span>
            </button>
          </div>
        </div>

        {/* About */}
        <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-2xl">
          <div className="text-center space-y-2">
            <p className="text-zinc-500 text-sm">Amkyaw AI Power Platform v1.2</p>
            <p className="text-zinc-600 text-xs">Powered by Groq & Gemini</p>
          </div>
        </div>

      </div>
    </div>
  );
}
