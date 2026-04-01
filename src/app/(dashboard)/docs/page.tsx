"use client";

import { BookOpen, Search, Zap, Code, Terminal, MessageSquare, Image as ImageIcon, Shield } from "lucide-react";
import { motion } from "framer-motion";

export default function DocsPage() {
  const guides = [
    { icon: Zap, title: "စတင်ရန်", desc: "Amkyaw AI ပလက်ဖောင်း အခြေခံများ သင်ပါ။" },
    { icon: MessageSquare, title: "AI ချိတ်ဆက် သတ်မှတ်ချက်", desc: "ပါဝင်ပတ်သက် ပါပါ. သတ်မှတ်ချက်များ နှင့် ဖွင့်ဆိုချက်များ" },
    { icon: ImageIcon, title: "ပုံဖန်တီး", desc: "အရည်အသွေးမြင့်ပုံများ ဖန်တီးပါ။" },
    { icon: Shield, title: "လုံခြုံမှု နှင့် ပါပါ. နည်း", desc: "သင့်ဒေတာနှင့် ပါပါ. များကို ကာကွယ်ပါ။" },
  ];

  return (
    <div className="flex flex-col h-full bg-zinc-950 text-zinc-100 p-4 md:p-8 overflow-y-auto">
      <div className="max-w-4xl mx-auto w-full space-y-12">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-500 text-sm font-medium">
            <BookOpen size={14} />
            <span>Documentation</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight">How can we help?</h2>
          <div className="relative max-w-xl mx-auto mt-8">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={20} />
            <input
              type="text"
              placeholder="Search documentation..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-4 pl-12 pr-6 text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all"
            />
          </div>
        </div>

        {/* Guides Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {guides.map((guide, i) => (
            <motion.button
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="p-8 bg-zinc-900 border border-zinc-800 rounded-3xl text-left hover:border-orange-500/50 transition-all group space-y-4"
            >
              <div className="w-12 h-12 bg-orange-500/10 rounded-xl flex items-center justify-center text-orange-500 group-hover:scale-110 transition-transform">
                <guide.icon size={24} />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-white group-hover:text-orange-500 transition-colors">{guide.title}</h3>
                <p className="text-zinc-500 text-sm leading-relaxed">{guide.desc}</p>
              </div>
            </motion.button>
          ))}
        </div>

        {/* Developer API Section */}
        <div className="p-8 bg-zinc-900 border border-zinc-800 rounded-3xl space-y-6">
          <div className="flex items-center gap-3 text-orange-500">
            <Terminal size={24} />
            <h3 className="text-2xl font-bold text-white">Developer API</h3>
          </div>
          <p className="text-zinc-500">Integrate Amkyaw AI into your own applications with our powerful API. Coming soon for enterprise users.</p>
          <div className="bg-zinc-950 p-6 rounded-2xl border border-zinc-800 font-mono text-sm text-orange-400">
            <code>GET /api/v1/chat?prompt=hello</code>
          </div>
        </div>

      </div>
    </div>
  );
}
