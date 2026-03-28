'use client';

import { motion } from 'framer-motion';
import { 
  Settings as SettingsIcon, Palette, Type, Volume2, Moon, Sun, 
  Zap, Brain, Trash2, Download, Upload, Check, X, Loader2
} from 'lucide-react';
import { usePreferencesStore, useChatStore } from '@/stores/chatStore';
import { useAuthStore } from '@/stores/authStore';
import { useTheme } from '@/components/providers/ThemeProvider';
import { AI_MODELS, AIModelType } from '@/lib/ai';
import { cn } from '@/lib/utils';
import { useState, useRef } from 'react';

const Toggle = ({ enabled, onChange }: { enabled: boolean; onChange: () => void }) => (
  <button
    onClick={onChange}
    className={cn('w-14 h-8 rounded-full transition-all relative', enabled ? 'bg-primary' : 'bg-muted')}
  >
    <span className={cn('absolute top-1 w-6 h-6 rounded-full bg-white transition-all', enabled ? 'left-7' : 'left-1')} />
  </button>
);

export default function SettingsPage() {
  const { preferences, updatePreferences } = usePreferencesStore();
  const { chats, clearChats } = useChatStore();
  const { user, isAuthenticated } = useAuthStore();
  const { theme, setTheme } = useTheme();
  
  const [defaultModel, setDefaultModel] = useState<AIModelType>('flash');
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
            <SettingsIcon className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold">Settings</h1>
          </div>
          <p className="text-muted-foreground">Customize your AI chat experience</p>
        </motion.div>

        <div className="space-y-6">{/* Theme */}<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass rounded-2xl p-6"><div className="flex items-center gap-3 mb-4"><Palette className="w-5 h-5 text-primary" /><h2 className="text-xl font-semibold">Theme</h2></div><div className="flex gap-4"><button onClick={() => setTheme('dark')} className={cn('flex-1 p-4 rounded-xl border', theme === 'dark' ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50')}><Moon className="w-6 h-6 mx-auto mb-2" /><span className="text-sm font-medium">Dark</span></button><button onClick={() => setTheme('light')} className={cn('flex-1 p-4 rounded-xl border', theme === 'light' ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50')}><Sun className="w-6 h-6 mx-auto mb-2" /><span className="text-sm font-medium">Light</span></button></div></motion.div>{/* Font Size */}<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass rounded-2xl p-6"><div className="flex items-center gap-3 mb-4"><Type className="w-5 h-5 text-primary" /><h2 className="text-xl font-semibold">Font Size</h2></div><div className="flex gap-4">{(['small', 'medium', 'large'] as const).map((size) => (<button key={size} onClick={() => updatePreferences({ fontSize: size })} className={cn('flex-1 p-4 rounded-xl border', preferences.fontSize === size ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50')}><span className={cn('font-medium', size === 'small' && 'text-sm', size === 'medium' && 'text-base', size === 'large' && 'text-lg')}>{size.charAt(0).toUpperCase() + size.slice(1)}</span></button>))}</div></motion.div>{/* Default Model */}<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass rounded-2xl p-6"><div className="flex items-center gap-3 mb-4"><Brain className="w-5 h-5 text-primary" /><h2 className="text-xl font-semibold">Default AI Model</h2></div><div className="grid grid-cols-3 gap-4">{Object.entries(AI_MODELS).map(([key, model]) => (<button key={key} onClick={() => setDefaultModel(key as AIModelType)} className={cn('p-4 rounded-xl border', defaultModel === key ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50')}><Zap className="w-5 h-5 mx-auto mb-2 text-primary" /><span className="text-sm font-medium text-center block">{model.displayName}</span></button>))}</div></motion.div>{/* Streaming */}<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass rounded-2xl p-6"><div className="flex items-center justify-between"><div className="flex items-center gap-3"><Zap className="w-5 h-5 text-primary" /><div><h2 className="text-xl font-semibold">Streaming Response</h2><p className="text-sm text-muted-foreground">Show AI response as it generates</p></div></div><Toggle enabled={preferences.streaming} onChange={() => updatePreferences({ streaming: !preferences.streaming })} /></div></motion.div>{/* Sound */}<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="glass rounded-2xl p-6"><div className="flex items-center justify-between"><div className="flex items-center gap-3"><Volume2 className="w-5 h-5 text-primary" /><div><h2 className="text-xl font-semibold">Sound Effects</h2><p className="text-sm text-muted-foreground">Play sounds for notifications</p></div></div><Toggle enabled={preferences.soundEnabled} onChange={() => updatePreferences({ soundEnabled: !preferences.soundEnabled })} /></div></motion.div>{/* Data Management */}<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="glass rounded-2xl p-6"><h2 className="text-xl font-semibold mb-4 flex items-center gap-3"><Trash2 className="w-5 h-5 text-primary" />Data Management</h2><div className="space-y-4"><div className="flex items-center justify-between p-4 rounded-xl bg-black/20"><div><p className="font-medium">Saved Conversations</p><p className="text-sm text-muted-foreground">{chats.length} chats</p></div></div><button onClick={handleExportChats} className="w-full flex items-center justify-center gap-2 p-4 rounded-xl border border-border hover:border-primary/50"><Download className="w-5 h-5" />Export All Chats</button><input type="file" ref={fileInputRef} accept=".json" className="hidden" /><button onClick={() => fileInputRef.current?.click()} className="w-full flex items-center justify-center gap-2 p-4 rounded-xl border border-border hover:border-primary/50"><Upload className="w-5 h-5" />Import Chats</button>{showClearConfirm ? (<div className="flex items-center gap-2 p-4 rounded-xl bg-destructive/10 border border-destructive/30"><p className="text-sm flex-1">Delete all chats?</p><button onClick={handleClearChats} disabled={isClearing} className="p-2 rounded-lg bg-destructive text-white">{isClearing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}</button><button onClick={() => setShowClearConfirm(false)} className="p-2 rounded-lg bg-muted"><X className="w-4 h-4" /></button></div>) : (<button onClick={() => setShowClearConfirm(true)} className="w-full flex items-center justify-center gap-2 p-4 rounded-xl border border-destructive/30 text-destructive hover:bg-destructive/10"><Trash2 className="w-5 h-5" />Clear All Chats</button>)}</div></motion.div>{/* Account */}<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="glass rounded-2xl p-6"><h2 className="text-xl font-semibold mb-4">Account</h2><div className="space-y-2"><p className="text-sm text-muted-foreground">{isAuthenticated ? `Signed in as ${user?.email}` : 'Not signed in'}</p><a href="/login" className="text-primary hover:underline text-sm">{isAuthenticated ? 'Switch Account' : 'Sign In'}</a></div></motion.div></div></div></div>
  );
}