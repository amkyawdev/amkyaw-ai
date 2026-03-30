'use client';

import { motion } from 'framer-motion';
import { BookOpen, Code, MessageSquare, Zap, Globe, Settings, ChevronRight } from 'lucide-react';

const docs = [
  {
    title: 'Getting Started',
    icon: Zap,
    items: ['Quick Start Guide', 'Installation', 'Basic Concepts']
  },
  {
    title: 'AI Chat',
    icon: MessageSquare,
    items: ['How to Chat', 'Model Selection', 'Conversation History']
  },
  {
    title: 'Code Assistant',
    icon: Code,
    items: ['Generate Code', 'Debug Help', 'Code Optimization']
  },
  {
    title: 'Language Tools',
    icon: Globe,
    items: ['Translation', 'Grammar Fix', 'Summarization']
  },
  {
    title: 'Settings',
    icon: Settings,
    items: ['Theme Customization', 'Preferences', 'API Configuration']
  },
];

export default function DocsPage() {
  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <div className="flex items-center gap-3 mb-2">
            <BookOpen className="w-8 h-8 text-orange-500" />
            <h1 className="text-3xl font-bold">Documentation</h1>
          </div>
          <p className="text-muted-foreground">Learn how to use Amkyaw AI Power Platform</p>
        </motion.div>

        <div className="space-y-4">
          {docs.map((doc, i) => (
            <motion.div key={doc.title} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
              className="glass rounded-2xl p-6 hover:border-orange-500/30 transition-all">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500/20 to-amber-500/20 flex items-center justify-center">
                  <doc.icon className="w-5 h-5 text-orange-500" />
                </div>
                <h2 className="text-xl font-semibold">{doc.title}</h2>
              </div>
              <ul className="space-y-2">
                {doc.items.map((item) => (
                  <li key={item} className="flex items-center gap-2 text-muted-foreground hover:text-white transition-colors">
                    <ChevronRight className="w-4 h-4 text-orange-500" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
