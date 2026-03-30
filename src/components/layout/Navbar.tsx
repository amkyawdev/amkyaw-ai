'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Home, MessageSquare, History, Settings, 
  Sparkles, User, Menu, X, BookOpen, LogIn
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';

const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/chat', label: 'Chat', icon: MessageSquare },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export default function Navbar() {
  const pathname = usePathname();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const { user, isAuthenticated } = useAuthStore();

  return (
    <>
      {/* Desktop Navbar - Smaller */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50">
        <div className="max-w-7xl mx-auto px-3 h-12 flex items-center justify-between">
          {/* Logo - Smaller */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold hidden sm:block">Amkyaw AI</span>
          </Link>

          {/* Desktop Menu - Compact */}
          <div className="hidden md:flex items-center gap-0.5">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'relative px-3 py-1.5 rounded-md flex items-center gap-1.5 text-xs transition-all',
                    isActive 
                      ? 'text-primary' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="navbar"
                      className="absolute inset-0 bg-primary/10 rounded-md"
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <item.icon className="w-3.5 h-3.5" />
                  <span className="text-xs font-medium">{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Right Side - Smaller */}
          <div className="flex items-center gap-2">
            {isAuthenticated && user ? (
              <Link href="/profile" className="flex items-center gap-1.5 px-2 py-1 rounded-md text-xs hover:bg-white/5">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                  {user.name?.charAt(0) || user.email?.charAt(0) || 'U'}
                </div>
                <span className="hidden sm:block text-xs">{user.name || user.email?.split('@')[0]}</span>
              </Link>
            ) : (
              <Link href="/login" className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary/20 text-primary text-xs font-medium hover:bg-primary/30 transition-colors">
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </Link>
            )}
            
            {/* Mobile Menu Button - Smaller */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden p-1.5 rounded-md hover:bg-white/5"
            >
              {showMobileMenu ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {showMobileMenu && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed top-12 left-0 right-0 z-40 glass border-b border-border/50 md:hidden"
        >
          <div className="p-2 space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setShowMobileMenu(false)}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-all',
                    isActive 
                      ? 'bg-primary/20 text-primary' 
                      : 'hover:bg-white/5'
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Spacer */}
      <div className="h-12" />
    </>
  );
}