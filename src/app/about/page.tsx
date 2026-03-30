"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { 
  Bot, Sparkles, Github, Mail, Heart, QrCode, Copy, Check
} from "lucide-react";
import { useState } from "react";

const techStack = [
  { name: "Next.js 14", desc: "App Router" },
  { name: "TypeScript", desc: "Type-safe" },
  { name: "Tailwind CSS", desc: "Modern styling" },
  { name: "Groq API", desc: "Llama 3.3 70B" },
  { name: "HuggingFace", desc: "FLUX.1" },
  { name: "Neon DB", desc: "PostgreSQL" },
];

export default function AboutPage() {
  const [copied, setCopied] = useState("");

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(""), 2000);
  };

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
            <Link href="/chat" className="text-sm hover:text-orange-500">Chat</Link>
            <Link href="/public-chat" className="text-sm hover:text-orange-500">Public Chat</Link>
          </div>
        </div>
      </nav>

      <section className="pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-500 flex items-center justify-center shadow-2xl shadow-orange-500/30">
              <Bot className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">
              About Amkyaw AI
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              A powerful AI platform built for Myanmar users
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="p-8 rounded-2xl glass">
            <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
            <p className="text-muted-foreground leading-relaxed">
              Amkyaw AI သည် မြန်မာအသိုင်းအဝိုင်းအတွက် အပြည်ပြည်ဆိုင်ရာ AI နည်းပါးများကို လွယ်ကူစွာ သုံးလို့ရအောင် ဖန်တီးထားပပါ။
              သင်္ချာ၊ ပရိုဂရမ်းမင်း၊ ဘာသာပြန်ခြင်း၊ ပုံဖန်တီးခြင်းများအတွက် တစ်နေရာတည်းမှာ ရရှိပါတယ်။
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-16 px-4 bg-gradient-to-b from-transparent to-orange-500/5">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Technology Stack</h2>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {techStack.map((tech, i) => (
              <motion.div key={tech.name} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="p-4 rounded-xl glass text-center">
                <div className="font-semibold">{tech.name}</div>
                <div className="text-sm text-muted-foreground">{tech.desc}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Donation Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} 
            className="p-8 rounded-2xl bg-gradient-to-r from-orange-500/20 to-amber-500/20 border border-orange-500/30">
            <h2 className="text-3xl font-bold mb-2 text-center">💛 Support Our Work</h2>
            <p className="text-muted-foreground text-center mb-8">
              If you find Amkyaw AI helpful, please consider supporting us!
            </p>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Kpay */}
              <div className="p-6 rounded-xl glass">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center">
                    <span className="text-2xl">🇲🇲</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Kpay</h3>
                    <p className="text-sm text-muted-foreground">KB Pay</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                    <span className="text-sm text-muted-foreground">Name</span>
                    <span className="font-medium">U Aung Myo Kyaw</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                    <span className="text-sm text-muted-foreground">Phone</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono">09677740154</span>
                      <button onClick={() => copyToClipboard("09677740154", "kpay")} className="p-1 hover:bg-white/10 rounded">
                        {copied === "kpay" ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Wave Money */}
              <div className="p-6 rounded-xl glass">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-green-500 flex items-center justify-center">
                    <span className="text-2xl">💚</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Wave Money</h3>
                    <p className="text-sm text-muted-foreground">Wave Pay</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                    <span className="text-sm text-muted-foreground">Name</span>
                    <span className="font-medium">U Aung Myo Kyaw</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                    <span className="text-sm text-muted-foreground">Phone</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono">09677740154</span>
                      <button onClick={() => copyToClipboard("09677740154", "wave")} className="p-1 hover:bg-white/10 rounded">
                        {copied === "wave" ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-center text-muted-foreground mt-6 text-sm">
              Thank you for your support! 🙏
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} 
            className="p-8 rounded-2xl glass">
            <h2 className="text-2xl font-bold mb-4">Get In Touch</h2>
            <p className="text-muted-foreground mb-6">Questions? Suggestions? Want to collaborate?</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a href="mailto:amk.kyaw92@gmail.com" className="px-6 py-3 rounded-xl bg-orange-500 text-white font-medium hover:bg-orange-600 transition-colors flex items-center gap-2">
                <Mail className="w-5 h-5" /> Contact Us
              </a>
              <a href="https://github.com/amkyawdev/amkyaw-ai" target="_blank" className="px-6 py-3 rounded-xl glass font-medium hover:bg-white/10 transition-colors flex items-center gap-2">
                <Github className="w-5 h-5" /> GitHub
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      <footer className="py-8 px-4 border-t border-border/50">
        <div className="max-w-7xl mx-auto text-center text-sm text-muted-foreground">
          <p>© 2024 Amkyaw AI. Made with <Heart className="w-4 h-4 inline text-red-500" /> in Myanmar.</p>
        </div>
      </footer>
    </div>
  );
}
