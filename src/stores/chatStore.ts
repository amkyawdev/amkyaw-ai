'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isLoading?: boolean;
}

export interface Chat {
  id: string;
  title: string;
  model: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

interface ChatState {
  chats: Chat[];
  currentChat: Chat | null;
  isLoading: boolean;
  error: string | null;
  
  createChat: (model?: string) => Chat;
  setCurrentChat: (chatId: string) => void;
  addMessage: (chatId: string, message: Message) => void;
  updateMessage: (chatId: string, messageId: string, updates: Partial<Message>) => void;
  deleteChat: (chatId: string) => void;
  clearChats: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  chats: [],
  currentChat: null,
  isLoading: false,
  error: null,

  createChat: (model = 'llama-3.3-70b') => {
    const newChat: Chat = {
      id: `chat_${Date.now()}`,
      title: 'New Chat',
      model,
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    set((state) => ({
      chats: [newChat, ...state.chats],
      currentChat: newChat,
    }));
    
    return newChat;
  },

  setCurrentChat: (chatId: string) => {
    const chat = get().chats.find((c) => c.id === chatId);
    set({ currentChat: chat || null });
  },

  addMessage: (chatId: string, message: Message) => {
    set((state) => ({
      chats: state.chats.map((chat) =>
        chat.id === chatId
          ? { ...chat, messages: [...chat.messages, message], updatedAt: new Date() }
          : chat
      ),
      currentChat: state.currentChat?.id === chatId
        ? { ...state.currentChat, messages: [...state.currentChat.messages, message], updatedAt: new Date() }
        : state.currentChat,
    }));
  },

  updateMessage: (chatId: string, messageId: string, updates: Partial<Message>) => {
    set((state) => ({
      chats: state.chats.map((chat) =>
        chat.id === chatId
          ? {
              ...chat,
              messages: chat.messages.map((msg) =>
                msg.id === messageId ? { ...msg, ...updates } : msg
              ),
              updatedAt: new Date(),
            }
          : chat
      ),
      currentChat: state.currentChat?.id === chatId
        ? {
            ...state.currentChat,
            messages: state.currentChat.messages.map((msg) =>
              msg.id === messageId ? { ...msg, ...updates } : msg
            ),
            updatedAt: new Date(),
          }
        : state.currentChat,
    }));
  },

  deleteChat: (chatId: string) => {
    set((state) => ({
      chats: state.chats.filter((chat) => chat.id !== chatId),
      currentChat: state.currentChat?.id === chatId ? null : state.currentChat,
    }));
  },

  clearChats: () => {
    set({ chats: [], currentChat: null });
  },

  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },

  setError: (error: string | null) => {
    set({ error });
  },

  clearError: () => {
    set({ error: null });
  },
}));

// Preferences store
interface PreferencesState {
  preferences: {
    theme: 'dark' | 'light';
    fontSize: 'small' | 'medium' | 'large';
    streaming: boolean;
    soundEnabled: boolean;
  };
  updatePreferences: (updates: Partial<PreferencesState['preferences']>) => void;
}

export const usePreferencesStore = create<PreferencesState>((set) => ({
  preferences: {
    theme: 'dark',
    fontSize: 'medium',
    streaming: true,
    soundEnabled: false,
  },
  updatePreferences: (updates) =>
    set((state) => ({
      preferences: { ...state.preferences, ...updates },
    })),
}));