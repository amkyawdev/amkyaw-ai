"use client";

import React, { useState, useEffect, createContext, useContext } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MessageSquare, Image as ImageIcon, Users, CreditCard, ShieldCheck, 
  Settings, LogOut, Plus, Zap, User, Info, HelpCircle, Menu, X, 
  LogIn, UserPlus
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
}

interface UsageContextType {
  user: User | null;
  isPremium: boolean;
  limits: Limits;
  login: (user: User) => void;
  logout: () => void;
  updateLimits: (limits: Partial<Limits>) => void;
}

// Context
const UsageContext = createContext<UsageContextType>({
  user: null,
  isPremium: false,
  limits: { chat: 5, image: 1 },
  login: () => {},
  logout: () => {},
  updateLimits: () => {},
});

export const useUsage = () => useContext(UsageContext);

// Provider
export function UsageProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [limits, setLimits] = useState<Limits>({ chat: 5, image: 1 });

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) setUser(JSON.parse(stored));
    const storedLimits = localStorage.getItem("limits");
    if (storedLimits) setLimits(JSON.parse(storedLimits));
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
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
      isPremium: user?.is_premium || false, 
      limits, 
      login, 
      logout,
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
  const { user, isPremium, limits, logout } = useUsage();

  // Check if user is admin
  const isAdmin = user?.email === "aung.thuyrain.at449@gmail.com";

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
          {/* Usage Stats - Only for non-premium */}
          {!isPremium && (
            <div className="px-4 py-4 bg-gradient-to-br from-orange-500/10 to-transparent rounded-2xl border border-orange-500/10 space-y-3">
              <div className="flex items-center gap-2 text-orange-500">
                <Zap size={14} fill="currentColor" />
                <span className="text-[10px] font-bold uppercase">Free Tier</span>
              </div>
              <div className="space-y-2">
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px]">
                    <span className="text-zinc-500">Chat</span>
                    <span className="text-zinc-300">{limits.chat}/5</span>
                  </div>
                  <div className="w-full h-1 bg-zinc-900 rounded-full">
                    <div className="h-full bg-orange-500" style={{ width: `${(limits.chat / 5) * 100}%` }} />
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px]">
                    <span className="text-zinc-500">Images</span>
                    <span className="text-zinc-300">{limits.image}/1</span>
                  </div>
                  <div className="w-full h-1 bg-zinc-900 rounded-full">
                    <div className="h-full bg-orange-500" style={{ width: `${(limits.image / 1) * 100}%` }} />
                  </div>
                </div>
              </div>
              <button onClick={() => handleNavigation("/payment")} className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-[10px] font-bold uppercase rounded-xl">
                Upgrade to Pro
              </button>
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
              {isPremium && <ShieldCheck size={20} className="text-orange-500" />}
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

// App Layout
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <UsageProvider>
      <div className="flex h-screen bg-zinc-950">
        <Sidebar />
        <main className="flex-1 overflow-hidden">
          {children}
        </main>
      </div>
    </UsageProvider>
  );
}