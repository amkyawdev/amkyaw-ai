"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bot, User, Mail, LogOut, Settings, MessageSquare, Calendar, Edit2, Save, X, Camera } from "lucide-react";

interface UserData {
  name: string;
  email: string;
  avatar?: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setUser(userData);
      setEditName(userData.name || "");
    } else {
      router.push("/login");
    }
    setIsLoading(false);
  }, [router]);

  const handleSave = () => {
    if (user && editName.trim()) {
      const updatedUser = { ...user, name: editName.trim() };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
      setIsEditing(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    router.push("/login");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg">Amkyaw AI</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/chat" className="text-sm hover:text-orange-500">Chat</Link>
            <Link href="/settings" className="text-sm hover:text-orange-500">Settings</Link>
          </div>
        </div>
      </nav>

      <div className="pt-24 pb-12 px-4">
        <div className="max-w-2xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-8">
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-2xl font-bold">Profile</h1>
              <Link href="/settings" className="p-2 rounded-lg hover:bg-white/10">
                <Settings className="w-5 h-5" />
              </Link>
            </div>

            <div className="flex flex-col items-center mb-8">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-4xl font-bold text-white">
                  {user.name?.charAt(0).toUpperCase() || "U"}
                </div>
                <button className="absolute bottom-0 right-0 p-2 rounded-full bg-orange-500 text-white hover:bg-orange-600">
                  <Camera className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5">
                <User className="w-5 h-5 text-orange-500" />
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Name</p>
                  {isEditing ? (
                    <div className="flex items-center gap-2 mt-1">
                      <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)}
                        className="flex-1 px-3 py-2 rounded-lg bg-black/30 border border-border/50 focus:border-orange-500/50 focus:outline-none" />
                      <button onClick={handleSave} className="p-2 rounded-lg bg-green-500/20 text-green-500"><Save className="w-4 h-4" /></button>
                      <button onClick={() => { setIsEditing(false); setEditName(user.name || ""); }} className="p-2 rounded-lg bg-red-500/20 text-red-500"><X className="w-4 h-4" /></button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{user.name}</p>
                      <button onClick={() => setIsEditing(true)} className="p-1 rounded hover:bg-white/10"><Edit2 className="w-4 h-4 text-muted-foreground" /></button>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5">
                <Mail className="w-5 h-5 text-orange-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{user.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5">
                <Calendar className="w-5 h-5 text-orange-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Member since</p>
                  <p className="font-medium">{new Date().toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-border/50 space-y-3">
              <Link href="/chat" className="flex items-center gap-3 p-4 rounded-xl hover:bg-white/5 transition-colors">
                <MessageSquare className="w-5 h-5 text-orange-500" /><span>Go to Chat</span>
              </Link>
              <Link href="/settings" className="flex items-center gap-3 p-4 rounded-xl hover:bg-white/5 transition-colors">
                <Settings className="w-5 h-5 text-orange-500" /><span>Settings</span>
              </Link>
              <button onClick={handleLogout} className="w-full flex items-center gap-3 p-4 rounded-xl hover:bg-white/5 transition-colors text-red-400">
                <LogOut className="w-5 h-5" /><span>Logout</span>
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
