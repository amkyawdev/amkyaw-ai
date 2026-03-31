"use client";

import { Bot, Code, Globe, Zap, Users, MessageSquare, Star, ChevronRight } from "lucide-react";
import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="flex flex-col h-full bg-zinc-950 text-zinc-100 p-4 md:p-8 overflow-y-auto">
      <div className="max-w-3xl mx-auto w-full space-y-12">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-500 text-sm font-medium">
            <Star size={14} /> About Platform
          </div>
          <h2 className="text-4xl font-extrabold text-white">Amkyaw AI Power</h2>
          <p className="text-zinc-500 text-lg">Next-generation AI chat platform powered by advanced language models.</p>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-2 gap-4">
          {[
            { icon: MessageSquare, title: "AI Chat", desc: "Intelligent conversations with Llama & Gemini" },
            { icon: Globe, title: "Translation", desc: "Translate between English and Myanmar" },
            { icon: Zap, title: "Fast Response", desc: "Powered by Groq for instant answers" },
            { icon: Users, title: "Community", desc: "Join public group discussions" },
          ].map((feature, i) => (
            <div key={i} className="p-6 bg-zinc-900 border border-zinc-800 rounded-2xl space-y-3 hover:border-orange-500/30 transition-all">
              <feature.icon size={24} className="text-orange-500" />
              <h3 className="font-bold text-white">{feature.title}</h3>
              <p className="text-sm text-zinc-500">{feature.desc}</p>
            </div>
          ))}
        </div>

        {/* Tech Stack */}
        <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-2xl">
          <h3 className="font-bold text-white mb-4">Technology Stack</h3>
          <div className="flex flex-wrap gap-2">
            {["Next.js", "TypeScript", "Tailwind CSS", "Neon DB", "Groq", "Gemini"].map((tech) => (
              <span key={tech} className="px-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-zinc-400">{tech}</span>
            ))}
          </div>
        </div>

        {/* Contact */}
        <div className="p-6 bg-gradient-to-br from-orange-500/10 to-amber-500/10 border border-orange-500/20 rounded-2xl text-center space-y-4">
          <h3 className="font-bold text-white text-xl">Need Help?</h3>
          <p className="text-zinc-400">Contact us at amk.kyaw92@gmail.com</p>
          <Link href="/docs" className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition-all">
            View Documentation <ChevronRight size={18} />
          </Link>
        </div>

      </div>
    </div>
  );
}
