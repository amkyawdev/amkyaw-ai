'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, Bot, User, Trash2, Plus, MessageSquare, 
  Settings, ChevronDown, Copy, Check,
  Sparkles, Brain, Menu, X, Share2, RefreshCw, Home
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useChatStore, Message } from '@/stores/chatStore';
import MarkdownMessage from '@/components/chat/MarkdownMessage';
import Link from 'next/link';

const GROQ_MODELS = {
  'llama-3.3-70b': { name: 'llama-3.3-70b-versatile', displayName: 'Llama 3.3 70B', desc: 'Most capable' },
  'llama-3.1-8b': { name: 'llama-3.1-8b-instant', displayName: 'Llama 3.1 8B', desc: 'Fast & efficient' },
};

type GroqModelType = keyof typeof GROQ_MODELS;

const MODEL_ICONS: Record<string, React.ReactNode> = {
  'llama-3.3-70b-versatile': <Brain className="w-4 h-4" />,
  'llama-3.1-8b-instant': <Sparkles className="w-4 h-4" />,
};

const MODEL_COLORS: Record<string, string> = {
  'llama-3.3-70b-versatile': 'from-purple-500 to-indigo-500',
  'llama-3.1-8b-instant': 'from-blue-500 to-cyan-500',
};

// Enhanced Thinking Loader with spinning dots
const ThinkingLoader = () => (
  <div className="flex items-center gap-3 px-4 py-3">
    <div className="relative w-8 h-8">
      <div className="absolute inset-0 border-2 border-orange-500/30 rounded-full" />
      <div className="absolute inset-0 border-2 border-transparent border-t-orange-500 rounded-full animate-spin" />
    </div>
    <div className="flex flex-col gap-1">
      <span className="text-sm font-medium">Thinking...</span>
      <div className="flex gap-1">
        <span className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-pulse" />
        <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
        <span className="w-1.5 h-1.5 bg-orange-600 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
      </div>
    </div>
  </div>
);

// AI Processing Indicator
const ProcessingIndicator = ({ type }: { type: 'typing' | 'analyzing' | 'generating' | 'translating' }) => {
  const labels = {
    typing: 'Typing response...',
    analyzing: 'Analyzing your question...',
    generating: 'Generating response...',
    translating: 'Processing translation...',
  };
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 px-4 py-2">
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="w-2 h-2 bg-orange-500 rounded-full"
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.1 }}
          />
        ))}
      </div>
      <span className="text-xs text-muted-foreground">{labels[type]}</span>
    </motion.div>
  );
};

const WelcomeScreen = ({ onSelect }: { onSelect: (text: string) => void }) => (
  <div className="flex items-center justify-center h-full p-4">
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-xl text-center">
      <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', duration: 0.8 }}
        className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-500 flex items-center justify-center shadow-2xl shadow-orange-500/30">
        <Bot className="w-10 h-10 text-white" />
      </motion.div>
      <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="text-3xl font-bold mb-3 bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">
        Hi, I am Amkyaw AI 👋
      </motion.h2>
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
        className="text-muted-foreground mb-6">
        What can I help you with today?
      </motion.p>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
        className="grid grid-cols-2 gap-3">
        {[
          { icon: '💬', text: 'Ask anything', action: 'What is AI?' },
          { icon: '💻', text: 'Write code', action: 'Write a Python function' },
          { icon: '🌐', text: 'Translate', action: 'Translate to English: မင်္ဂလာပါ' },
          { icon: '✍️', text: 'Summarize', action: 'Summarize this text:' },
        ].map((item, i) => (
          <motion.button key={item.text} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 + i * 0.1 }}
            onClick={() => onSelect(item.action)}
            className="p-4 rounded-xl glass glass-hover text-center hover:bg-white/10 transition-all">
            <span className="text-3xl mb-2 block">{item.icon}</span>
            <p className="text-sm font-medium">{item.text}</p>
          </motion.button>
        ))}
      </motion.div>
    </motion.div>
  </div>
);

