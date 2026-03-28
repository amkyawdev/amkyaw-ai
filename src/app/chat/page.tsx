'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, Bot, User, Trash2, Plus, MessageSquare, 
  Settings, History, ChevronDown, Copy, Check,
  Sparkles, Brain, Zap, ChevronLeft, Menu, X,
  MoreVertical, Edit3, Share2, Download
} from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';
import { useChatStore, usePreferencesStore, Message, Chat } from '@/stores/chatStore';
import { AI_MODELS, AIModelType } from '@/lib/ai';
import MarkdownMessage from '@/components/chat/MarkdownMessage';

const MODEL_ICONS: Record<string, React.ReactNode> = {
  'gemini-1.5-flash': <Sparkles className="w-4 h-4" />,
  'gemini-1.5-pro': <Brain className="w-4 h-4" />,
  'gemini-1.5-flash-8b': <Zap className="w-4 h-4" />,
};

// Loading animation dots
const LoadingDots = () => (
  <div className="flex gap-1 p-2">
    {[0, 150, 300].map((delay, i) => (
      <span 
        key={i}
        className="w-2 h-2 bg-primary rounded-full animate-bounce"
        style={{ animationDelay: `${delay}ms` }}
      />
    ))}
  </div>
);

export default function ChatPage() {
  const [input, setInput] = useState('');
  const [showSidebar, setShowSidebar] = useState(true);
  const [showModelSelect, setShowModelSelect] = useState(false);
  const [selectedModel, setSelectedModel] = useState<AIModelType>('flash8b');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const { 
    chats, currentChat, isLoading, error,
    createChat, setCurrentChat, addMessage, updateMessage, 
    deleteChat, clearError, setLoading 
  } = useChatStore();

  const { preferences } = usePreferencesStore();

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [currentChat?.messages, scrollToBottom]);

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    // Create new chat if none exists
    let chatId = currentChat?.id;
    if (!chatId) {
      const newChat = createChat(selectedModel);
      chatId = newChat.id;
    }

    const userMessage: Message = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    const assistantMessage: Message = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}_ai`,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isLoading: true,
    };

    addMessage(chatId, userMessage);
    addMessage(chatId, assistantMessage);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: userMessage.content,
          model: selectedModel,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get response');
      }

      const data = await response.json();
      
      updateMessage(chatId, assistantMessage.id, {
        content: data.response,
        isLoading: false,
      });
    } catch (err) {
      console.error('Error:', err);
      updateMessage(chatId, assistantMessage.id, {
        content: err instanceof Error ? err.message : 'Sorry, I encountered an error.',
        isLoading: false,
        error: err instanceof Error ? err.message : 'Unknown error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleNewChat = () => {
    createChat(selectedModel);
  };

  const handleCopy = async (content: string, id: string) => {
    await navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <AnimatePresence>
        {showSidebar && (
          <motion.aside
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            className="w-80 border-r border-border glass flex flex-col"
          >
            {/* Sidebar Header */}
            <div className="p-4 border-b border-border">
              <button 
                onClick={handleNewChat}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all hover:animate-glow"
              >
                <Plus className="w-5 h-5" />
                New Chat
              </button>
            </div>

            {/* Chat List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {chats.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No chats yet</p>
                  <p className="text-xs mt-1">Start a new conversation</p>
                </div>
              ) : (
                chats.map(chat => (
                  <motion.button
                    key={chat.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={() => setCurrentChat(chat.id)}
                    className={cn(
                      'w-full text-left p-3 rounded-xl transition-all flex items-center gap-3 group',
                      currentChat?.id === chat.id 
                        ? 'bg-primary/20 border border-primary/30' 
                        : 'glass glass-hover hover:bg-white/10'
                    )}
                  >
                    <MessageSquare className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <span className="truncate text-sm flex-1">{chat.title}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteChat(chat.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-destructive/20 rounded transition-opacity"
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </button>
                  </motion.button>
                ))
              )}
            </div>

            {/* Sidebar Footer */}
            <div className="p-4 border-t border-border">
              <div className="flex gap-2">
                <button className="flex-1 flex items-center justify-center gap-2 p-2 rounded-lg glass glass-hover text-sm">
                  <History className="w-4 h-4" />
                  History
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 p-2 rounded-lg glass glass-hover text-sm">
                  <Settings className="w-4 h-4" />
                  Settings
                </button>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-16 border-b border-border px-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="p-2 rounded-lg glass glass-hover"
            >
              {showSidebar ? <ChevronLeft className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <h1 className="text-lg font-semibold">AI Chat</h1>
          </div>

          {/* Model Selector */}
          <div className="relative">
            <button
              onClick={() => setShowModelSelect(!showModelSelect)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg glass glass-hover"
            >
              {MODEL_ICONS[AI_MODELS[selectedModel].name]}
              <span className="text-sm">{AI_MODELS[selectedModel].displayName}</span>
              <ChevronDown className="w-4 h-4" />
            </button>

            <AnimatePresence>
              {showModelSelect && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute right-0 mt-2 w-64 glass rounded-xl border border-border overflow-hidden z-50"
                >
                  {Object.entries(AI_MODELS).map(([key, model]) => (
                    <button
                      key={key}
                      onClick={() => {
                        setSelectedModel(key as AIModelType);
                        setShowModelSelect(false);
                      }}
                      className={cn(
                        'w-full text-left p-3 flex items-center gap-3 hover:bg-white/10 transition-colors',
                        selectedModel === key && 'bg-primary/20'
                      )}
                    >
                      {MODEL_ICONS[model.name]}
                      <div>
                        <p className="text-sm font-medium">{model.displayName}</p>
                        <p className="text-xs text-muted-foreground">{model.description}</p>
                      </div>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <AnimatePresence>
            {!currentChat || currentChat.messages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center"
                >
                  <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                    <Bot className="w-12 h-12 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold mb-2">How can I help you?</h2>
                  <p className="text-muted-foreground max-w-md">
                    Send a message to start a conversation with AI. 
                    I can help with writing, coding, analysis, and more.
                  </p>
                  <div className="flex gap-2 justify-center mt-4 flex-wrap">
                    {['Write a story', 'Explain quantum physics', 'Debug code', 'Write poem'].map((tag, i) => (
                      <button
                        key={i}
                        onClick={() => setInput(tag)}
                        className="px-3 py-1 rounded-full glass text-sm hover:bg-white/20 transition-colors"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </motion.div>
              </div>
            ) : (
              currentChat.messages.map((message, index) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: Math.min(index * 0.05, 0.2) }}
                  className={cn(
                    'flex gap-4 max-w-4xl mx-auto',
                    message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                  )}
                >
                  <div className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0',
                    message.role === 'user' 
                      ? 'bg-gradient-to-br from-primary to-purple-500' 
                      : 'bg-gradient-to-br from-secondary to-gray-600'
                  )}>
                    {message.role === 'user' 
                      ? <User className="w-5 h-5 text-white" />
                      : <Bot className="w-5 h-5 text-white" />
                    }
                  </div>
                  <div className={cn(
                    'glass rounded-2xl p-4 max-w-[70%]',
                    message.role === 'user' 
                      ? 'bg-primary/10' 
                      : ''
                  )}>
                    {message.isLoading ? (
                      <LoadingDots />
                    ) : (
                      <>
                        <MarkdownMessage content={message.content} />
                        <div className="flex gap-2 mt-2 pt-2 border-t border-border/30">
                          <button
                            onClick={() => handleCopy(message.content, message.id)}
                            className="p-1 rounded hover:bg-white/10 transition-colors"
                            title="Copy"
                          >
                            {copiedId === message.id ? (
                              <Check className="w-4 h-4 text-green-500" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                          <button className="p-1 rounded hover:bg-white/10 transition-colors" title="Share">
                            <Share2 className="w-4 h-4" />
                          </button>
                          <button className="p-1 rounded hover:bg-white/10 transition-colors" title="More">
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-4xl mx-auto p-4 rounded-xl bg-destructive/20 border border-destructive/30 text-destructive"
            >
              <p>{error}</p>
              <button 
                onClick={clearError}
                className="mt-2 text-sm underline"
              >
                Dismiss
              </button>
            </motion.div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-border">
          <form 
            onSubmit={handleSubmit}
            className="max-w-4xl mx-auto flex gap-3 items-end"
          >
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                className="w-full px-6 py-4 rounded-2xl glass border border-border focus:border-primary focus:outline-none transition-colors resize-none min-h-[60px] max-h-[200px]"
                disabled={isLoading}
                rows={1}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
              />
            </div>
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className={cn(
                'px-6 py-4 rounded-2xl font-semibold transition-all flex items-center gap-2',
                input.trim() && !isLoading
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90 hover:animate-glow'
                  : 'bg-muted text-muted-foreground cursor-not-allowed'
              )}
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
          <p className="text-center text-xs text-muted-foreground mt-2">
            AI can make mistakes. Please verify important information.
          </p>
        </div>
      </main>
    </div>
  );
}