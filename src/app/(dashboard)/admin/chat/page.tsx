"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, MessageSquare, Shield, Trash2, Ban, VolumeX, 
  AlertTriangle, RefreshCw, Search, X, Check, Hash
} from "lucide-react";

interface User {
  id: number;
  username: string;
  email: string;
  is_premium: boolean;
  created_at: string;
}

interface Message {
  id: number;
  content: string;
  created_at: string;
  group_id: number;
  username: string;
  group_name: string;
}

interface Group {
  id: number;
  name: string;
  description: string;
  created_at: string;
  member_count: number;
}

export default function AdminChatPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [blockedUsers, setBlockedUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"messages" | "users" | "groups">("messages");

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/chat?admin=true");
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
        setMessages(data.messages || []);
        setGroups(data.groups || []);
        setBlockedUsers(data.blockedUsers || []);
      }
    } catch (err) {
      console.error("Failed to fetch admin data:", err);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000); // Refresh every 10s
    return () => clearInterval(interval);
  }, []);

  const deleteMessage = async (id: number) => {
    if (!confirm("Delete this message?")) return;
    
    try {
      const res = await fetch(`/api/admin/chat?action=delete_message&id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setMessages(messages.filter((m) => m.id !== id));
      }
    } catch (err) {
      console.error("Failed to delete message:", err);
    }
  };

  const kickUser = async (userId: number, groupId: number) => {
    if (!confirm("Kick this user from the group?")) return;
    
    try {
      const res = await fetch(`/api/admin/chat?action=kick_user&user_id=${userId}&group_id=${groupId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error("Failed to kick user:", err);
    }
  };

  const blockUser = async (userId: number) => {
    if (!confirm("Block this user? They will be removed from all groups.")) return;
    
    try {
      const res = await fetch(`/api/admin/chat?action=block_user&user_id=${userId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error("Failed to block user:", err);
    }
  };

  const unblockUser = async (userId: number) => {
    try {
      const res = await fetch(`/api/admin/chat?action=unblock_user&user_id=${userId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error("Failed to unblock user:", err);
    }
  };

  const muteUser = async (userId: number) => {
    try {
      const res = await fetch(`/api/admin/chat?action=mute_user&user_id=${userId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        alert("User muted for 24 hours");
        fetchData();
      }
    } catch (err) {
      console.error("Failed to mute user:", err);
    }
  };

  const filteredMessages = messages.filter((m) =>
    m.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredUsers = users.filter(
    (u) =>
      u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <RefreshCw className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-zinc-950 text-zinc-100 p-4 md:p-6">
      <div className="max-w-6xl mx-auto w-full space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
              <Shield className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Chat Admin</h1>
              <p className="text-xs text-zinc-500">Manage messages, users & groups</p>
            </div>
          </div>
          <button
            onClick={fetchData}
            className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 transition-all"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800">
            <div className="text-2xl font-bold text-orange-500">{users.length}</div>
            <div className="text-xs text-zinc-500">Total Users</div>
          </div>
          <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800">
            <div className="text-2xl font-bold text-blue-500">{messages.length}</div>
            <div className="text-xs text-zinc-500">Total Messages</div>
          </div>
          <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800">
            <div className="text-2xl font-bold text-green-500">{groups.length}</div>
            <div className="text-xs text-zinc-500">Groups</div>
          </div>
          <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800">
            <div className="text-2xl font-bold text-red-500">{blockedUsers.length}</div>
            <div className="text-xs text-zinc-500">Blocked</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-zinc-800 pb-2">
          {[
            { id: "messages", label: "Messages", icon: MessageSquare },
            { id: "users", label: "Users", icon: Users },
            { id: "groups", label: "Groups", icon: Hash },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-orange-500/20 text-orange-400"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search..."
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 focus:border-orange-500/50 outline-none text-sm"
          />
        </div>

        {/* Content */}
        <div className="space-y-4">
          {activeTab === "messages" && (
            <div className="space-y-2">
              {filteredMessages.length === 0 ? (
                <div className="text-center py-8 text-zinc-500">No messages found</div>
              ) : (
                filteredMessages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700 transition-all"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-orange-400">@{msg.username}</span>
                          <span className="text-xs text-zinc-600">in</span>
                          <span className="text-xs text-zinc-400">#{msg.group_name}</span>
                          <span className="text-xs text-zinc-600">•</span>
                          <span className="text-xs text-zinc-500">
                            {new Date(msg.created_at).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm text-zinc-300 break-words">{msg.content}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => deleteMessage(msg.id)}
                          className="p-2 rounded-lg hover:bg-red-500/20 text-zinc-400 hover:text-red-400 transition-all"
                          title="Delete message"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          )}

          {activeTab === "users" && (
            <div className="space-y-2">
              {filteredUsers.length === 0 ? (
                <div className="text-center py-8 text-zinc-500">No users found</div>
              ) : (
                filteredUsers.map((user) => (
                  <motion.div
                    key={user.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white font-bold">
                          {user.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{user.username}</span>
                            {!user.is_premium && (
                              <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 text-xs">
                                Blocked
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-zinc-500">{user.email}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => muteUser(user.id)}
                          className="p-2 rounded-lg hover:bg-yellow-500/20 text-zinc-400 hover:text-yellow-400 transition-all"
                          title="Mute user"
                        >
                          <VolumeX className="w-4 h-4" />
                        </button>
                        {user.is_premium ? (
                          <button
                            onClick={() => blockUser(user.id)}
                            className="p-2 rounded-lg hover:bg-red-500/20 text-zinc-400 hover:text-red-400 transition-all"
                            title="Block user"
                          >
                            <Ban className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => unblockUser(user.id)}
                            className="p-2 rounded-lg hover:bg-green-500/20 text-zinc-400 hover:text-green-400 transition-all"
                            title="Unblock user"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          )}

          {activeTab === "groups" && (
            <div className="space-y-2">
              {groups.length === 0 ? (
                <div className="text-center py-8 text-zinc-500">No groups found</div>
              ) : (
                groups.map((group) => (
                  <motion.div
                    key={group.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                          <Hash className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <div className="font-medium">{group.name}</div>
                          <div className="text-xs text-zinc-500">
                            {group.member_count} members • {group.description}
                          </div>
                        </div>
                      </div>
                      <div className="text-xs text-zinc-500">
                        {new Date(group.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}