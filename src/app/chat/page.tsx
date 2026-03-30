'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, Bot, User, Trash2, Plus, MessageSquare, 
  Settings, History, ChevronDown, Copy, Check,
  Sparkles, Brain, Zap, ChevronLeft, Menu, X,
  Share2, Download, FileText, Cpu
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useChatStore, Message } from '@/stores/chatStore';
import { useAuthStore } from '@/stores/authStore';
import MarkdownMessage from '@/components/chat/MarkdownMessage';
import Link from 'next/link';

const GROQ_MODELS = {
  'llama-3.3-70b': { name: 'llama-3.3-70b-versatile', displayName: 'Llama 3.3 70B', desc: 'Most capable model' },
  'llama-3.1-8b': { name: 'llama-3.1-8b-instant', displayName: 'Llama 3.1 8B', desc: 'Fast & efficient' },
  'gemma2-9b': { name: 'gemma2-9b-it', displayName: 'Gemma 2 9B', desc: 'Google Gemma' },
};

type GroqModelType = keyof typeof GROQ_MODELS;

const MODEL_ICONS: Record<string, React.ReactNode> = {
  'llama-3.3-70b-versatile': <Brain className="w-5 h-5" />,
  'llama-3.1-8b-instant': <Sparkles className="w-5 h-5" />,
  'gemma2-9b-it': <Zap className="w-5 h-5" />,
};

const MODEL_COLORS: Record<string, string> = {
  'llama-3.3-70b-versatile': 'from-purple-500 to-indigo-500',
  'llama-3.1-8b-instant': 'from-blue-500 to-cyan-500',
  'gemma2-9b-it': 'from-orange-500 to-amber-500',
};

