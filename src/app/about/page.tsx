"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { 
  Bot, MessageSquare, Code, Image, Globe, Sparkles, 
  ArrowRight, Zap, Shield, Clock, Star, Users,
  Github, Mail, Heart, ExternalLink
} from "lucide-react";

const techStack = [
  { name: "Next.js 14", desc: "App Router, Server Components" },
  { name: "TypeScript", desc: "Type-safe development" },
  { name: "Tailwind CSS", desc: "Modern styling" },
  { name: "Groq API", desc: "Llama 3.3 70B - Fast inference" },
  { name: "HuggingFace", desc: "FLUX.1 - Image generation" },
  { name: "Neon DB", desc: "PostgreSQL - User data" },
];

const features = [
  {
    icon: MessageSquare,
    title: "AI Chat",
    desc: "Natural conversations powered by Llama 3.3 70B. Smart intent detection for better responses.",
  },
  {
    icon: Code,
    title: "Code Assistant",
    desc: "Write, debug, and explain code in Python, JavaScript, TypeScript, and more.",
  },
  {
    icon: Globe,
    title: "Translation",
    desc: "English ↔ Burmese translation. Type in any language, get accurate translations.",
  },
  {
    icon: Image,
    title: "Image Generation",
    desc: "Create stunning images with FLUX.1 AI. Just describe what you want to see.",
  },
];

export default function AboutPage() {
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
              <Link href="/about" className="text-sm text-orange-500">About</Link>
            </div>
            <Link href="/chat" className="px-4 py-2 rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 text-white text-sm font-medium">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-500 flex items-center justify-center shadow-2xl shadow-orange-500/30">
              <Bot className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">
              About Amkyaw AI
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              A powerful AI platform built for Myanmar users, powered by Groq and HuggingFace.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="p-8 rounded-2xl glass"
          >
            <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
            <p className="text-muted-foreground leading-relaxed">
              Amkyaw AI သည် မြန်မာအသိုင်းအဝိုင်းအတွက် အပြည်ပြည်ဆိုင်ရာ AI နည်းပါးများကို လွယ်ကူစွာ သုံးလို့ရအောင် ဖန်တီးထားပပါ။ 
              သင်္ချာ၊ ပရိုဂရမ်းမင်း၊ ဘာသာပြန်ခြင်း၊ ပုံဖန်တီးခြင်းများအတွက် တစ်နေရာတည်းမှာ ရရှိပါတယ်။
              <br /><br />
              We aim to make cutting-edge AI accessible to everyone in Myanmar and beyond.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-4">Key Features</h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-6 rounded-2xl glass"
              >
                <feature.icon className="w-8 h-8 text-orange-500 mb-4" />
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="py-16 px-4 bg-gradient-to-b from-transparent to-orange-500/5">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-4">Technology Stack</h2>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {techStack.map((tech, i) => (
              <motion.div
                key={tech.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-4 rounded-xl glass text-center"
              >
                <div className="font-semibold">{tech.name}</div>
                <div className="text-sm text-muted-foreground">{tech.desc}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="p-8 rounded-2xl bg-gradient-to-r from-orange-500/20 to-amber-500/20 border border-orange-500/30 text-center"
          >
            <h2 className="text-2xl font-bold mb-4">Get In Touch</h2>
            <p className="text-muted-foreground mb-6">
              Questions? Suggestions? Want to collaborate?
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a 
                href="mailto:amk.kyaw92@gmail.com" 
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-orange-500 text-white font-medium hover:bg-orange-600 transition-colors"
              >
                <Mail className="w-5 h-5" /> Contact Us
              </a>
              <a 
                href="https://github.com/amkyawdev/amkyaw-ai" 
                target="_blank"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl glass font-medium hover:bg-white/10 transition-colors"
              >
                <Github className="w-5 h-5" /> GitHub
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border/50">
        <div className="max-w-7xl mx-auto text-center text-sm text-muted-foreground">
          <p>© 2024 Amkyaw AI. Made with <Heart className="w-4 h-4 inline text-red-500" /> in Myanmar.</p>
        </div>
      </footer>
    </div>
  );
}
