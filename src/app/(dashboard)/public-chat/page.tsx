"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Send, User, MessageCircle, Hash, AtSign, Lock } from "lucide-react";

interface Message {
  id: number;
  username: string;
  content: string;
  created_at: string;
}

export default function PublicChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setUsername(userData.username || userData.email?.split("@")[0] || "Anonymous");
    } else {
      setUsername("Guest_" + Math.random().toString(36).substring(7));
    }
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchMessages = async () => {
    try {
      const res = await fetch("/api/messages?group=public");
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      }
    } catch (err) { console.error(err); }
    setIsLoading(false);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !username) return;
    setSending(true);
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: input, group: "public", username }),
      });
      if (res.ok) {
        setInput("");
        fetchMessages();
      }
    } catch (err) { console.error(err); }
    setSending(false);
  };

  return (
    <div className="flex flex-col h-full bg-zinc-950 text-zinc-100">
      
      {/* Header */}
      <div className="h-16 border-b border-zinc-800 flex items-center justify-between px-8 bg-zinc-950/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <Users size={20} className="text-orange-500" />
          <h2 className="font-semibold text-zinc-200">Public Chat</h2>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800">
          <Hash size={14} className="text-zinc-500" />
          <span className="text-sm text-zinc-400">public-group</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="w-8 h-8 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-zinc-500">
            <MessageCircle size={48} className="mb-4 opacity-50" />
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          <AnimatePresence>
            {messages.map((msg) => (
              <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3">
                <div className="w-10 h-10 bg-zinc-800 rounded-xl flex items-center justify-center shrink-0">
                  <User size={18} className="text-zinc-500" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-white text-sm">{msg.username}</span>
                    <span className="text-[10px] text-zinc-600">{new Date(msg.created_at).toLocaleTimeString()}</span>
                  </div>
                  <p className="text-zinc-300 text-sm bg-zinc-900/50 p-3 rounded-xl rounded-tl-none border border-zinc-800/50">{msg.content}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-zinc-950 border-t border-zinc-800">
        <form onSubmit={handleSend} className="flex gap-3">
          <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type a message..." className="flex-1 p-4 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-orange-500/50" />
          <button type="submit" disabled={!input.trim() || sending} className="p-4 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white rounded-xl transition-all">
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
}
