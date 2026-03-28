'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { usePreferencesStore } from '@/stores/chatStore';

type Theme = 'dark' | 'light';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('dark');
  const [mounted, setMounted] = useState(false);
  const { preferences, updatePreferences } = usePreferencesStore();

  useEffect(() => {
    const stored = localStorage.getItem('amkyaw-ai-theme') as Theme;
    if (stored) {
      setThemeState(stored);
    } else if (preferences.theme) {
      setThemeState(preferences.theme);
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
    localStorage.setItem('amkyaw-ai-theme', theme);
    updatePreferences({ theme });
  }, [theme, mounted, updatePreferences]);

  const toggleTheme = () => {
    setThemeState(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}