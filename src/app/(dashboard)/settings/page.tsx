"use client";

import { useState } from "react";
import { Settings as SettingsIcon, User, Bell, Shield, Moon, Globe, Palette, Database, Key, X, Save, Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";

export default function SettingsPage() {
  const [showApiModal, setShowApiModal] = useState(false);
  const [showKeys, setShowKeys] = useState<{[key: string]: boolean}>({});
  
  const [keys, setKeys] = useState({
    gemini: typeof window !== "undefined" ? localStorage.getItem("GEMINI_API_KEY") || "" : "",
    huggingface: typeof window !== "undefined" ? localStorage.getItem("HUGGINGFACE_API_KEY") || "" : "",
    stability: typeof window !== "undefined" ? localStorage.getItem("STABILITY_API_KEY") || "" : "",
    groq: typeof window !== "undefined" ? localStorage.getItem("GROQ_API_KEY") || "" : "",
  });

  const sections = [
    {
      title: "Account",
      icon: User,
      items: [
        { label: "Profile Information", desc: "Update your name and email address", path: "/profile" },
        { label: "Password", desc: "Change your account password", path: "/reset-password" },
      ]
    },
    {
      title: "Preferences",
      icon: Palette,
      items: [
        { label: "Appearance", desc: "Customize the look and feel of the app" },
        { label: "Notifications", desc: "Manage your notification settings" },
      ]
    },
    {
      title: "Privacy & Security",
      icon: Shield,
      items: [
        { label: "Two-Factor Authentication", desc: "Add an extra layer of security" },
        { label: "Data Privacy", desc: "Manage how your data is used" },
      ]
    },
    {
      title: "Developer Settings",
      icon: Database,
      items: [
        { label: "API Configuration", desc: "Configure your own AI API keys" },
        { label: "Model Selection", desc: "Choose your preferred AI model" },
      ]
    }
  ];

  const saveKeys = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("GEMINI_API_KEY", keys.gemini);
      localStorage.setItem("HUGGINGFACE_API_KEY", keys.huggingface);
      localStorage.setItem("STABILITY_API_KEY", keys.stability);
      localStorage.setItem("GROQ_API_KEY", keys.groq);
    }
    setShowApiModal(false);
  };

  const toggleShowKey = (key: string) => {
    setShowKeys(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="flex flex-col h-full bg-zinc-950 text-zinc-100 p-4 md:p-8 overflow-y-auto">
      <div className="max-w-4xl mx-auto w-full space-y-10">
        
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-orange-500 text-sm font-bold uppercase tracking-widest">
            <SettingsIcon size={14} /> Settings
          </div>
          <h2 className="text-4xl font-extrabold text-white">Settings</h2>
          <p className="text-zinc-500">Manage your account settings and preferences.</p>
        </div>

        {/* Sections */}
        <div className="space-y-8">
          {sections.map((section, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-3 text-orange-500">
                <section.icon size={20} />
                <h3 className="text-lg font-bold text-white">{section.title}</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {section.items.map((item, j) => (
                  <button
                    key={j}
                    onClick={() => item.label === "API Configuration" && setShowApiModal(true)}
                    className="p-6 bg-zinc-900 border border-zinc-800 rounded-2xl text-left hover:border-orange-500/50 transition-all group"
                  >
                    <h4 className="font-bold text-zinc-200 group-hover:text-orange-500 transition-colors">{item.label}</h4>
                    <p className="text-sm text-zinc-500 mt-1">{item.desc}</p>
                  </button>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

      </div>

      {/* API Configuration Modal */}
      {showApiModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-3xl p-6 space-y-6"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Key size={20} className="text-orange-500" />
                API Configuration
              </h3>
              <button onClick={() => setShowApiModal(false)} className="text-zinc-500 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <p className="text-sm text-zinc-500">သင့်အလိုက် API keys ထည့်ပါ။ ဗလာထားပါပါ ပါဝင်ပတ်သက် key များသုံးပါ။</p>

            <div className="space-y-4">
              {[
                { key: "gemini", label: "Google Gemini API Key", placeholder: "AIza..." },
                { key: "groq", label: "Groq API Key", placeholder: "gsk_" },
                { key: "huggingface", label: "Hugging Face API Key", placeholder: "hf_..." },
                { key: "stability", label: "Stability AI API Key", placeholder: "sk-" },
              ].map((api) => (
                <div key={api.key} className="space-y-2">
                  <label className="text-sm font-bold text-zinc-300">{api.label}</label>
                  <div className="relative">
                    <input
                      type={showKeys[api.key] ? "text" : "password"}
                      value={keys[api.key as keyof typeof keys]}
                      onChange={(e) => setKeys({ ...keys, [api.key]: e.target.value })}
                      placeholder={api.placeholder}
                      className="w-full p-3 pr-10 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 placeholder:text-zinc-600"
                    />
                    <button
                      type="button"
                      onClick={() => toggleShowKey(api.key)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500"
                    >
                      {showKeys[api.key] ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button onClick={saveKeys} className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl flex items-center justify-center gap-2">
              <Save size={18} />
              သိမ်းပါ
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
