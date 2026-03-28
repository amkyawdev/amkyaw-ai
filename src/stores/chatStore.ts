import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isLoading?: boolean;
  error?: string;
}

export interface Chat {
  id: string;
  title: string;
  messages: Message[];
  model: string;
  createdAt: Date;
  updatedAt: Date;
}

interface ChatState {
  chats: Chat[];
  currentChat: Chat | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  createChat: (model?: string) => Chat;
  setCurrentChat: (chatId: string) => void;
  addMessage: (chatId: string, message: Message) => void;
  updateMessage: (chatId: string, messageId: string, updates: Partial<Message>) => void;
  deleteChat: (chatId: string) => void;
  clearChats: () => void;
  clearError: () => void;
  setLoading: (isLoading: boolean) => void;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      chats: [],
      currentChat: null,
      isLoading: false,
      error: null,

      createChat: (model = 'gemini-1.5-flash') => {
        const newChat: Chat = {
          id: `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          title: 'New Conversation',
          messages: [],
          model,
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
        if (chat) {
          set({ currentChat: chat });
        }
      },

      addMessage: (chatId: string, message: Message) => {
        set((state) => {
          const chats = state.chats.map((chat) => {
            if (chat.id === chatId) {
              const updatedChat = {
                ...chat,
                messages: [...chat.messages, message],
                updatedAt: new Date(),
                title: chat.messages.length === 0 
                  ? message.content.slice(0, 50) + (message.content.length > 50 ? '...' : '')
                  : chat.title,
              };
              if (state.currentChat?.id === chatId) {
                set({ currentChat: updatedChat });
              }
              return updatedChat;
            }
            return chat;
          });
          return { chats };
        });
      },

      updateMessage: (chatId: string, messageId: string, updates: Partial<Message>) => {
        set((state) => {
          const chats = state.chats.map((chat) => {
            if (chat.id === chatId) {
              const updatedChat = {
                ...chat,
                messages: chat.messages.map((msg) =>
                  msg.id === messageId ? { ...msg, ...updates } : msg
                ),
              };
              if (state.currentChat?.id === chatId) {
                set({ currentChat: updatedChat });
              }
              return updatedChat;
            }
            return chat;
          });
          return { chats };
        });
      },

      deleteChat: (chatId: string) => {
        set((state) => {
          const chats = state.chats.filter((c) => c.id !== chatId);
          const currentChat = state.currentChat?.id === chatId 
            ? (chats[0] || null) 
            : state.currentChat;
          return { chats, currentChat };
        });
      },

      clearChats: () => {
        set({ chats: [], currentChat: null });
      },

      clearError: () => set({ error: null }),
      
      setLoading: (isLoading: boolean) => set({ isLoading }),
    }),
    {
      name: 'amkyaw-ai-chat-storage',
      partialize: (state) => ({
        chats: state.chats,
        currentChat: state.currentChat,
      }),
    }
  )
);

// User preferences store
interface UserPreferences {
  theme: 'dark' | 'light';
  fontSize: 'small' | 'medium' | 'large';
  streaming: boolean;
  soundEnabled: boolean;
}

interface PreferencesState {
  preferences: UserPreferences;
  updatePreferences: (updates: Partial<UserPreferences>) => void;
}

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      preferences: {
        theme: 'dark',
        fontSize: 'medium',
        streaming: true,
        soundEnabled: true,
      },
      updatePreferences: (updates) =>
        set((state) => ({
          preferences: { ...state.preferences, ...updates },
        })),
    }),
    {
      name: 'amkyaw-ai-preferences-storage',
    }
  )
);