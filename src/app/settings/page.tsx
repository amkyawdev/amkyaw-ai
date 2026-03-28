'use client';

import { motion } from 'framer-motion';
import { Settings as SettingsIcon, Palette, Type, Volume2, Moon, Sun, Zap, Brain } from 'lucide-react';
import { usePreferencesStore } from '@/stores/chatStore';
import { AI_MODELS, AIModelType } from '@/lib/ai';
import { cn } from '@/lib/utils';
import { useState } from 'react';

export default function SettingsPage() {
  const { preferences, updatePreferences } = usePreferencesStore();
  const [selectedDefaultModel, setSelectedDefaultModel] = useState<AIModelType>('flash8b');

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <SettingsIcon className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold">Settings</h1>
          </div>
          <p className="text-muted-foreground">
            Customize your AI chat experience
          </p>
        </motion.div>

        <div className="space-y-6">
          {/* Theme Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass rounded-2xl p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <Palette className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold">Theme</h2>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => updatePreferences({ theme: 'dark' })}
                className={cn(
                  'flex-1 p-4 rounded-xl border transition-all flex flex-col items-center gap-2',
                  preferences.theme === 'dark' 
                    ? 'border-primary bg-primary/10' 
                    : 'border-border hover:border-primary/50'
                )}
              >
                <Moon className="w-6 h-6" />
                <span className="text-sm font-medium">Dark</span>
              </button>
              <button
                onClick={() => updatePreferences({ theme: 'light' })}
                className={cn(
                  'flex-1 p-4 rounded-xl border transition-all flex flex-col items-center gap-2',
                  preferences.theme === 'light' 
                    ? 'border-primary bg-primary/10' 
                    : 'border-border hover:border-primary/50'
                )}
              >
                <Sun className="w-6 h-6" />
                <span className="text-sm font-medium">Light</span>
              </button>
            </div>
          </motion.div>

          {/* Font Size */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass rounded-2xl p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <Type className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold">Font Size</h2>
            </div>
            <div className="flex gap-4">
              {(['small', 'medium', 'large'] as const).map((size) => (
                <button
                  key={size}
                  onClick={() => updatePreferences({ fontSize: size })}
                  className={cn(
                    'flex-1 p-4 rounded-xl border transition-all flex flex-col items-center gap-2',
                    preferences.fontSize === size 
                      ? 'border-primary bg-primary/10' 
                      : 'border-border hover:border-primary/50'
                  )}
                >
                  <span className={cn(
                    'font-medium',
                    size === 'small' && 'text-sm',
                    size === 'medium' && 'text-base',
                    size === 'large' && 'text-lg'
                  )}>
                    {size.charAt(0).toUpperCase() + size.slice(1)}
                  </span>
                </button>
              ))}
            </div>
          </motion.div>

          {/* Default Model */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass rounded-2xl p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <Brain className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold">Default AI Model</h2>
            </div>
            <div className="space-y-3">
              {Object.entries(AI_MODELS).map(([key, model]) => (
                <button
                  key={key}
                  onClick={() => setSelectedDefaultModel(key as AIModelType)}
                  className={cn(
                    'w-full text-left p-4 rounded-xl border transition-all flex items-center gap-4',
                    selectedDefaultModel === key 
                      ? 'border-primary bg-primary/10' 
                      : 'border-border hover:border-primary/50'
                  )}
                >
                  <Zap className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium">{model.displayName}</p>
                    <p className="text-sm text-muted-foreground">{model.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>

          {/* Streaming Response */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass rounded-2xl p-6"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Zap className="w-5 h-5 text-primary" />
                <div>
                  <h2 className="text-xl font-semibold">Streaming Response</h2>
                  <p className="text-sm text-muted-foreground">Show AI response as it generates</p>
                </div>
              </div>
              <button
                onClick={() => updatePreferences({ streaming: !preferences.streaming })}
                className={cn(
                  'w-14 h-8 rounded-full transition-all relative',
                  preferences.streaming ? 'bg-primary' : 'bg-muted'
                )}
              >
                <span className={cn(
                  'absolute top-1 w-6 h-6 rounded-full bg-white transition-all',
                  preferences.streaming ? 'left-7' : 'left-1'
                )} />
              </button>
            </div>
          </motion.div>

          {/* Sound Effects */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="glass rounded-2xl p-6"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Volume2 className="w-5 h-5 text-primary" />
                <div>
                  <h2 className="text-xl font-semibold">Sound Effects</h2>
                  <p className="text-sm text-muted-foreground">Play sounds for notifications</p>
                </div>
              </div>
              <button
                onClick={() => updatePreferences({ soundEnabled: !preferences.soundEnabled })}
                className={cn(
                  'w-14 h-8 rounded-full transition-all relative',
                  preferences.soundEnabled ? 'bg-primary' : 'bg-muted'
                )}
              >
                <span className={cn(
                  'absolute top-1 w-6 h-6 rounded-full bg-white transition-all',
                  preferences.soundEnabled ? 'left-7' : 'left-1'
                )} />
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}