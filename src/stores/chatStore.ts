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
  userId: string | null;
  isLoadingChat: boolean;
  
  // Database sync
  loadChatsFromDb: (userId: string) => Promise<void>;
  loadChatMessages: (chatId: string) => Promise<void>;
  saveChatToDb: (chat: Chat) => Promise<void>;
  deleteChatFromDb: (chatId: string) => Promise<void>;
  
  // Local state
  createChat: (model?: string) => Chat;
  setCurrentChat: (chatId: string) => void;
  addMessage: (chatId: string, message: Message) => void;
  updateMessage: (chatId: string, messageId: string, updates: Partial<Message>) => void;
  updateChatTitle: (chatId: string, title: string) => void;
  deleteChat: (chatId: string) => void;
  clearChats: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  setUserId: (userId: string) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  chats: [],
  currentChat: null,
  isLoading: false,
  error: null,
  userId: null,
  isLoadingChat: false,

  // Load chats list from database
  loadChatsFromDb: async (userId: string) => {
    set({ isLoading: true });
    try {
      const response = await fetch(`/api/chat-history?user_id=${userId}`);
      if (response.ok) {
        const data = await response.json();
        const chats: Chat[] = (data.chats || []).map((chat: any) => ({
          id: String(chat.id),
          title: chat.title,
          model: chat.model || 'llama-3.3-70b',
          messages: [],
          createdAt: new Date(chat.created_at),
          updatedAt: new Date(chat.updated_at),
        }));
        set({ chats, userId, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      console.error('Failed to load chats from DB:', error);
      set({ isLoading: false });
    }
  },

  // Load messages for a specific chat
  loadChatMessages: async (chatId: string) => {
    set({ isLoadingChat: true });
    try {
      const response = await fetch(`/api/chat-history?chat_id=${chatId}`);
      if (response.ok) {
        const data = await response.json();
        const messages: Message[] = (data.messages || []).map((msg: any) => ({
          id: String(msg.id),
          role: msg.role,
          content: msg.content,
          timestamp: new Date(msg.created_at),
        }));
        
        // Update the current chat with messages
        set((state) => {
          const updatedChats = state.chats.map(chat => 
            chat.id === chatId 
              ? { ...chat, messages } 
              : chat
          );
          const currentChat = state.currentChat?.id === chatId
            ? { ...state.currentChat, messages }
            : state.currentChat;
          return { chats: updatedChats, currentChat, isLoadingChat: false };
        });
      } else {
        set({ isLoadingChat: false });
      }
    } catch (error) {
      console.error('Failed to load chat messages:', error);
      set({ isLoadingChat: false });
    }
  },

  // Save chat to database
  saveChatToDb: async (chat: Chat) => {
    const { userId } = get();
    if (!userId) return;
    
    try {
      // Convert messages to simple format
      const messages = chat.messages.map(msg => ({
        role: msg.role,
        content: msg.content,
      }));
      
      await fetch('/api/chat-history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          chat_id: chat.id,
          title: chat.title,
          model: chat.model,
          messages: messages,
        }),
      });
    } catch (error) {
      console.error('Failed to save chat to DB:', error);
    }
  },

  // Delete chat from database
  deleteChatFromDb: async (chatId: string) => {
    try {
      await fetch(`/api/chat-history?chat_id=${chatId}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Failed to delete chat from DB:', error);
    }
  },

  setUserId: (userId: string) => {
    set({ userId });
  },

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
    
    // Save to database
    get().saveChatToDb(newChat);
    
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
    
    // Auto-save chat after adding message
    const chat = get().chats.find((c) => c.id === chatId);
    if (chat) {
      get().saveChatToDb(chat);
    }
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
    
    // Auto-save after update
    const chat = get().chats.find((c) => c.id === chatId);
    if (chat) {
      get().saveChatToDb(chat);
    }
  },

  updateChatTitle: (chatId: string, title: string) => {
    set((state) => ({
      chats: state.chats.map((chat) =>
        chat.id === chatId
          ? { ...chat, title, updatedAt: new Date() }
          : chat
      ),
      currentChat: state.currentChat?.id === chatId
        ? { ...state.currentChat, title, updatedAt: new Date() }
        : state.currentChat,
    }));
    
    // Auto-save after update
    const chat = get().chats.find((c) => c.id === chatId);
    if (chat) {
      get().saveChatToDb(chat);
    }
  },

  deleteChat: (chatId: string) => {
    set((state) => ({
      chats: state.chats.filter((chat) => chat.id !== chatId),
      currentChat: state.currentChat?.id === chatId ? null : state.currentChat,
    }));
    
    // Delete from database
    get().deleteChatFromDb(chatId);
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