"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bot, Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle, User, Sparkles, ShieldCheck, Zap } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (username && email && password) {
      localStorage.setItem("user", JSON.stringify({ 
        email, 
        username,
        is_premium: false 
      }));
      router.push("/chat");
    } else {
      setError("အချက်အလျားများ ပါဝင်ပါ။");
    }
    setIsLoading(false);
  };

  const features = [
    { icon: Sparkles, title: "Advanced AI Models", desc: "Access the latest GPT-4 and Claude models." },
    { icon: Zap, title: "Real-time Processing", desc: "Instant responses with zero latency." },
    { icon: ShieldCheck, title: "Secure & Private", desc: "Your data is encrypted and never shared." },
  ];

  return (
    <div className="flex min-h-screen bg-zinc-950 text-white overflow-hidden">
      {/* Left Side - Visuals (Desktop only) */}
      <div className="hidden lg:flex flex-1 relative bg-zinc-900 border-r border-zinc-800 flex-col justify-between p-12 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-500/10 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-amber-500/10 rounded-full blur-[120px] animate-pulse [animation-delay:2s]" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20">
              <span className="text-white font-bold text-2xl">A</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Amkyaw AI</h1>
          </div>

          <div className="space-y-12 max-w-md">
            <motion.h2
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-5xl font-bold leading-tight"
            >
              Join the <span className="text-orange-500">Revolution</span> of AI.
            </motion.h2>

            <div className="space-y-8">
              {features.map((f, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * (i + 1) }}
                  className="flex gap-4 group"
                >
                  <div className="w-12 h-12 bg-zinc-800 border border-zinc-700 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
                    <f.icon className="text-orange-500" size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-white group-hover:text-orange-500 transition-colors">{f.title}</h4>
                    <p className="text-sm text-zinc-500">{f.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        <div className="relative z-10 text-center">
          <p className="text-zinc-600 text-sm">© 2026 Amkyaw AI Platform</p>
        </div>
      </div>

      {/* Right Side - Register Form */}
      <div className="flex-1 flex items-center justify-center p-4 md:p-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20">
                <Bot className="w-5 h-5 text-white" />
              </div>
            </Link>
            <h1 className="text-3xl font-bold">အကောင့်ဖန်တီးရန်</h1>
            <p className="text-zinc-500 mt-2">Amkyaw AI နဲ့ စတင်ရန်</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-bold text-zinc-400">အမည်</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="yourname"
                  className="w-full pl-12 pr-4 py-4 bg-zinc-900 border border-zinc-800 rounded-2xl text-white placeholder:text-zinc-600 focus:outline-none focus:border-orange-500/50 transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-zinc-400">အီးမေးလ်</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-12 pr-4 py-4 bg-zinc-900 border border-zinc-800 rounded-2xl text-white placeholder:text-zinc-600 focus:outline-none focus:border-orange-500/50 transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-zinc-400">စကားဝှက်</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-12 py-4 bg-zinc-900 border border-zinc-800 rounded-2xl text-white placeholder:text-zinc-600 focus:outline-none focus:border-orange-500/50 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400"
              >
                <AlertCircle size={18} />
                <span className="text-sm">{error}</span>
              </motion.div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
              ) : (
                <>
                  အကောင့်ဖန်တီးရန် <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-zinc-500">
            အကောင့်ရှိပါပါ?{" "}
            <Link href="/login" className="text-orange-500 hover:underline font-bold">
              ဝင်ရန်
            </Link>
          </div>

          <div className="mt-8 text-center">
            <Link href="/" className="text-zinc-500 hover:text-white text-sm flex items-center justify-center gap-2">
              ← ပါဝင်ပတ်သက် ပါ
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
