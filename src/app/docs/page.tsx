"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { BookOpen, Bot, MessageSquare, Code, Image, Globe, Settings, Hash, Sparkles, ChevronRight, Github, Mail } from "lucide-react";

const sections = [
  { title: "Getting Started", icon: Sparkles, items: [
    { name: "Introduction", desc: "What is Amkyaw AI?" },
    { name: "Quick Start", desc: "Get started in 30 seconds" },
  ]},
  { title: "AI Features", icon: Bot, items: [
    { name: "AI Chat", desc: "Chat with Llama 3.3 70B" },
    { name: "Code Assistant", desc: "Write and debug code" },
    { name: "Translation", desc: "English ↔ Burmese" },
    { name: "Image Generation", desc: "Create images with FLUX.1" },
  ]},
  { title: "Community", icon: Hash, items: [
    { name: "Public Chat", desc: "Group discussions" },
    { name: "Create Group", desc: "Start new conversation" },
  ]},
  { title: "Account", icon: Settings, items: [
    { name: "Login", desc: "Sign in to your account" },
    { name: "Register", desc: "Create new account" },
    { name: "Profile", desc: "Manage your profile" },
  ]},
];

export default function DocsPage() {
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
            <Link href="/chat" className="text-sm hover:text-orange-500">AI Chat</Link>
            <Link href="/public-chat" className="text-sm hover:text-orange-500">Public Chat</Link>
          </div>
        </div>
      </nav>

      <div className="pt-24 pb-12 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-4xl font-bold">Documentation</h1>
            </div>
            <p className="text-muted-foreground text-lg">Learn how to use Amkyaw AI Power Platform</p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {sections.map((section, i) => (
              <motion.div key={section.title} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                className="glass rounded-2xl overflow-hidden">
                <div className="p-5 border-b border-border/50 flex items-center gap-4">
                  <section.icon className="w-5 h-5 text-orange-500" />
                  <h2 className="text-xl font-semibold">{section.title}</h2>
                </div>
                <div className="p-4">
                  <div className="grid gap-2">
                    {section.items.map((item) => (
                      <Link key={item.name} href={item.name === "Introduction" ? "/about" : "/" + item.name.toLowerCase().replace(" ", "-")}
                        className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors group">
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-muted-foreground">{item.desc}</p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-orange-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Link>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
