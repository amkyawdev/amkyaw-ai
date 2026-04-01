"use client";

import { Info, Sparkles, Shield, Zap, Cpu, Globe, Heart, Users, Star } from "lucide-react";
import { motion } from "framer-motion";

export default function AboutPage() {
  const features = [
    { icon: Zap, title: "အလွန်မြန်", desc: "နှေးကွာမှုနည်းပါပါ အချိန်နှောင့်အယာက် လုပ်ပါ။" },
    { icon: Shield, title: "လုံခြုံပါ", desc: "သင့်ဒေတာများ ကာကွယ်ပါ။ အီန်ကရိုပ့်ပါ။" },
    { icon: Cpu, title: "အဆင့်မြင့် AI", desc: "နောက်ဆုံး LLM မော်ဒယ်များနဲ့ လုပ်ပါ။" },
  ];

  return (
    <div className="flex flex-col h-full bg-zinc-950 text-zinc-100 p-4 md:p-8 overflow-y-auto relative">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-500/5 rounded-full blur-[120px] -z-10 pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-[120px] -z-10 pointer-events-none" />

      <div className="max-w-4xl mx-auto w-full space-y-12">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-500 text-sm font-medium">
            <Info size={14} />
            <span>About Platform</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
            Empowering Creativity with AI
          </h2>
          <p className="text-zinc-500 max-w-2xl mx-auto text-lg leading-relaxed">
            Amkyaw AI is a cutting-edge platform designed to bring the power of artificial intelligence to everyone. From high-quality image generation to advanced chat capabilities, we're building the future of digital creativity.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className="p-8 bg-zinc-900 border border-zinc-800 rounded-3xl text-center space-y-4 hover:border-orange-500/50 transition-all group"
            >
              <div className="w-16 h-16 bg-orange-500/10 rounded-2xl flex items-center justify-center mx-auto text-orange-500 group-hover:scale-110 transition-transform">
                <feature.icon size={32} />
              </div>
              <h4 className="text-xl font-bold text-white">{feature.title}</h4>
              <p className="text-zinc-500 text-sm leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Mission Section */}
        <div className="p-10 bg-zinc-900 border border-zinc-800 rounded-[40px] text-center space-y-8">
          <div className="w-20 h-20 bg-orange-500/10 rounded-full flex items-center justify-center mx-auto">
            <Sparkles className="text-orange-500" size={40} />
          </div>
          <div className="space-y-4">
            <h3 className="text-3xl font-bold text-white">Our Mission</h3>
            <p className="text-zinc-500 max-w-xl mx-auto">
              To democratize access to advanced AI technology and provide tools that inspire and enable people to create, communicate, and innovate like never before.
            </p>
          </div>
          <div className="flex items-center justify-center gap-8 pt-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-white">10K+</p>
              <p className="text-xs text-zinc-500 uppercase tracking-widest font-bold">Users</p>
            </div>
            <div className="w-px h-12 bg-zinc-800" />
            <div className="text-center">
              <p className="text-3xl font-bold text-white">500K+</p>
              <p className="text-xs text-zinc-500 uppercase tracking-widest font-bold">Generations</p>
            </div>
            <div className="w-px h-12 bg-zinc-800" />
            <div className="text-center">
              <p className="text-3xl font-bold text-white">99.9%</p>
              <p className="text-xs text-zinc-500 uppercase tracking-widest font-bold">Uptime</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-zinc-600 text-sm">
          <p>© 2026 Amkyaw AI Platform. All rights reserved.</p>
          <p className="mt-1">Version 1.2.0 (Stable)</p>
        </div>

      </div>
    </div>
  );
}
