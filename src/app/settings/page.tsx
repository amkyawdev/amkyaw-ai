'use client';

import { motion } from 'framer-motion';
import { Settings as SettingsIcon, Palette, Moon, Sun, Zap, Trash2, Download, Check, X, Loader2, Cpu } from 'lucide-react';
import { usePreferencesStore, useChatStore } from '@/stores/chatStore';
import { GROQ_MODELS } from '@/lib/groq';
import { cn } from '@/lib/utils';
import { useState } from 'react';

const Toggle = ({ enabled, onChange }: { enabled: boolean; onChange: () => void }) => (
  <button onClick={onChange} className={cn('w-14 h-8 rounded-full transition-all relative', enabled ? 'bg-orange-500' : 'bg-muted')}>
    <span className={cn('absolute top-1 w-6 h-6 rounded-full bg-white transition-all', enabled ? 'left-7' : 'left-1')} />
  </button>
);

type GroqModelType = keyof typeof GROQ_MODELS;

export default function SettingsPage() {
  const { preferences, updatePreferences } = usePreferencesStore();
  const { chats, clearChats } = useChatStore();
  
  const [defaultModel, setDefaultModel] = useState<GroqModelType>('llama-3.1-8b');
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  const handleClearChats = async () => {
    setIsClearing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    clearChats();
    setIsClearing(false);
    setShowClearConfirm(false);
  };

  const handleExportChats = () => {
    const data = JSON.stringify(chats, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `amkyaw-ai-chats-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <SettingsIcon className="w-8 h-8 text-orange-500" />
            <h1 className="text-3xl font-bold">Settings</h1>
          </div>
          <p className="text-muted-foreground">Customize your AI chat experience</p>
        </motion.div>

        <div className="space-y-6">
          {/* Theme */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} 
            className="glass rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Palette className="w-5 h-5 text-orange-500" />
              <h2 className="text-xl font-semibold">Theme</h2>
            </div>
            <div className="flex gap-4">
              <button onClick={() => updatePreferences({ theme: 'dark' })} 
                className={cn('flex-1 p-4 rounded-xl border', preferences.theme === 'dark' ? 'border-orange-500 bg-orange-500/10' : 'border-border hover:border-orange-500/50')}>
                <Moon className="w-6 h-6 mx-auto mb-2" />
                <span className="text-sm font-medium">Dark</span>
              </button>
              <button onClick={() => updatePreferences({ theme: 'light' })} 
                className={cn('flex-1 p-4 rounded-xl border', preferences.theme === 'light' ? 'border-orange-500 bg-orange-500/10' : 'border-border hover:border-orange-500/50')}>
                <Sun className="w-6 h-6 mx-auto mb-2" />
                <span className="text-sm font-medium">Light</span>
              </button>
            </div>
          </motion.div>

          {/* Default Model */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} 
            className="glass rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Cpu className="w-5 h-5 text-orange-500" />
              <h2 className="text-xl font-semibold">Default AI Model (Groq)</h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(GROQ_MODELS).map(([key, model]) => (
                <button key={key} onClick={() => setDefaultModel(key as GroqModelType)} 
                  className={cn('p-4 rounded-xl border text-left', defaultModel === key ? 'border-orange-500 bg-orange-500/10' : 'border-border hover:border-orange-500/50')}>
                  <p className="font-medium">{model.displayName}</p>
                  <p className="text-xs text-muted-foreground">{model.description}</p>
                </button>
              ))}
            </div>
          </motion.div>

          {/* Streaming */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} 
            className="glass rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Zap className="w-5 h-5 text-orange-500" />
                <div>
                  <h2 className="text-xl font-semibold">Streaming Response</h2>
                  <p className="text-sm text-muted-foreground">Show AI response as it generates</p>
                </div>
              </div>
              <Toggle enabled={preferences.streaming} onChange={() => updatePreferences({ streaming: !preferences.streaming })} />
            </div>
          </motion.div>

          {/* Data Management */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} 
            className="glass rounded-2xl p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-3">
              <Trash2 className="w-5 h-5 text-orange-500" />Data Management
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl bg-black/20">
                <p className="font-medium">Saved Conversations</p>
                <p className="text-muted-foreground">{chats.length} chats</p>
              </div>
              <button onClick={handleExportChats} className="w-full flex items-center justify-center gap-2 p-4 rounded-xl border border-border hover:border-orange-500/50">
                <Download className="w-5 h-5" />Export All Chats
              </button>
              {showClearConfirm ? (
                <div className="flex items-center gap-2 p-4 rounded-xl bg-destructive/10 border border-destructive/30">
                  <p className="text-sm flex-1">Delete all chats?</p>
                  <button onClick={handleClearChats} disabled={isClearing} className="p-2 rounded-lg bg-destructive text-white">
                    {isClearing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  </button>
                  <button onClick={() => setShowClearConfirm(false)} className="p-2 rounded-lg bg-muted"><X className="w-4 h-4" /></button>
                </div>
              ) : (
                <button onClick={() => setShowClearConfirm(true)} className="w-full flex items-center justify-center gap-2 p-4 rounded-xl border border-destructive/30 text-destructive hover:bg-destructive/10">
                  <Trash2 className="w-5 h-5" />Clear All Chats
                </button>
              )}
            </div>
          </motion.div>

          {/* About */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} 
            className="glass rounded-2xl p-6">
            <h2 className="text-xl font-semibold mb-4">About</h2>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>Amkyaw AI Power Platform v1.0</p>
              <p>Powered by Groq API</p>
              <p>Developed by Aung Myo Kyaw</p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}