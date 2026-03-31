"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User, Mail, MessageSquare, ImageIcon, Crown } from "lucide-react";
import { useUsage } from "@/components/layout/Sidebar";

export default function ProfilePage() {
  const router = useRouter();
  const { user, isPremium } = useUsage();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) router.push("/login");
    setLoading(false);
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-zinc-950">
        <div className="w-8 h-8 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex flex-col h-full bg-zinc-950 text-zinc-100 p-4 md:p-8 overflow-y-auto">
      <div className="max-w-2xl mx-auto w-full space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="w-24 h-24 mx-auto rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-xl shadow-orange-500/20">
            {user.profile_picture ? (
              <img src={user.profile_picture} alt="Avatar" className="w-full h-full object-cover rounded-2xl" />
            ) : (
              <User size={48} className="text-white" />
            )}
          </div>
          <h2 className="text-3xl font-extrabold text-white">{user.username || "User"}</h2>
          <p className="text-zinc-500">{user.email}</p>
          {isPremium && (
            <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-orange-500/10 text-orange-500 rounded-full text-sm font-bold uppercase">
              <Crown size={14} /> Premium Member
            </span>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl text-center">
            <MessageSquare size={24} className="mx-auto mb-2 text-zinc-500" />
            <div className="text-2xl font-bold text-white">0</div>
            <div className="text-xs text-zinc-500 uppercase">Chats</div>
          </div>
          <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl text-center">
            <ImageIcon size={24} className="mx-auto mb-2 text-zinc-500" />
            <div className="text-2xl font-bold text-white">0</div>
            <div className="text-xs text-zinc-500 uppercase">Images</div>
          </div>
          <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl text-center">
            <Crown size={24} className="mx-auto mb-2 text-orange-500" />
            <div className="text-2xl font-bold text-orange-500">{isPremium ? "Pro" : "Free"}</div>
            <div className="text-xs text-zinc-500 uppercase">Plan</div>
          </div>
        </div>

        {/* Info */}
        <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-2xl space-y-4">
          <h3 className="font-bold text-white text-lg">Account Details</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-zinc-950 rounded-xl">
              <User size={18} className="text-zinc-500" />
              <span className="text-zinc-300">{user.username || "Not set"}</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-zinc-950 rounded-xl">
              <Mail size={18} className="text-zinc-500" />
              <span className="text-zinc-300">{user.email}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
