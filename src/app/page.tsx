"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { 
  Bot, MessageSquare, Code, Image, Globe, Sparkles, 
  ArrowRight, Zap, Shield, Clock, Star, Users,
  ChevronRight, Github, Twitter, Mail
} from "lucide-react";

const features = [
  {
    icon: MessageSquare,
    title: "AI Chat",
    desc: "Natural conversations with Llama 3.3 70B",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: Code,
    title: "Code Assistant",
    desc: "Write, debug, and explain code instantly",
    color: "from-purple-500 to-pink-500",
  },
  {
    icon: Globe,
    title: "Translation",
    desc: "English ↔ Burmese translation",
    color: "from-green-500 to-emerald-500",
  },
  {
    icon: Image,
    title: "Image Generation",
    desc: "Create images with AI (FLUX.1)",
    color: "from-orange-500 to-amber-500",
  },
];

const steps = [
  { num: "01", title: "Enter Prompt", desc: "Type your question or request" },
  { num: "02", title: "AI Processing", desc: "Smart routing to correct AI" },
  { num: "03", title: "Get Results", desc: "Receive text or image response" },
];

const stats = [
  { value: "50K+", label: "Active Users" },
  { value: "1M+", label: "Chats" },
  { value: "99.9%", label: "Uptime" },
  { value: "Free", label: "Pricing" },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg">Amkyaw AI</span>
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <Link href="/chat" className="text-sm hover:text-orange-500 transition-colors">Chat</Link>
              <Link href="/docs" className="text-sm hover:text-orange-500 transition-colors">Docs</Link>
              <Link href="/about" className="text-sm hover:text-orange-500 transition-colors">About</Link>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/login" className="px-4 py-2 text-sm font-medium hover:text-orange-500 transition-colors">
                Login
              </Link>
              <Link href="/chat" className="px-4 py-2 rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 text-white text-sm font-medium hover:shadow-lg hover:shadow-orange-500/25 transition-all">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-orange-500/5 via-transparent to-transparent" />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-orange-500/10 rounded-full blur-3xl" />
        
        <div className="max-w-7xl mx-auto relative">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-4xl mx-auto"
          >
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", duration: 0.8 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/20 mb-6"
            >
              <Sparkles className="w-4 h-4 text-orange-500" />
              <span className="text-sm text-orange-400">Powered by Groq + HuggingFace</span>
            </motion.div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-400 bg-clip-text text-transparent">
              Your AI Power Platform
            </h1>
            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              Chat, Code, Translate, and Generate Images - All in one place. 
              Smart intent detection automatically routes your requests to the right AI.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/chat" className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold text-lg hover:shadow-xl hover:shadow-orange-500/25 transition-all flex items-center justify-center gap-2">
                Start Chatting <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="/docs" className="w-full sm:w-auto px-8 py-4 rounded-xl glass border border-border/50 font-semibold text-lg hover:bg-white/10 transition-all flex items-center justify-center gap-2">
                Read Docs
              </Link>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20"
          >
            {stats.map((stat, i) => (
              <motion.div 
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + i * 0.1 }}
                className="text-center p-6 rounded-2xl glass"
              >
                <div className="text-3xl font-bold text-orange-500">{stat.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">Powerful AI Features</h2>
            <p className="text-muted-foreground text-lg">Everything you need in one platform</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-6 rounded-2xl glass hover:bg-white/10 transition-all group"
              >
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

      {/* How It Works */}
      <section className="py-20 px-4 bg-gradient-to-b from-transparent to-orange-500/5">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-muted-foreground text-lg">Three simple steps to get AI assistance</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="relative p-8 rounded-2xl glass"
              >
                <div className="text-6xl font-bold text-orange-500/20 mb-4">{step.num}</div>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-muted-foreground">{step.desc}</p>
                {i < steps.length - 1 && (
                  <ChevronRight className="hidden md:block absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-8 text-orange-500/50" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="p-12 rounded-3xl bg-gradient-to-r from-orange-500/20 to-amber-500/20 border border-orange-500/30 text-center"
          >
            <h2 className="text-4xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-muted-foreground text-lg mb-8">Join thousands of users using Amkyaw AI</p>
            <Link href="/chat" className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold text-lg hover:shadow-xl hover:shadow-orange-500/25 transition-all">
              Start Free Chat <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-border/50">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold">Amkyaw AI</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link href="/about" className="hover:text-orange-500 transition-colors">About</Link>
              <Link href="/docs" className="hover:text-orange-500 transition-colors">Docs</Link>
              <Link href="/privacy" className="hover:text-orange-500 transition-colors">Privacy</Link>
            </div>
            <div className="flex items-center gap-4">
              <a href="https://github.com/amkyawdev/amkyaw-ai" className="p-2 rounded-lg hover:bg-white/5 transition-colors">
                <Github className="w-5 h-5" />
              </a>
              <a href="mailto:amk.kyaw92@gmail.com" className="p-2 rounded-lg hover:bg-white/5 transition-colors">
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>
          <div className="text-center text-sm text-muted-foreground mt-8">
            © 2024 Amkyaw AI. Built with Next.js + Groq + HuggingFace.
          </div>
        </div>
      </footer>
    </div>
  );
}
