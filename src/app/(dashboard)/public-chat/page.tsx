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

// Floating particles background
const FloatingParticles = () => {
  const particles = Array.from({ length: 15 }, (_, i) => ({
    id: i,
    size: Math.random() * 5 + 2,
    x: Math.random() * 100,
    delay: Math.random() * 5,
    duration: Math.random() * 10 + 15,
    opacity: Math.random() * 0.4 + 0.1,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full bg-gradient-to-r from-orange-400/30 to-amber-400/30"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.x}%`,
            bottom: '-20px',
            opacity: p.opacity,
            animation: `floatUp ${p.duration}s linear ${p.delay}s infinite`,
          }}
        />
      ))}
      <style jsx>{`
        @keyframes floatUp {
          0% {
            transform: translateY(0) scale(1);
            opacity: 0;
          }
          10% {
            opacity: 0.5;
          }
          90% {
            opacity: 0.5;
          }
          100% {
            transform: translateY(-100vh) scale(0.5);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default function PublicChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [currentGroup, setCurrentGroup] = useState("public");
  const [groups, setGroups] = useState<{ name: string; description?: string; member_count: number }[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDescription, setNewGroupDescription] = useState("");
  const [showJoinConfirm, setShowJoinConfirm] = useState(false);
  const [pendingGroup, setPendingGroup] = useState<string | null>(null);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [selectedUser, setSelectedUser] = useState<{ username: string; bio?: string; website?: string; tiktok?: string; facebook?: string; profile_picture?: string } | null>(null);
  const [showPrivateChat, setShowPrivateChat] = useState(false);
  const [privateChatUser, setPrivateChatUser] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch groups from API
  const fetchGroups = async () => {
    try {
      const res = await fetch("/api/chat-groups");
      if (res.ok) {
        const data = await res.json();
        setGroups(data.groups || []);
      }
    } catch (err) { console.error("Failed to fetch groups:", err); }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

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
      // Call API to create group
      fetch("/api/chat-groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name: newGroupName, 
          description: newGroupDescription 
        }),
      }).then(() => {
        setCurrentGroup(newGroupName);
        setShowCreateModal(false);
        setNewGroupName("");
        setNewGroupDescription("");
        fetchGroups();
      });
    }
  };

  const handleJoinGroup = (groupName: string) => {
    if (currentGroup !== groupName) {
      setPendingGroup(groupName);
      setShowJoinConfirm(true);
    }
  };

  const confirmJoinGroup = () => {
    if (pendingGroup) {
      setCurrentGroup(pendingGroup);
      setShowJoinConfirm(false);
      setPendingGroup(null);
    }
  };

  const handleUserClick = (msg: Message) => {
    // Try to get user data from localStorage or create a basic profile
    const storedUser = localStorage.getItem("user");
    let userProfile = null;
    
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        // Check if this is the clicked user's data (we need to store user data in messages)
        userProfile = {
          username: msg.username,
          bio: userData.bio || "No bio available",
          website: userData.website || "",
          tiktok: userData.tiktok || "",
          facebook: userData.facebook || "",
          profile_picture: userData.profile_picture || "",
        };
      } catch (e) {}
    }
    
    // If no stored data, use basic info from message
    if (!userProfile) {
      userProfile = {
        username: msg.username,
        bio: "No bio available",
        website: "",
        tiktok: "",
        facebook: "",
      };
    }
    
    setSelectedUser(userProfile);
    setShowUserProfile(true);
  };

  const handleStartPrivateChat = () => {
    if (selectedUser) {
      setPrivateChatUser(selectedUser.username);
      setShowUserProfile(false);
      setShowPrivateChat(true);
    }
  };

  return (
    <div className="flex flex-col h-full bg-zinc-950 text-zinc-100 relative">
      <FloatingParticles />
      {/* Header */}
      <div className="h-16 border-b border-zinc-800 flex items-center justify-between px-4 md:px-8 bg-zinc-950/80 backdrop-blur-md relative z-10">
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
              className="flex gap-3 group"
            >
              {/* Small Avatar - Clickable */}
              <button 
                onClick={() => handleUserClick(msg)}
                className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center flex-shrink-0 hover:ring-2 hover:ring-orange-500/50 transition-all"
              >
                <User size={14} className="text-white" />
              </button>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {/* Username - Clickable */}
                  <button 
                    onClick={() => handleUserClick(msg)}
                    className="text-sm font-bold text-white hover:text-orange-500 transition-colors"
                  >
                    {msg.username}
                  </button>
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
                <div>
                  <label className="text-sm font-bold text-zinc-400">Description (optional)</label>
                  <textarea
                    value={newGroupDescription}
                    onChange={(e) => setNewGroupDescription(e.target.value)}
                    placeholder="What's this group about?"
                    rows={3}
                    className="w-full mt-1 px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-white placeholder:text-zinc-600 focus:outline-none focus:border-orange-500/50 resize-none"
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

      {/* Join Group Confirmation Modal */}
      <AnimatePresence>
        {showJoinConfirm && pendingGroup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowJoinConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-2xl p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-orange-500/20 flex items-center justify-center">
                  <Users size={32} className="text-orange-500" />
                </div>
                <h3 className="text-xl font-bold text-white">Join Group?</h3>
                <p className="text-zinc-400">
                  သင့်ကို <span className="text-orange-500 font-bold">#{pendingGroup}</span> အုပ်ချိုက်သို့ ပါဝင်လိုပါသလား?
                </p>
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setShowJoinConfirm(false)}
                    className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-medium rounded-xl transition-all"
                  >
                    မလုပ်ပါ
                  </button>
                  <button
                    onClick={confirmJoinGroup}
                    className="flex-1 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition-all"
                  >
                    ပါဝင်ပါ
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* User Profile Modal */}
      <AnimatePresence>
        {showUserProfile && selectedUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowUserProfile(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-2xl p-6"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Profile Header */}
              <div className="text-center space-y-4">
                <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center overflow-hidden">
                  <User size={40} className="text-white" />
                </div>
                <h3 className="text-xl font-bold text-white">{selectedUser.username}</h3>
                <p className="text-zinc-400 text-sm">{selectedUser.bio || "No bio available"}</p>
              </div>

              {/* Social Links */}
              {(selectedUser.website || selectedUser.tiktok || selectedUser.facebook) && (
                <div className="mt-4 space-y-2">
                  {selectedUser.website && (
                    <a href={selectedUser.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 bg-zinc-950 rounded-xl hover:bg-zinc-800 transition-all">
                      <span className="text-xl">🌐</span>
                      <span className="text-orange-400 truncate">{selectedUser.website}</span>
                    </a>
                  )}
                  {selectedUser.tiktok && (
                    <a href={`https://tiktok.com/@${selectedUser.tiktok.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 bg-zinc-950 rounded-xl hover:bg-zinc-800 transition-all">
                      <span className="text-xl">🎵</span>
                      <span className="text-orange-400">@{selectedUser.tiktok.replace('@', '')}</span>
                    </a>
                  )}
                  {selectedUser.facebook && (
                    <a href={`https://facebook.com/${selectedUser.facebook.replace('facebook.com/', '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 bg-zinc-950 rounded-xl hover:bg-zinc-800 transition-all">
                      <span className="text-xl">📘</span>
                      <span className="text-orange-400 truncate">{selectedUser.facebook}</span>
                    </a>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setShowUserProfile(false)}
                  className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-medium rounded-xl transition-all"
                >
                  ပိတ်ပါ
                </button>
                <button
                  onClick={handleStartPrivateChat}
                  className="flex-1 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition-all"
                >
                  စကားပါးပါး
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Private Chat Modal */}
      <AnimatePresence>
        {showPrivateChat && privateChatUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowPrivateChat(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center space-y-4 mb-6">
                <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
                  <MessageCircle size={32} className="text-white" />
                </div>
                <h3 className="text-xl font-bold text-white">Private Chat</h3>
                <p className="text-zinc-400">
                  <span className="text-orange-500 font-bold">@{privateChatUser}</span> နဲ့ နှစ်ယောက်ထဲစကားပါးပါး
                </p>
                <p className="text-zinc-500 text-sm">ဤကိစ္စအတွက် database table အသစ်ဖန်တီးရန် လိုပါပါ။</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowPrivateChat(false)}
                  className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-medium rounded-xl transition-all"
                >
                  ပိတ်ပါ
                </button>
                <button
                  onClick={() => {
                    // Navigate to chat page - you can implement this
                    setShowPrivateChat(false);
                  }}
                  className="flex-1 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition-all"
                >
                  စကားစမည်။
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
