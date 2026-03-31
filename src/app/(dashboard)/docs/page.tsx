"use client";

import { Book, Code, Zap, MessageSquare, ImageIcon, CreditCard, Shield, ChevronRight } from "lucide-react";

export default function DocsPage() {
  const sections = [
    { icon: MessageSquare, title: "Getting Started", desc: "Learn how to use the AI chat feature", items: ["Basic chat commands", "Switching AI models"] },
    { icon: ImageIcon, title: "Image Generation", desc: "Create images with AI", items: ["Writing prompts", "Downloading images"] },
    { icon: CreditCard, title: "Subscription Plans", desc: "Upgrade to premium", items: ["Free tier limits", "Premium benefits"] },
    { icon: Shield, title: "Security", desc: "Keep your account safe", items: ["Password tips", "Privacy settings"] },
  ];

  return (
    <div className="flex flex-col h-full bg-zinc-950 text-zinc-100 p-4 md:p-8 overflow-y-auto">
      <div className="max-w-3xl mx-auto w-full space-y-8">
        
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-orange-500 text-sm font-bold uppercase tracking-widest">
            <Book size={14} /> Documentation
          </div>
          <h2 className="text-4xl font-extrabold text-white">How to Use</h2>
          <p className="text-zinc-500 text-lg">Learn how to get the most out of Amkyaw AI Platform.</p>
        </div>

        {/* Sections */}
        <div className="space-y-4">
          {sections.map((section, i) => (
            <div key={i} className="p-6 bg-zinc-900 border border-zinc-800 rounded-2xl">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-orange-500/10 rounded-xl">
                  <section.icon size={24} className="text-orange-500" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-white text-lg mb-1">{section.title}</h3>
                  <p className="text-zinc-500 text-sm mb-3">{section.desc}</p>
                  <ul className="space-y-2">
                    {section.items.map((item, j) => (
                      <li key={j} className="flex items-center gap-2 text-sm text-zinc-400">
                        <ChevronRight size={14} className="text-zinc-600" /> {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Tips */}
        <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-2xl">
          <h3 className="font-bold text-white mb-4">Quick Tips</h3>
          <div className="space-y-3 text-sm text-zinc-400">
            <p>• Use specific prompts for better results</p>
            <p>• Try different AI models for different tasks</p>
            <p>• Check your usage limits in the sidebar</p>
            <p>• Contact support for help: 09 6777 40154</p>
          </div>
        </div>

      </div>
    </div>
  );
}
