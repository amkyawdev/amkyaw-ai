"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Bot, User, Send, Hash, Plus, MessageSquare, 
  Menu, X, Loader2, LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  id: number;
  content: string;
  username: string;
  created_at: string;
}

interface ChatGroup {
  id: number;
  name: string;
  description: string;
}

export default function PublicChatPage() {
  const router = useRouter();
  const [user, setUser] = useState<{name: string; email: string} | null>(null);
  const [groups, setGroups] = useState<ChatGroup[]>([]);
  const [currentGroup, setCurrentGroup] = useState<ChatGroup | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showNewGroup, setShowNewGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [error, setError] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Check auth and load data
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      router.push("/login");
      return;
    }
    const userData = JSON.parse(storedUser);
    setUser(userData);
    loadGroups(userData.name);
  }, [router]);

  // Load messages when group changes
  useEffect(() => {
    if (currentGroup) {
      loadMessages(currentGroup.id);
      const interval = setInterval(() => loadMessages(currentGroup.id), 5000);
      return () => clearInterval(interval);
    }
  }, [currentGroup]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadGroups = async (username: string) => {
    try {
      const res = await fetch("/api/chat-groups", {
        headers: { "x-username": username }
      });
      if (res.ok) {
        const data = await res.json();
        setGroups(data);
        if (data.length > 0) setCurrentGroup(data[0]);
      } else {
        const err = await res.json();
        setError(err.error || "Failed to load groups");
      }
    } catch (err) {
      console.error("Failed to load groups:", err);
      setError("Network error");
    } finally {
      setIsLoading(false);
    }
  };

  const loadMessages = async (groupId: number) => {
    try {
      const res = await fetch(`/api/messages?group_id=${groupId}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (err) {
      console.error("Failed to load messages:", err);
    }
  };

  const createGroup = async () => {
    if (!newGroupName.trim()) return;
    try {
      const res = await fetch("/api/chat-groups", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-username": user?.name || "Anonymous"
        },
        body: JSON.stringify({ name: newGroupName.trim() })
      });
      if (res.ok) {
        const newGroup = await res.json();
        if (!groups.find(g => g.id === newGroup.id)) {
          setGroups([...groups, newGroup]);
        }
        setCurrentGroup(newGroup);
        setNewGroupName("");
        setShowNewGroup(false);
      } else {
        const err = await res.json();
        setError(err.error || "Failed to create group");
      }
    } catch (err) {
      console.error("Failed to create group:", err);
      setError("Network error");
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentGroup || !user) return;

    setIsSending(true);
    setError("");
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-username": user.name
        },
        body: JSON.stringify({
          group_id: currentGroup.id,
          content: newMessage.trim()
        })
      });
      if (res.ok) {
        setNewMessage("");
        loadMessages(currentGroup.id);
      } else {
        const err = await res.json();
        setError(err.error || "Failed to send");
      }
    } catch (err) {
      console.error("Failed to send message:", err);
      setError("Network error");
    } finally {
      setIsSending(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    router.push("/login");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <AnimatePresence>
        {showSidebar && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setShowSidebar(false)} />
            <motion.aside initial={{ x: -300 }} animate={{ x: 0 }} exit={{ x: -300 }}
              className="fixed left-0 top-0 bottom-0 w-72 border-r border-border/50 flex flex-col bg-background/95 backdrop-blur-xl z-50 md:relative md:translate-x-0">
              <div className="p-4 border-b border-border/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Hash className="w-5 h-5 text-orange-500" />
                    <span className="font-bold">Public Chats</span>
                  </div>
                  <button onClick={() => setShowSidebar(false)} className="md:hidden p-2"><X className="w-5 h-5" /></button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {groups.length === 0 ? (
                  <p className="text-center text-muted-foreground p-4">No groups yet</p>
                ) : (
                  groups.map(group => (
                    <button key={group.id} onClick={() => { setCurrentGroup(group); setShowSidebar(false); }}
                      className={cn("w-full text-left p-3 rounded-xl flex items-center gap-3 transition-all",
                        currentGroup?.id === group.id ? "bg-orange-500/15 border border-orange-500/30" : "hover:bg-white/5")}>
                      <Hash className="w-4 h-4 text-orange-500" />
                      <span className="truncate">{group.name}</span>
                    </button>
                  ))
                )}
              </div>

              <div className="p-3 border-t border-border/50">
                {showNewGroup ? (
                  <div className="space-y-2">
                    <input type="text" value={newGroupName} onChange={(e) => setNewGroupName(e.target.value)}
                      placeholder="Group name" className="w-full px-3 py-2 rounded-lg bg-black/30 border border-border/50 text-sm" />
                    <div className="flex gap-2">
                      <button onClick={createGroup} className="flex-1 py-2 rounded-lg bg-orange-500 text-white text-sm">Create</button>
                      <button onClick={() => setShowNewGroup(false)} className="px-3 py-2 rounded-lg bg-white/10 text-sm">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => setShowNewGroup(true)} className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-orange-500/10 text-orange-500 hover:bg-orange-500/20">
                    <Plus className="w-4 h-4" /> New Group
                  </button>
                )}
              </div>

              <div className="p-3 border-t border-border/50 space-y-2">
                <Link href="/profile" className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5">
                  <User className="w-5 h-5" /><span className="text-sm">{user?.name}</span>
                </Link>
                <Link href="/chat" className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5">
                  <Bot className="w-5 h-5 text-orange-500" /><span className="text-sm">AI Chat</span>
                </Link>
                <button onClick={handleLogout} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 text-red-400">
                  <LogOut className="w-5 h-5" /><span className="text-sm">Logout</span>
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-14 px-4 flex items-center justify-between border-b border-border/50 bg-background/80">
          <div className="flex items-center gap-3">
            <button onClick={() => setShowSidebar(true)} className="p-2 rounded-lg hover:bg-white/5"><Menu className="w-5 h-5" /></button>
            {currentGroup && (
              <div className="flex items-center gap-2">
                <Hash className="w-5 h-5 text-orange-500" />
                <span className="font-semibold">{currentGroup.name}</span>
              </div>
            )}
          </div>
          <Link href="/chat" className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 text-white text-sm font-medium">AI Chat</Link>
        </header>

        {error && (
          <div className="px-4 py-2 bg-red-500/10 text-red-400 text-sm">{error}</div>
        )}

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <MessageSquare className="w-12 h-12 mb-4 opacity-30" />
              <p>No messages yet</p>
              <p className="text-sm">Be the first to say something!</p>
            </div>
          ) : (
            messages.map(msg => (
              <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className={cn("flex gap-3", msg.username === user?.name ? "flex-row-reverse" : "flex-row")}>
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-white">{msg.username?.charAt(0).toUpperCase()}</span>
                </div>
                <div className={cn("max-w-[70%] rounded-2xl px-4 py-2",
                  msg.username === user?.name ? "bg-orange-500/20" : "glass")}>
                  <p className="text-xs text-orange-500 mb-1">{msg.username}</p>
                  <p className="text-sm">{msg.content}</p>
                  <p className="text-xs text-muted-foreground mt-1">{new Date(msg.created_at).toLocaleTimeString()}</p>
                </div>
              </motion.div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={sendMessage} className="p-4 border-t border-border/50">
          <div className="flex gap-3 max-w-4xl mx-auto">
            <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)}
              placeholder={`Message #${currentGroup?.name || 'general'}`}
              className="flex-1 px-4 py-3 rounded-2xl glass border border-border/50 focus:border-orange-500/50 focus:outline-none" />
            <button type="submit" disabled={!newMessage.trim() || isSending}
              className="px-4 py-3 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 text-white disabled:opacity-50">
              {isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