const TypingIndicator = () => (
  <div className="flex gap-1 p-3">
    {[0, 150, 300].map((delay, i) => (
      <span key={i} className="w-2.5 h-2.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: `${delay}ms` }} />
    ))}
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
    <div className="flex items-center justify-center h-full p-8">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-2xl text-center">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', duration: 0.8 }}
          className="w-24 h-24 mx-auto mb-8 rounded-3xl bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-500 flex items-center justify-center shadow-lg">
          <Bot className="w-12 h-12 text-white" />
        </motion.div>
        <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-400 bg-clip-text text-transparent">Amkyaw AI</h2>
        <p className="text-lg text-muted-foreground mb-8">Powered by Groq - Ultra-fast AI responses</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {suggestions.map((s, i) => (
            <motion.button key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.05 }}
              onClick={() => onSelect(s.text)} className="p-4 rounded-xl glass glass-hover text-center hover:bg-white/10 transition-all">
              <span className="text-3xl mb-2 block">{s.icon}</span>
              <p className="font-medium text-sm">{s.text}</p>
            </motion.button>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

const ChatMessage = ({ message, onCopy, isCopied }: { message: Message; onCopy: (c: string, id: string) => void; isCopied: boolean }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
    className={cn('flex gap-4 max-w-4xl mx-auto', message.role === 'user' ? 'flex-row-reverse' : 'flex-row')}>
    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
      className={cn('w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg',
        message.role === 'user' ? 'bg-gradient-to-br from-primary to-purple-600' : 'bg-gradient-to-br from-orange-500 to-amber-500')}>
      {message.role === 'user' ? <User className="w-5 h-5 text-white" /> : <Bot className="w-5 h-5 text-white" />}
    </motion.div>
    <div className={cn('group rounded-3xl px-6 py-4 max-w-[75%] shadow-md',
      message.role === 'user' ? 'bg-gradient-to-r from-primary/20 to-purple-600/20 border border-primary/20' : 'glass')}>
      {message.isLoading ? <TypingIndicator /> : (
        <>
          <MarkdownMessage content={message.content} />
          <div className="flex items-center gap-1 mt-4 pt-3 border-t border-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={() => onCopy(message.content, message.id)} className="p-2 rounded-lg hover:bg-white/10">
              {isCopied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
            </button>
            <button className="p-2 rounded-lg hover:bg-white/10"><Share2 className="w-4 h-4" /></button>
            <button className="p-2 rounded-lg hover:bg-white/10"><Download className="w-4 h-4" /></button>
          </div>
        </>
      )}
    </div>
  </motion.div>
);

const ChatInput = ({ input, setInput, onSubmit, isLoading }: { input: string; setInput: (v: string) => void; onSubmit: (e: React.FormEvent) => void; isLoading: boolean }) => (
  <div className="p-4 border-t border-border/50 bg-background/80 backdrop-blur-xl sticky bottom-0">
    <form onSubmit={onSubmit} className="max-w-4xl mx-auto flex gap-3 items-end">
      <div className="flex-1 relative">
        <textarea value={input} onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onSubmit(e); } }}
          placeholder="Send a message to Amkyaw AI..."
          className="w-full px-6 py-4 rounded-3xl glass border border-border/50 focus:border-primary/50 focus:outline-none resize-none min-h-[60px] max-h-[200px] bg-black/20"
          disabled={isLoading} rows={1} />
      </div>
      <button type="submit" disabled={!input.trim() || isLoading}
        className={cn('p-4 rounded-3xl font-semibold transition-all flex items-center justify-center',
          input.trim() && !isLoading ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:shadow-lg hover:shadow-orange-500/30' : 'bg-muted text-muted-foreground cursor-not-allowed')}>
        {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send className="w-5 h-5" />}
      </button>
    </form>
    <p className="text-center text-xs text-muted-foreground mt-3">Powered by Groq API • Fast AI responses</p>
  </div>
);

export default function ChatPage() {
  const [input, setInput] = useState('');
  const [showSidebar, setShowSidebar] = useState(true);
  const [showModelSelect, setShowModelSelect] = useState(false);
  const [selectedModel, setSelectedModel] = useState<GroqModelType>('llama-3.1-8b');
  const [copiedId, setCopiedId] = useState<string | null>(null);
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

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: msgInput, model: selectedModel })
      });
      if (!response.ok) throw new Error((await response.json()).error || 'Failed');
      const data = await response.json();
      updateMessage(chatId, assistantMessage.id, { content: data.response, isLoading: false });
    } catch (err) {
      updateMessage(chatId, assistantMessage.id, { content: err instanceof Error ? err.message : 'Error connecting to AI', isLoading: false });
    } finally { setLoading(false); }
  };

  const currentModel = GROQ_MODELS[selectedModel];

  return (
    <div className="flex h-[calc(100vh-3rem)] overflow-hidden">
      <AnimatePresence>
        {showSidebar && (
          <motion.aside initial={{ x: -300, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -300, opacity: 0 }}
            className="w-80 border-r border-border/50 flex flex-col bg-background/50 backdrop-blur-xl">
            <div className="p-4 border-b border-border/50">
              <button onClick={() => createChat(selectedModel)} 
                className="w-full flex items-center justify-center gap-3 px-4 py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold hover:shadow-lg hover:shadow-orange-500/30 transition-all">
                <Plus className="w-5 h-5" /> New Chat
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {chats.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">No conversations yet</p>
                </div>
              ) : (
                chats.map(chat => (
                  <motion.button key={chat.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                    onClick={() => setCurrentChat(chat.id)}
                    className={cn('w-full text-left p-3 rounded-xl transition-all flex items-center gap-3 group',
                      currentChat?.id === chat.id ? 'bg-gradient-to-r from-orange-500/20 to-amber-500/20 border border-orange-500/30' : 'hover:bg-white/5')}>
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500/30 to-amber-500/30 flex items-center justify-center">
                      <MessageSquare className="w-4 h-4 text-orange-500" />
                    </div>
                    <span className="truncate text-sm flex-1 font-medium">{chat.title}</span>
                    <button onClick={(e) => { e.stopPropagation(); deleteChat(chat.id); }} className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-destructive/20 text-destructive">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </motion.button>
                ))
              )}
            </div>
            <div className="p-4 border-t border-border/50">
              <Link href="/profile" className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{isAuthenticated ? user?.name : 'Guest User'}</p>
                  <p className="text-xs text-muted-foreground">{isAuthenticated ? user?.email : 'Sign in to save'}</p>
                </div>
              </Link>
              <div className="flex gap-2 mt-3">
                <Link href="/history" className="flex-1 flex items-center justify-center p-2 rounded-xl hover:bg-white/5"><History className="w-4 h-4" /></Link>
                <Link href="/settings" className="flex-1 flex items-center justify-center p-2 rounded-xl hover:bg-white/5"><Settings className="w-4 h-4" /></Link>
                <Link href="/docs" className="flex-1 flex items-center justify-center p-2 rounded-xl hover:bg-white/5"><FileText className="w-4 h-4" /></Link>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-14 border-b border-border/50 px-4 flex items-center justify-between bg-background/50 backdrop-blur-xl">
          <div className="flex items-center gap-4">
            <button onClick={() => setShowSidebar(!showSidebar)} className="p-2 rounded-lg hover:bg-white/5">
              {showSidebar ? <ChevronLeft className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div className="hidden sm:block">
              <h1 className="text-lg font-semibold">Amkyaw AI</h1>
              <p className="text-xs text-muted-foreground">Powered by Groq</p>
            </div>
          </div>
          <div className="relative">
            <button onClick={() => setShowModelSelect(!showModelSelect)}
              className="flex items-center gap-3 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
              <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${MODEL_COLORS[currentModel.name]} flex items-center justify-center`}>
                {MODEL_ICONS[currentModel.name]}
              </div>
              <span className="text-sm font-medium hidden sm:inline">{currentModel.displayName}</span>
              <ChevronDown className="w-4 h-4 opacity-50" />
            </button>
            <AnimatePresence>
              {showModelSelect && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                  className="absolute right-0 mt-2 w-72 glass rounded-2xl border border-border/50 overflow-hidden z-50">
                  {Object.entries(GROQ_MODELS).map(([key, model]) => (
                    <button key={key} onClick={() => { setSelectedModel(key as GroqModelType); setShowModelSelect(false); }}
                      className={cn('w-full text-left p-4 flex items-center gap-4 hover:bg-white/5 transition-colors',
                        selectedModel === key && 'bg-white/10')}>
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${MODEL_COLORS[model.name]} flex items-center justify-center`}>
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