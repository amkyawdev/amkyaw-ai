'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, Bot, User, Trash2, Plus, MessageSquare, 
  Settings, ChevronDown, Copy, Check,
  Sparkles, Brain, Zap, Menu, X,
  Share2, FileText, RefreshCw, Home
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useChatStore, Message } from '@/stores/chatStore';
import { useAuthStore } from '@/stores/authStore';
import MarkdownMessage from '@/components/chat/MarkdownMessage';
import Link from 'next/link';

const GROQ_MODELS = {
  'llama-3.3-70b': { name: 'llama-3.3-70b-versatile', displayName: 'Llama 3.3 70B', desc: 'Most capable' },
  'llama-3.1-8b': { name: 'llama-3.1-8b-instant', displayName: 'Llama 3.1 8B', desc: 'Fast & efficient' },
  'gemma2-9b': { name: 'gemma2-9b-it', displayName: 'Gemma 2 9B', desc: 'Google Gemma' },
};

type GroqModelType = keyof typeof GROQ_MODELS;

const MODEL_ICONS: Record<string, React.ReactNode> = {
  'llama-3.3-70b-versatile': <Brain className="w-4 h-4" />,
  'llama-3.1-8b-instant': <Sparkles className="w-4 h-4" />,
  'gemma2-9b-it': <Zap className="w-4 h-4" />,
};

const MODEL_COLORS: Record<string, string> = {
  'llama-3.3-70b-versatile': 'from-purple-500 to-indigo-500',
  'llama-3.1-8b-instant': 'from-blue-500 to-cyan-500',
  'gemma2-9b-it': 'from-orange-500 to-amber-500',
};

// Thinking loader with animated dots
const ThinkingLoader = () => (
  <div className="flex items-center gap-2 px-2 py-2">
    <div className="flex gap-1">
      {[0, 150, 300].map((delay, i) => (
        <span key={i} className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: `${delay}ms` }} />
      ))}
    </div>
    <span className="text-xs text-muted-foreground">Thinking...</span>
  </div>
);