const ChatMessage = ({ message, onCopy, isCopied }: { message: Message; onCopy: (c: string, id: string) => void; isCopied: boolean }) => (
  <motion.div initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
    className={cn('flex gap-3 max-w-4xl mx-auto', message.role === 'user' ? 'flex-row-reverse' : 'flex-row')}>
    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', duration: 0.3 }}
      className={cn('w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg',
        message.role === 'user' ? 'bg-gradient-to-br from-orange-500 to-amber-500' : 'bg-gradient-to-br from-purple-500 to-indigo-500')}>
      {message.role === 'user' ? <User className="w-5 h-5 text-white" /> : <Bot className="w-5 h-5 text-white" />}
    </motion.div>
    <div className={cn('group rounded-2xl px-5 py-4 max-w-[85%] shadow-lg',
      message.role === 'user' ? 'bg-gradient-to-r from-orange-500/15 to-amber-500/15 border border-orange-500/20' : 'glass')}>
      {message.isLoading ? <ThinkingLoader /> : (
        <>
          <div className="text-sm leading-relaxed">
            <MarkdownMessage content={message.content} />
          </div>
          <div className="flex items-center gap-1 mt-3 pt-3 border-t border-white/10 opacity-0 group-hover:opacity-100 transition-all">
            <button onClick={() => onCopy(message.content, message.id)} className="p-2 rounded-lg hover:bg-white/10 transition-colors">
              {isCopied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
            </button>
            <button className="p-2 rounded-lg hover:bg-white/10 transition-colors"><Share2 className="w-4 h-4" /></button>
          </div>
        </>
      )}
    </div>
  </motion.div>
);

const ChatInput = ({ input, setInput, onSubmit, isLoading }: { input: string; setInput: (v: string) => void; onSubmit: (e: React.FormEvent) => void; isLoading: boolean }) => (
  <div className="p-4 border-t border-border/50 bg-background/95 backdrop-blur-xl">
    <form onSubmit={onSubmit} className="max-w-4xl mx-auto flex gap-3 items-end">
      <div className="flex-1 relative">
        <textarea value={input} onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onSubmit(e); } }}
          placeholder="Message Amkyaw AI..."
          className="w-full px-5 py-4 rounded-2xl glass border border-border/50 focus:border-orange-500/50 focus:outline-none resize-none min-h-[56px] max-h-[200px] text-sm bg-black/30 backdrop-blur"
          disabled={isLoading} rows={1} />
      </div>
      <motion.button type="submit" disabled={!input.trim() || isLoading}
        className={cn('p-4 rounded-2xl font-medium transition-all flex items-center justify-center shadow-lg',
          input.trim() && !isLoading ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:shadow-xl hover:shadow-orange-500/25' : 'bg-muted/50 text-muted-foreground cursor-not-allowed')}
        whileHover={{ scale: input.trim() && !isLoading ? 1.05 : 1 }}
        whileTap={{ scale: input.trim() && !isLoading ? 0.95 : 1 }}>
        {isLoading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
      </motion.button>
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
  const [processingType, setProcessingType] = useState<'typing' | 'analyzing' | 'generating' | 'translating'>('typing');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
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
    setProcessingType('analyzing');

    setTimeout(() => setProcessingType('generating'), 500);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: msgInput, model: selectedModel })
      });
      setIsThinking(false);
      setProcessingType('typing');
      if (!response.ok) throw new Error((await response.json()).error || 'Failed');
      const data = await response.json();
      updateMessage(chatId, assistantMessage.id, { content: data.response, isLoading: false });
    } catch (err) {
      setIsThinking(false);
      updateMessage(chatId, assistantMessage.id, { content: err instanceof Error ? err.message : 'Error', isLoading: false });
    } finally { setLoading(false); }
  };

  const currentModel = GROQ_MODELS[selectedModel];

  return (
    <div className="flex h-screen overflow-hidden">
      <AnimatePresence>
        {showSidebar && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setShowSidebar(false)} />
            <motion.aside initial={{ x: -300 }} animate={{ x: 0 }} exit={{ x: -300 }}
              className="fixed left-0 top-0 bottom-0 w-80 border-r border-border/50 flex flex-col bg-background/95 backdrop-blur-xl z-50 md:relative md:translate-x-0 md:w-72 md:border-r">
              <div className="p-4 border-b border-border/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="font-bold">Amkyaw AI</h2>
                    <p className="text-xs text-muted-foreground">Powered by Groq</p>
                  </div>
                </div>
                <button onClick={() => setShowSidebar(false)} className="p-2 rounded-lg hover:bg-white/10 md:hidden">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-4">
                <motion.button onClick={() => { createChat(selectedModel); setShowSidebar(false); }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold shadow-lg shadow-orange-500/20"
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Plus className="w-5 h-5" /> New Chat
                </motion.button>
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {chats.length === 0 ? (
                  <div className="text-center text-muted-foreground py-10">
                    <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">No conversations yet</p>
                  </div>
                ) : (
                  chats.map(chat => (
                    <motion.button key={chat.id} onClick={() => { setCurrentChat(chat.id); setShowSidebar(false); }}
                      className={cn('w-full text-left p-3 rounded-xl transition-all flex items-center gap-3 group',
                        currentChat?.id === chat.id ? 'bg-orange-500/10 border border-orange-500/30' : 'hover:bg-white/5')}
                      whileHover={{ x: 4 }}>
                      <MessageSquare className="w-5 h-5 text-orange-500/70 flex-shrink-0" />
                      <span className="truncate text-sm flex-1">{chat.title}</span>
                      <button onClick={(e) => { e.stopPropagation(); deleteChat(chat.id); }}
                        className="p-1.5 rounded opacity-0 group-hover:opacity-100 hover:bg-destructive/20 text-destructive">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </motion.button>
                  ))
                )}
              </div>
              <div className="p-4 border-t border-border/50">
                <div className="flex gap-2 mb-3">
                  <Link href="/settings" className="flex-1 flex items-center justify-center p-2 rounded-lg hover:bg-white/5"><Settings className="w-5 h-5" /></Link>
                </div>
                <Link href="/" className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5">
                  <Home className="w-5 h-5 text-orange-500" />
                  <span className="text-sm">Home</span>
                </Link>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <main className="flex-1 flex flex-col overflow-hidden bg-background">
        <header className="h-14 px-4 flex items-center justify-between border-b border-border/50 bg-background/80 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <motion.button onClick={() => setShowSidebar(true)} className="p-2 rounded-lg hover:bg-white/5" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Menu className="w-5 h-5" />
            </motion.button>
            <h1 className="font-semibold">Amkyaw AI</h1>
          </div>
          <div className="relative">
            <motion.button onClick={() => setShowModelSelect(!showModelSelect)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
              whileHover={{ scale: 1.02 }}>
              <div className={`w-6 h-6 rounded-md bg-gradient-to-br ${MODEL_COLORS[currentModel.name]} flex items-center justify-center`}>
                {MODEL_ICONS[currentModel.name]}
              </div>
              <span className="hidden sm:inline text-sm font-medium">{currentModel.displayName}</span>
              <ChevronDown className="w-4 h-4 opacity-50" />
            </motion.button>
            <AnimatePresence>
              {showModelSelect && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                  className="absolute right-0 mt-2 w-64 glass rounded-xl border border-border/50 overflow-hidden z-50">
                  {Object.entries(GROQ_MODELS).map(([key, model]) => (
                    <button key={key} onClick={() => { setSelectedModel(key as GroqModelType); setShowModelSelect(false); }}
                      className={cn('w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-white/5 transition-colors',
                        selectedModel === key && 'bg-orange-500/10')}>
                      <div className={`w-8 h-8 rounded-md bg-gradient-to-br ${MODEL_COLORS[model.name]} flex items-center justify-center`}>
                        {MODEL_ICONS[model.name]}
                      </div>
                      <div>
                        <p className="font-medium">{model.displayName}</p>
                        <p className="text-xs text-muted-foreground">{model.desc}</p>
                      </div>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {!currentChat || currentChat.messages.length === 0 ? (
            <WelcomeScreen onSelect={(text) => setInput(text)} />
          ) : (
            <AnimatePresence>
              {currentChat.messages.map((message) => (
                <ChatMessage key={message.id} message={message} onCopy={handleCopy} isCopied={copiedId === message.id} />
              ))}
            </AnimatePresence>
          )}
          
          {isThinking && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3 max-w-4xl mx-auto">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center shadow-lg">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="glass rounded-2xl px-4 py-3">
                <ProcessingIndicator type={processingType} />
              </div>
            </motion.div>
          )}

          {error && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="max-w-4xl mx-auto p-4 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20">
              <p>{error}</p>
              <button onClick={clearError} className="mt-2 text-sm underline">Dismiss</button>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <ChatInput input={input} setInput={setInput} onSubmit={handleSubmit} isLoading={isLoading} />
      </main>
    </div>
  );
}