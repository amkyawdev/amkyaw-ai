'use client';

import { motion } from 'framer-motion';
import { User, Mail, Calendar, MessageSquare, Clock, Zap, Shield, LogOut } from 'lucide-react';
import { useChatStore } from '@/stores/chatStore';

export default function ProfilePage() {
  const { chats } = useChatStore();

  const totalMessages = chats.reduce((acc, chat) => acc + chat.messages.length, 0);
  const totalChats = chats.length;

  const stats = [
    { icon: MessageSquare, label: 'Total Chats', value: totalChats },
    { icon: Clock, label: 'Total Messages', value: totalMessages },
    { icon: Zap, label: 'API Calls', value: totalMessages },
  ];

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <User className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold">Profile</h1>
          </div>
          <p className="text-muted-foreground">
            View your account information and usage
          </p>
        </motion.div>

        <div className="grid gap-6">
          {/* Profile Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass rounded-2xl p-6"
          >
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
                <User className="w-12 h-12 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-1">Guest User</h2>
                <p className="text-muted-foreground">Free Plan</p>
              </div>
            </div>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                className="glass rounded-2xl p-6 text-center"
              >
                <stat.icon className="w-8 h-8 mx-auto mb-2 text-primary" />
                <p className="text-3xl font-bold mb-1">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </motion.div>
            ))}
          </div>

          {/* Account Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="glass rounded-2xl p-6"
          >
            <h3 className="text-xl font-semibold mb-4">Account Information</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-sm">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Email:</span>
                <span>Not connected</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Joined:</span>
                <span>{new Date().toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Shield className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Status:</span>
                <span className="text-green-500">Active</span>
              </div>
            </div>
          </motion.div>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex gap-4"
          >
            <button className="flex-1 flex items-center justify-center gap-2 p-4 rounded-xl glass glass-hover text-sm font-medium">
              <Shield className="w-4 h-4" />
              Upgrade to Pro
            </button>
            <button className="flex-1 flex items-center justify-center gap-2 p-4 rounded-xl glass glass-hover text-sm font-medium text-destructive hover:bg-destructive/10">
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}