const WelcomeScreen = ({ onSelect }: { onSelect: (text: string) => void }) => {
  const suggestions = [
    { icon: '💻', text: 'Write code', cat: 'Code' },
    { icon: '📝', text: 'Write a story', cat: 'Creative' },
    { icon: '🔬', text: 'Explain science', cat: 'Science' },
    { icon: '📊', text: 'Analyze data', cat: 'Data' },
  ];
  return (
    <div className="flex items-center justify-center h-full p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-xl text-center">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', duration: 0.8 }}
          className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-500 flex items-center justify-center shadow-lg shadow-orange-500/20">
          <Bot className="w-8 h-8 text-white" />
        </motion.div>
        <h2 className="text-2xl font-bold mb-3 bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-400 bg-clip-text text-transparent">Amkyaw AI</h2>
        <p className="text-sm text-muted-foreground mb-6">Powered by Groq - Ultra-fast AI</p>
        <div className="grid grid-cols-2 gap-2">
          {suggestions.map((s, i) => (
            <motion.button key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.05 }}
              onClick={() => onSelect(s.text)} className="p-3 rounded-xl glass glass-hover text-center hover:bg-white/10 transition-all">
              <span className="text-2xl mb-1 block">{s.icon}</span>
              <p className="text-xs font-medium">{s.text}</p>
            </motion.button>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

const ChatMessage = ({ message, onCopy, isCopied }: { message: Message; onCopy: (c: string, id: string) => void; isCopied: boolean }) => (
  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
    className={cn('flex gap-3 max-w-4xl mx-auto', message.role === 'user' ? 'flex-row-reverse' : 'flex-row')}>
    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
      className={cn('w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md',
        message.role === 'user' ? 'bg-gradient-to-br from-orange-500 to-amber-500' : 'bg-gradient-to-br from-purple-500 to-indigo-500')}>
      {message.role === 'user' ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white" />}
    </motion.div>
    <div className={cn('group rounded-2xl px-4 py-3 max-w-[80%] shadow-sm',
      message.role === 'user' ? 'bg-gradient-to-r from-orange-500/10 to-amber-500/10 border border-orange-500/20' : 'glass')}>
      {message.isLoading ? <ThinkingLoader /> : (
        <>
          <div className="text-sm">
            <MarkdownMessage content={message.content} />
          </div>
          <div className="flex items-center gap-1 mt-2 pt-2 border-t border-white/5 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={() => onCopy(message.content, message.id)} className="p-1.5 rounded-md hover:bg-white/10">
              {isCopied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
            </button>
            <button className="p-1.5 rounded-md hover:bg-white/10"><Share2 className="w-3 h-3" /></button>
          </div>
        </>
      )}
    </div>
  </motion.div>
);

const ChatInput = ({ input, setInput, onSubmit, isLoading }: { input: string; setInput: (v: string) => void; onSubmit: (e: React.FormEvent) => void; isLoading: boolean }) => (
  <div className="p-3 border-t border-border/50 bg-background/90 backdrop-blur-xl">
    <form onSubmit={onSubmit} className="max-w-4xl mx-auto flex gap-2 items-end">
      <div className="flex-1">
        <textarea value={input} onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onSubmit(e); } }}
          placeholder="Type your message..."
          className="w-full px-4 py-3 rounded-xl glass border border-border/50 focus:border-orange-500/50 focus:outline-none resize-none min-h-[48px] max-h-[150px] text-sm bg-black/30"
          disabled={isLoading} rows={1} />
      </div>
      <button type="submit" disabled={!input.trim() || isLoading}
        className={cn('p-3 rounded-xl font-medium transition-all flex items-center justify-center',
          input.trim() && !isLoading ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:shadow-lg hover:shadow-orange-500/20' : 'bg-muted/50 text-muted-foreground cursor-not-allowed')}>
        {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
      </button>
    </form>
  </div>
);

export default function ChatPage() {
  const [input, setInput] = useState('');
  const [showSidebar, setShowSidebar] = useState(false);
  const [showModelSelect, setShowModelSelect] = useState(false);
  const [selectedModel, setSelectedModel] = useState<GroqModelType>('llama-3.1-8b');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isThinking, setIsThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { user, isAuthenticated } = useAuthStore();
  const { chats, currentChat, isLoading, error, createChat, setCurrentChat, addMessage, updateMessage, deleteChat, clearError, setLoading } = useChatStore();

  const scrollToBottom = useCallback(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), []);
  useEffect(() => { scrollToBottom(); }, [currentChat?.messages, scrollToBottom]);

  const handleCopy = async (content: string, id: string) => {
    await navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    let chatId = currentChat?.id;
    if (!chatId) { const newChat = createChat(selectedModel); chatId = newChat.id; }

    const userMessage: Message = { id: `msg_${Date.now()}`, role: 'user', content: input.trim(), timestamp: new Date() };
    const assistantMessage: Message = { id: `msg_${Date.now()}_ai`, role: 'assistant', content: '', timestamp: new Date(), isLoading: true };

    addMessage(chatId, userMessage);
    addMessage(chatId, assistantMessage);
    const msgInput = input;
    setInput('');
    setLoading(true);
    setIsThinking(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: msgInput, model: selectedModel })
      });
      setIsThinking(false);
      if (!response.ok) throw new Error((await response.json()).error || 'Failed');
      const data = await response.json();
      updateMessage(chatId, assistantMessage.id, { content: data.response, isLoading: false });
    } catch (err) {
      setIsThinking(false);
      updateMessage(chatId, assistantMessage.id, { content: err instanceof Error ? err.message : 'Error connecting to AI', isLoading: false });
    } finally { setLoading(false); }
  };

  const currentModel = GROQ_MODELS[selectedModel];

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar Overlay */}
      <AnimatePresence>
        {showSidebar && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setShowSidebar(false)} />
            <motion.aside initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              className="fixed left-0 top-0 bottom-0 w-72 border-r border-border/50 flex flex-col bg-background/95 backdrop-blur-xl z-50 md:relative md:translate-x-0 md:w-64 md:border-r">
              {/* Header */}
              <div className="p-3 border-b border-border/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-semibold text-sm">Amkyaw AI</span>
                </div>
                <button onClick={() => setShowSidebar(false)} className="p-1.5 rounded-md hover:bg-white/10 md:hidden">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* New Chat Button */}
              <div className="p-3">
                <button onClick={() => { createChat(selectedModel); setShowSidebar(false); }}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white text-sm font-medium hover:shadow-lg hover:shadow-orange-500/20 transition-all">
                  <Plus className="w-4 h-4" /> New Chat
                </button>
              </div>

              {/* Chat List */}
              <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {chats.length === 0 ? (
                  <div className="text-center text-muted-foreground py-6">
                    <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="text-xs">No chats yet</p>
                  </div>
                ) : (
                  chats.map(chat => (
                    <button key={chat.id} onClick={() => { setCurrentChat(chat.id); setShowSidebar(false); }}
                      className={cn('w-full text-left p-2.5 rounded-lg transition-all flex items-center gap-2 group',
                        currentChat?.id === chat.id ? 'bg-orange-500/10 border border-orange-500/20' : 'hover:bg-white/5')}>
                      <MessageSquare className="w-4 h-4 text-orange-500/70 flex-shrink-0" />
                      <span className="truncate text-xs flex-1">{chat.title}</span>
                      <button onClick={(e) => { e.stopPropagation(); deleteChat(chat.id); }}
                        className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-destructive/20 text-destructive">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </button>
                  ))
                )}
              </div>

              {/* Footer */}
              <div className="p-3 border-t border-border/50 space-y-2">
                <div className="flex gap-1.5">
                  <Link href="/settings" className="flex-1 flex items-center justify-center p-2 rounded-lg hover:bg-white/5"><Settings className="w-4 h-4" /></Link>
                </div>
                <Link href="/" className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/5">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
                    <User className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span className="text-xs truncate">Home</span>
                </Link>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden bg-background">
        {/* Header */}
        <header className="h-12 px-3 flex items-center justify-between border-b border-border/50 bg-background/80 backdrop-blur-xl">
          <div className="flex items-center gap-2">
            <button onClick={() => setShowSidebar(true)} className="p-2 rounded-lg hover:bg-white/5">
              <Menu className="w-4 h-4" />
            </button>
            <span className="text-sm font-medium hidden sm:block">Chat</span>
          </div>

          {/* Model Selector */}
          <div className="relative">
            <button onClick={() => setShowModelSelect(!showModelSelect)}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-xs">
              <div className={`w-5 h-5 rounded-md bg-gradient-to-br ${MODEL_COLORS[currentModel.name]} flex items-center justify-center`}>
                {MODEL_ICONS[currentModel.name]}
              </div>
              <span className="hidden sm:inline font-medium">{currentModel.displayName}</span>
              <ChevronDown className="w-3 h-3 opacity-50" />
            </button>
            <AnimatePresence>
              {showModelSelect && (
                <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}
                  className="absolute right-0 mt-2 w-56 glass rounded-xl border border-border/50 overflow-hidden z-50">
                  {Object.entries(GROQ_MODELS).map(([key, model]) => (
                    <button key={key} onClick={() => { setSelectedModel(key as GroqModelType); setShowModelSelect(false); }}
                      className={cn('w-full text-left px-3 py-2.5 flex items-center gap-3 hover:bg-white/5 transition-colors',
                        selectedModel === key && 'bg-orange-500/10')}>
                      <div className={`w-7 h-7 rounded-md bg-gradient-to-br ${MODEL_COLORS[model.name]} flex items-center justify-center`}>
                        {MODEL_ICONS[model.name]}
                      </div>
                      <div>
                        <p className="text-xs font-medium">{model.displayName}</p>
                        <p className="text-[10px] text-muted-foreground">{model.desc}</p>
                      </div>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </header>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {!currentChat || currentChat.messages.length === 0 ? (
            <WelcomeScreen onSelect={(text) => setInput(text)} />
          ) : (
            <AnimatePresence>
              {currentChat.messages.map((message) => (
                <ChatMessage key={message.id} message={message} onCopy={handleCopy} isCopied={copiedId === message.id} />
              ))}
            </AnimatePresence>
          )}
          
          {/* Thinking indicator */}
          {isThinking && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3 max-w-4xl mx-auto">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center shadow-md">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="glass rounded-2xl px-4 py-3">
                <ThinkingLoader />
              </div>
            </motion.div>
          )}

          {error && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="max-w-4xl mx-auto p-3 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 text-sm">
              <p>{error}</p>
              <button onClick={clearError} className="mt-1 text-xs underline">Dismiss</button>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <ChatInput input={input} setInput={setInput} onSubmit={handleSubmit} isLoading={isLoading} />
      </main>
    </div>
  );
}