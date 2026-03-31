"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Send, User, MessageCircle, Hash, AtSign, Lock, Plus, X, ArrowRight } from "lucide-react";

interface Message {
  id: number;
  username: string;
  content: string;
  created_at: string;
  group_name?: string;
}

interface Group {
  name: string;
  member_count: number;
}

export default function PublicChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [currentGroup, setCurrentGroup] = useState("public");
  const [groups, setGroups] = useState<Group[]>([
    { name: "AI Chat", member_count: 128 },
    { name: "Coding", member_count: 85 },
    { name: "Myanmar", member_count: 234 },
    { name: "Technology", member_count: 156 },
    { name: "General", member_count: 312 },
  ]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
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
  }, [currentGroup]);

  const fetchMessages = async () => {
    try {
      const res = await fetch(`/api/messages?group=${currentGroup}`);
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
        body: JSON.stringify({ content: input, group: currentGroup, username }),
      });
      if (res.ok) {
        setInput("");
        fetchMessages();
      }
    } catch (err) { console.error(err); }
    setSending(false);
  };

  const handleCreateGroup = () => {
    if (newGroupName.trim()) {
      setGroups([...groups, { name: newGroupName, member_count: 1 }]);
      setCurrentGroup(newGroupName);
      setShowCreateModal(false);
      setNewGroupName("");
    }
  };

  const handleJoinGroup = (groupName: string) => {
    setCurrentGroup(groupName);
  };

  return (
    <div className="flex flex-col h-full bg-zinc-950 text-zinc-100">
      {/* Header */}
      <div className="h-16 border-b border-zinc-800 flex items-center justify-between px-4 md:px-8 bg-zinc-950/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <Users size={20} className="text-orange-500" />
          <h2 className="font-semibold text-zinc-200">Public Chat</h2>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium transition-all"
        >
          <Plus size={16} />
          <span className="hidden md:inline">Create Group</span>
        </button>
      </div>

      {/* Scrolling Group Names */}
      <div className="h-12 border-b border-zinc-800/50 bg-zinc-900/30 overflow-hidden flex items-center">
        <motion.div
          className="flex items-center gap-4 px-4 whitespace-nowrap"
          animate={{ x: [0, -500] }}
          transition={{ 
            x: { repeat: Infinity, repeatType: "loop", duration: 20, ease: "linear" }
          }}
        >
          {groups.map((group) => (
            <button
              key={group.name}
              onClick={() => handleJoinGroup(group.name)}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                currentGroup === group.name 
                  ? "bg-orange-500/20 text-orange-500 border border-orange-500/30" 
                  : "bg-zinc-800/50 text-zinc-400 hover:text-white hover:bg-zinc-800"
              }`}
            >
              <Hash size={12} />
              {group.name}
              <span className="text-xs opacity-60">({group.member_count})</span>
            </button>
          ))}
          {/* Duplicate for smooth scroll */}
          {groups.map((group) => (
            <button
              key={`dup-${group.name}`}
              onClick={() => handleJoinGroup(group.name)}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                currentGroup === group.name 
                  ? "bg-orange-500/20 text-orange-500 border border-orange-500/30" 
                  : "bg-zinc-800/50 text-zinc-400 hover:text-white hover:bg-zinc-800"
              }`}
            >
              <Hash size={12} />
              {group.name}
              <span className="text-xs opacity-60">({group.member_count})</span>
            </button>
          ))}
        </motion.div>
      </div>

      {/* Current Group */}
      <div className="px-4 py-2 bg-zinc-900/50 border-b border-zinc-800/50 flex items-center gap-2">
        <Hash size={14} className="text-orange-500" />
        <span className="text-sm font-medium text-white">{currentGroup}</span>
        <span className="text-xs text-zinc-500">Joined</span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="w-8 h-8 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <MessageCircle size={48} className="text-zinc-600 mb-4" />
            <p className="text-zinc-500">No messages yet. Be the first to say hello!</p>
          </div>
        ) : (
          messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-3"
            >
              {/* Small Avatar */}
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center flex-shrink-0">
                <User size={14} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-bold text-white">{msg.username}</span>
                  <span className="text-xs text-zinc-500">
                    {new Date(msg.created_at).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-sm text-zinc-300 break-words">{msg.content}</p>
              </div>
            </motion.div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-4 border-t border-zinc-800">
        <div className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Message #${currentGroup}...`}
            className="flex-1 px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-white placeholder:text-zinc-600 focus:outline-none focus:border-orange-500/50"
          />
          <button
            type="submit"
            disabled={!input.trim() || sending}
            className="px-4 py-3 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 rounded-xl text-white font-medium transition-all"
          >
            <Send size={18} />
          </button>
        </div>
      </form>

      {/* Create Group Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">Create New Group</h3>
                <button onClick={() => setShowCreateModal(false)} className="text-zinc-500 hover:text-white">
                  <X size={20} />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-bold text-zinc-400">Group Name</label>
                  <input
                    type="text"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    placeholder="Enter group name..."
                    className="w-full mt-1 px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-white placeholder:text-zinc-600 focus:outline-none focus:border-orange-500/50"
                  />
                </div>
                <button
                  onClick={handleCreateGroup}
                  disabled={!newGroupName.trim()}
                  className="w-full py-3 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold rounded-xl flex items-center justify-center gap-2"
                >
                  Create Group <ArrowRight size={18} />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
