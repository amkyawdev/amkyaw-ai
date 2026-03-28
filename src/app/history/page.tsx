'use client';

import { motion } from 'framer-motion';
import { History, Search, Calendar, MessageSquare, Trash2, ChevronRight, Filter } from 'lucide-react';
import { useChatStore, Chat } from '@/stores/chatStore';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export default function HistoryPage() {
  const { chats, setCurrentChat, deleteChat } = useChatStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');

  const filteredChats = chats.filter(chat => {
    const matchesSearch = chat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chat.messages.some(m => m.content.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (!matchesSearch) return false;

    const now = new Date();
    const chatDate = new Date(chat.createdAt);
    
    if (filter === 'today') {
      return chatDate.toDateString() === now.toDateString();
    } else if (filter === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return chatDate >= weekAgo;
    } else if (filter === 'month') {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      return chatDate >= monthAgo;
    }
    
    return true;
  });

  const formatChatDate = (date: Date) => {
    const now = new Date();
    const chatDate = new Date(date);
    
    if (chatDate.toDateString() === now.toDateString()) {
      return 'Today';
    } else if (chatDate.toDateString() === new Date(now.getTime() - 24 * 60 * 60 * 1000).toDateString()) {
      return 'Yesterday';
    } else {
      return chatDate.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: chatDate.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      });
    }
  };

  const getMessageCount = (chat: Chat) => {
    return chat.messages.filter(m => m.role !== 'assistant' || m.content).length;
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <History className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold">Chat History</h1>
          </div>
          <p className="text-muted-foreground">
            View and manage your past conversations
          </p>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col sm:flex-row gap-4 mb-6"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl glass border border-border focus:border-primary focus:outline-none"
            />
          </div>
          <div className="flex gap-2">
            {(['all', 'today', 'week', 'month'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                  filter === f 
                    ? 'bg-primary text-primary-foreground' 
                    : 'glass glass-hover'
                )}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Chat List */}
        <div className="space-y-3">
          {filteredChats.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <MessageSquare className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
              <h3 className="text-xl font-semibold mb-2">No conversations found</h3>
              <p className="text-muted-foreground">
                {searchQuery ? 'Try a different search term' : 'Start a new chat to see it here'}
              </p>
            </motion.div>
          ) : (
            filteredChats.map((chat, index) => (
              <motion.button
                key={chat.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => setCurrentChat(chat.id)}
                className="w-full text-left p-4 rounded-xl glass glass-hover group hover:border-primary/30 transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h3 className="font-semibold truncate">{chat.title}</h3>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatChatDate(chat.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {chat.messages[chat.messages.length - 1]?.content.slice(0, 100) || 'No messages'}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span>{getMessageCount(chat)} messages</span>
                      <span className="capitalize">{chat.model}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteChat(chat.id);
                      }}
                      className="p-2 rounded-lg hover:bg-destructive/20 text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <ChevronRight className="w-5 h-5" />
                  </div>
                </div>
              </motion.button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}