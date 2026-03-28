'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Trash2, Plus, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface Chat {
  id: string;
  title: string;
  messages: Message[];
  updatedAt: Date;
}

export default function DashboardPage() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: userMessage.content }),
      });

      if (!response.ok) throw new Error('Failed to get response');

      const data = await response.json();
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-80 border-r border-border glass flex flex-col">
        <div className="p-4 border-b border-border">
          <button 
            onClick={() => { setMessages([]); setActiveChatId(null); }}
            className="w-full flex items-center gap-2 px-4 py-3 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-5 h-5" />
            New Chat
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {chats.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No chats yet</p>
              <p className="text-xs mt-1">Start a new conversation</p>
            </div>
          ) : (
            chats.map(chat => (
              <button
                key={chat.id}
                onClick={() => { setActiveChatId(chat.id); setMessages(chat.messages); }}
                className={cn(
                  'w-full text-left p-3 rounded-xl transition-all flex items-center gap-3',
                  activeChatId === chat.id 
                    ? 'bg-primary/20 border border-primary/30' 
                    : 'glass glass-hover'
                )}
              >
                <MessageSquare className="w-4 h-4 text-muted-foreground" />
                <span className="truncate text-sm">{chat.title}</span>
              </button>
            ))
          )}
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <AnimatePresence>
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <Bot className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
                  <h2 className="text-2xl font-semibold mb-2">How can I help you?</h2>
                  <p className="text-muted-foreground">Send a message to start a conversation</p>
                </div>
              </div>
            ) : (
              messages.map((message, index) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className={cn(
                    'flex gap-4 max-w-4xl mx-auto',
                    message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                  )}
                >
                  <div className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0',
                    message.role === 'user' 
                      ? 'bg-primary/20' 
                      : 'bg-secondary'
                  )}>
                    {message.role === 'user' 
                      ? <User className="w-5 h-5 text-primary" />
                      : <Bot className="w-5 h-5" />
                    }
                  </div>
                  <div className={cn(
                    'glass rounded-2xl p-4',
                    message.role === 'user' 
                      ? 'bg-primary/10' 
                      : ''
                  )}>
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>

          {/* Loading Skeleton */}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-4 max-w-4xl mx-auto"
            >
              <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                <Bot className="w-5 h-5" />
              </div>
              <div className="glass rounded-2xl p-4 space-y-2">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </motion.div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-border">
          <form 
            onSubmit={handleSubmit}
            className="max-w-4xl mx-auto flex gap-3"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 px-6 py-4 rounded-2xl glass border border-border focus:border-primary focus:outline-none transition-colors"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className={cn(
                'px-6 py-4 rounded-2xl font-semibold transition-all',
                input.trim() && !isLoading
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90 hover:animate-glow'
                  : 'bg-muted text-muted-foreground cursor-not-allowed'
              )}
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}