"use client";

import React, { useState, useEffect, createContext, useContext } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  MessageSquare, Image as ImageIcon, Users, CreditCard, ShieldCheck, 
  Settings, LogOut, Plus, Zap, User, Info, HelpCircle, Menu, X, 
  LogIn
} from "lucide-react";
import { cn } from "@/lib/utils";

// Types
interface User {
  id: number;
  username: string;
  email: string;
  is_premium: boolean;
  profile_picture?: string;
}

interface Limits {
  chat: number;
  image: number;
  isUnlimited?: boolean;
}

interface UsageContextType {
  user: User | null;
  isPremium: boolean;
  isAdmin: boolean;
  limits: Limits;
  login: (user: User) => void;
  logout: () => void;
  useFeature: (feature: string) => boolean;
  updateLimits: (limits: Partial<Limits>) => void;
}

// Context
const UsageContext = createContext<UsageContextType>({
  user: null,
  isPremium: false,
  isAdmin: false,
  limits: { chat: 30, image: 5 },
  login: () => {},
  logout: () => {},
  useFeature: () => true,
  updateLimits: () => {},
});

export const useUsage = () => useContext(UsageContext);

// Provider
export function UsageProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [limits, setLimits] = useState<Limits>({ chat: 30, image: 5 });
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      const userData = JSON.parse(stored);
      setUser(userData);
      
      // Check if admin (aung.thuyrain.at449@gmail.com)
      if (userData.email === "aung.thuyrain.at449@gmail.com") {
        setIsAdmin(true);
        setLimits({ chat: 999999, image: 999999, isUnlimited: true });
      } else {
        // Demo mode: 30 chat, 5 image
        const storedLimits = localStorage.getItem("limits");
        if (storedLimits) {
          setLimits(JSON.parse(storedLimits));
        } else {
          setLimits({ chat: 30, image: 5 });
          localStorage.setItem("limits", JSON.stringify({ chat: 30, image: 5 }));
        }
      }
    } else {
      // Not logged in - demo mode
      setLimits({ chat: 30, image: 5 });
      localStorage.setItem("limits", JSON.stringify({ chat: 30, image: 5 }));
    }
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
    
    // Set limits based on email
    if (userData.email === "aung.thuyrain.at449@gmail.com") {
      setIsAdmin(true);
      setLimits({ chat: 999999, image: 999999, isUnlimited: true });
    } else {
      setIsAdmin(false);
      setLimits({ chat: 30, image: 5 });
      localStorage.setItem("limits", JSON.stringify({ chat: 30, image: 5 }));
    }
  };

  const logout = () => {
    setUser(null);
    setIsAdmin(false);
    localStorage.removeItem("user");
    // Reset to demo mode
    setLimits({ chat: 30, image: 5 });
    localStorage.setItem("limits", JSON.stringify({ chat: 30, image: 5 }));
  };

  const useFeature = (feature: string): boolean => {
    if (isAdmin) return true; // No limit for admin
    
    if (feature === "chat" && limits.chat > 0) {
      setLimits(prev => ({ ...prev, chat: prev.chat - 1 }));
      localStorage.setItem("limits", JSON.stringify({ ...limits, chat: limits.chat - 1 }));
      return true;
    }
    if (feature === "image" && limits.image > 0) {
      setLimits(prev => ({ ...prev, image: prev.image - 1 }));
      localStorage.setItem("limits", JSON.stringify({ ...limits, image: limits.image - 1 }));
      return true;
    }
    return false;
  };

  const updateLimits = (newLimits: Partial<Limits>) => {
    setLimits(prev => {
      const updated = { ...prev, ...newLimits };
      localStorage.setItem("limits", JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <UsageContext.Provider value={{ 
      user, 
      isPremium: user?.is_premium || isAdmin, 
      isAdmin,
      limits, 
      login, 
      logout,
      useFeature,
      updateLimits 
    }}>
      {children}
    </UsageContext.Provider>
  );
}

// Menu Items
const menuGroups = [
  {
    title: "Core Features",
    items: [
      { id: "/chat", label: "AI Chat", icon: MessageSquare },
      { id: "/image", label: "Image Generator", icon: ImageIcon },
    ]
  },
  {
    title: "Community",
    items: [
      { id: "/public-chat", label: "Public Groups", icon: Users },
    ]
  },
  {
    title: "Account",
    items: [
      { id: "/profile", label: "My Profile", icon: User },
      { id: "/payment", label: "Subscription", icon: CreditCard },
    ]
  },
  {
    title: "Resources",
    items: [
      { id: "/docs", label: "Documentation", icon: HelpCircle },
      { id: "/about", label: "About Platform", icon: Info },
    ]
  }
];

// Sidebar Component
export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const { user, isPremium, isAdmin, limits, logout, useFeature } = useUsage();

  // Add admin menu for admin user
  const allMenuGroups = isAdmin 
    ? [...menuGroups, { title: "System", items: [{ id: "/admin", label: "Admin Panel", icon: ShieldCheck }] }]
    : menuGroups;

  const handleNavigation = (path: string) => {
    router.push(path);
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile Toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 p-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white md:hidden shadow-xl"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden" onClick={() => setIsOpen(false)} />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed md:relative z-40 w-72 bg-zinc-950 border-r border-zinc-800/50 flex flex-col h-full transition-transform duration-300",
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        {/* Header */}
        <div className="p-6 flex items-center justify-between border-b border-zinc-900/50">
          <Link href="/" className="flex items-center gap-3" onClick={() => setIsOpen(false)}>
            <div className="w-9 h-9 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20">
              <span className="text-white font-bold text-xl">A</span>
            </div>
            <div className="flex flex-col">
              <h1 className="text-white font-bold text-lg">Amkyaw AI</h1>
              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Intelligence v1.2</span>
            </div>
          </Link>
          <button onClick={() => setIsOpen(false)} className="md:hidden text-zinc-500 hover:text-white">
            <X size={20} />
          </button>
        </div>

        {/* Menu */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
          {/* New Chat */}
          <button 
            onClick={() => handleNavigation("/chat")}
            className="w-full flex items-center justify-center gap-3 px-4 py-3.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white rounded-2xl transition-all border border-zinc-800/50 group"
          >
            <Plus size={18} className="text-orange-500 group-hover:rotate-90 transition-transform" />
            <span className="text-sm font-bold">New Conversation</span>
          </button>

          {/* Menu Groups */}
          {allMenuGroups.map((group, idx) => (
            <div key={idx} className="space-y-2">
              <h3 className="px-4 text-[10px] font-bold text-zinc-600 uppercase tracking-[0.2em]">
                {group.title}
              </h3>
              <div className="space-y-1">
                {group.items.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleNavigation(item.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all group relative",
                      pathname === item.id
                        ? "bg-orange-500/10 text-white border border-orange-500/20"
                        : "text-zinc-500 hover:bg-zinc-900 hover:text-zinc-200 border border-transparent"
                    )}
                  >
                    {pathname === item.id && (
                      <motion.div layoutId="active-pill" className="absolute left-0 w-1 h-6 bg-orange-500 rounded-r-full" />
                    )}
                    <item.icon size={18} className={pathname === item.id ? "text-orange-500" : "group-hover:text-orange-400"} />
                    <span className={cn("text-sm font-semibold", pathname === item.id ? "text-white" : "text-zinc-500 group-hover:text-zinc-200")}>
                      {item.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-900/50 space-y-4 bg-zinc-950/50">
          {/* Usage Stats - Only for non-admin */}
          {!isAdmin && (
            <div className="px-4 py-4 bg-gradient-to-br from-orange-500/10 to-transparent rounded-2xl border border-orange-500/10 space-y-3">
              <div className="flex items-center gap-2 text-orange-500">
                <Zap size={14} fill="currentColor" />
                <span className="text-[10px] font-bold uppercase">Demo Mode</span>
              </div>
              <div className="space-y-2">
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px]">
                    <span className="text-zinc-500">Chat</span>
                    <span className="text-zinc-300">{limits.chat}/30</span>
                  </div>
                  <div className="w-full h-1 bg-zinc-900 rounded-full">
                    <div className="h-full bg-orange-500" style={{ width: `${(limits.chat / 30) * 100}%` }} />
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px]">
                    <span className="text-zinc-500">Images</span>
                    <span className="text-zinc-300">{limits.image}/5</span>
                  </div>
                  <div className="w-full h-1 bg-zinc-900 rounded-full">
                    <div className="h-full bg-orange-500" style={{ width: `${(limits.image / 5) * 100}%` }} />
                  </div>
                </div>
              </div>
              <button onClick={() => handleNavigation("/payment")} className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-[10px] font-bold uppercase rounded-xl">
                Upgrade to Pro
              </button>
            </div>
          )}

          {/* Admin Badge */}
          {isAdmin && (
            <div className="px-4 py-3 bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-2xl border border-purple-500/20">
              <div className="flex items-center gap-2 text-purple-400">
                <ShieldCheck size={14} />
                <span className="text-[10px] font-bold uppercase">Admin Mode</span>
              </div>
              <p className="text-[10px] text-zinc-500 mt-1">No limits - Full access</p>
            </div>
          )}

          {/* Settings & Logout */}
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => handleNavigation("/settings")} className={cn(
              "flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl transition-all",
              pathname === "/settings" ? "bg-zinc-900 border-zinc-800 text-white" : "text-zinc-500 hover:bg-zinc-900 hover:text-zinc-200"
            )}>
              <Settings size={18} />
              <span className="text-[10px] font-bold uppercase">Settings</span>
            </button>
            {user ? (
              <button onClick={logout} className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl text-zinc-500 hover:bg-red-500/10 hover:text-red-500 transition-all">
                <LogOut size={18} />
                <span className="text-[10px] font-bold uppercase">Logout</span>
              </button>
            ) : (
              <button onClick={() => handleNavigation("/login")} className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl text-zinc-500 hover:bg-zinc-900 hover:text-zinc-200 transition-all">
                <LogIn size={18} />
                <span className="text-[10px] font-bold uppercase">Login</span>
              </button>
            )}
          </div>

          {/* User Profile */}
          {user && (
            <div className="p-3 bg-zinc-900/50 border border-zinc-800/50 rounded-2xl flex items-center gap-3 cursor-pointer hover:bg-zinc-900 transition-all" onClick={() => handleNavigation("/profile")}>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-900 border border-zinc-700 flex items-center justify-center">
                {user.profile_picture ? (
                  <img src={user.profile_picture} alt="Avatar" className="w-full h-full object-cover rounded-xl" referrerPolicy="no-referrer" />
                ) : (
                  <User size={20} className="text-zinc-500" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white truncate">{user.username}</p>
                <p className="text-[10px] text-zinc-500 truncate">{user.email}</p>
              </div>
              {(isPremium || isAdmin) && <ShieldCheck size={20} className="text-orange-500" />}
            </div>
          )}

          {/* Support Line */}
          <div className="px-4 py-3 bg-zinc-900/30 rounded-xl border border-zinc-900/50 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[8px] text-zinc-600 uppercase font-bold">Support</span>
              <span className="text-[10px] text-zinc-400 font-bold">09677740154</span>
            </div>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          </div>
        </div>
      </div>
    </>
  );
}
