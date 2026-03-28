'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { usePreferencesStore } from '@/stores/chatStore';

type FontSize = 'small' | 'medium' | 'large';

interface FontSizeContextType {
  fontSize: FontSize;
  setFontSize: (size: FontSize) => void;
}

const FontSizeContext = createContext<FontSizeContextType | undefined>(undefined);

export function FontSizeProvider({ children }: { children: React.ReactNode }) {
  const [fontSize, setFontSizeState] = useState<FontSize>('medium');
  const { preferences, updatePreferences } = usePreferencesStore();

  useEffect(() => {
    if (preferences.fontSize) {
      setFontSizeState(preferences.fontSize);
    }
  }, []);

  useEffect(() => {
    const sizes = { small: '0.875rem', medium: '1rem', large: '1.125rem' };
    document.documentElement.style.setProperty('--font-size-base', sizes[fontSize]);
  }, [fontSize]);

  const setFontSize = (size: FontSize) => {
    setFontSizeState(size);
    updatePreferences({ fontSize: size });
  };

  return (
    <FontSizeContext.Provider value={{ fontSize, setFontSize }}>
      {children}
    </FontSizeContext.Provider>
  );
}

export function useFontSize() {
  const context = useContext(FontSizeContext);
  if (!context) {
    throw new Error('useFontSize must be used within FontSizeProvider');
  }
  return context;
}