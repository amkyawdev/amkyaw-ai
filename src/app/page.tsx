"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { 
  Bot, MessageSquare, Code, Image, Globe, Sparkles, 
  ArrowRight, Users, Hash, ChevronRight, Github, Mail, Heart, User, Settings
} from "lucide-react";

const features = [
  { icon: MessageSquare, title: "AI Chat", desc: "Llama 3.3 70B", color: "from-blue-500 to-cyan-500", href: "/chat" },
  { icon: Code, title: "Code Assistant", desc: "Write & debug code", color: "from-purple-500 to-pink-500", href: "/chat" },
  { icon: Globe, title: "Translation", desc: "English ↔ Burmese", color: "from-green-500 to-emerald-500", href: "/chat" },
  { icon: Image, title: "Image Gen", desc: "FLUX.1 AI", color: "from-orange-500 to-amber-500", href: "/chat" },
];

const navItems = [
  { icon: Bot, label: "AI Chat", href: "/chat" },
  { icon: Hash, label: "Public Chat", href: "/public-chat" },
  { icon: Users, label: "About", href: "/about" },
  { icon: MessageSquare, label: "Docs", href: "/docs" },
];

export default function Home() {
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
          <div className="hidden md:flex items-center gap-6">
            {navItems.map(item => (
              <Link key={item.href} href={item.href} className="text-sm hover:text-orange-500 transition-colors">
                {item.label}
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="px-4 py-2 text-sm font-medium hover:text-orange-500">Login</Link>
            <Link href="/chat" className="px-4 py-2 rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 text-white text-sm font-medium">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      <section className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/20 mb-6">
              <Sparkles className="w-4 h-4 text-orange-500" />
              <span className="text-sm text-orange-400">Powered by Groq + HuggingFace</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-400 bg-clip-text text-transparent">
              Your AI Power Platform
            </h1>
            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              Chat, Code, Translate, Generate Images - All in one. Smart routing automatically selects the right AI.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/chat" className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold text-lg hover:shadow-xl hover:shadow-orange-500/25 transition-all flex items-center justify-center gap-2">
                Start Chatting <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="/public-chat" className="w-full sm:w-auto px-8 py-4 rounded-xl glass border border-border/50 font-semibold text-lg hover:bg-white/10 transition-all flex items-center justify-center gap-2">
                <Hash className="w-5 h-5" /> Public Chat
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <motion.div key={feature.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                className="p-6 rounded-2xl glass hover:bg-white/10 transition-all group">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 px-4 bg-gradient-to-b from-transparent to-orange-500/5">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">Navigate</h2>
          </motion.div>
          <div className="grid md:grid-cols-4 gap-4">
            {navItems.map((item, i) => (
              <Link key={item.href} href={item.href}>
                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                  className="p-6 rounded-2xl glass hover:bg-white/10 transition-all flex flex-col items-center gap-3 group">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500/20 to-amber-500/20 flex items-center justify-center">
                    <item.icon className="w-6 h-6 text-orange-500" />
                  </div>
                  <span className="font-semibold">{item.label}</span>
                  <ChevronRight className="w-5 h-5 text-orange-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <footer className="py-8 px-4 border-t border-border/50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold">Amkyaw AI</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link href="/about" className="hover:text-orange-500">About</Link>
            <Link href="/docs" className="hover:text-orange-500">Docs</Link>
          </div>
          <div className="flex items-center gap-4">
            <a href="https://github.com/amkyawdev/amkyaw-ai" className="p-2 rounded-lg hover:bg-white/5"><Github className="w-5 h-5" /></a>
            <a href="mailto:amk.kyaw92@gmail.com" className="p-2 rounded-lg hover:bg-white/5"><Mail className="w-5 h-5" /></a>
          </div>
        </div>
        <div className="text-center text-sm text-muted-foreground mt-6">
          © 2024 Amkyaw AI. Made with <Heart className="w-4 h-4 inline text-red-500" /> in Myanmar.
        </div>
      </footer>
    </div>
  );
}
