import Link from "next/link";
import { Sparkles, Zap, Bot, Cpu, MessageSquare, Code, Globe, ArrowRight, PenTool, Brain, Terminal } from "lucide-react";

const features = [
  { icon: MessageSquare, label: "AI Chat", desc: "Smart conversation" },
  { icon: Code, label: "Code Assistant", desc: "Write & debug" },
  { icon: Globe, label: "Translate", desc: "Multi-language" },
  { icon: PenTool, label: "Text Writer", desc: "Create content" },
  { icon: Brain, label: "Analyze", desc: "Data insights" },
  { icon: Terminal, label: "Debug", desc: "Fix errors" },
];

const services = [
  { title: "Web Development", desc: "Full-stack apps", price: "From $500" },
  { title: "Mobile Apps", desc: "iOS & Android", price: "From $800" },
  { title: "AI Integration", desc: "Chatbot & automation", price: "From $300" },
  { title: "Data Analysis", desc: "Business intelligence", price: "From $400" },
];

export default function Home() {
  return (
    <main className="min-h-screen">
      <section className="relative flex flex-col items-center justify-center min-h-screen px-4 py-20">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-orange-500/10 rounded-full blur-[150px]" />
          <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[150px]" />
        </div>
        <div className="text-center space-y-8 max-w-5xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass">
            <Zap className="w-4 h-4 text-orange-500" />
            <span className="text-sm text-muted-foreground">Powered by Groq - Ultra Fast AI</span>
          </div>
          <h1 className="text-6xl md:text-8xl font-bold">
            <span className="bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">Amkyaw AI</span>
            <br />
            <span className="text-4xl md:text-5xl">Power Platform</span>
          </h1>
          <p className="text-xl text-muted-foreground">
            Professional AI solutions for everyone. Chat, write, translate, debug code - powered by Groq.
          </p>
          <div className="flex gap-4 justify-center pt-4">
            <Link href="/chat" className="inline-flex items-center gap-3 px-10 py-5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold hover:shadow-xl hover:shadow-orange-500/30 transition-all">
              <Bot className="w-6 h-6" /> Start Chatting
            </Link>
            <Link href="#features" className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl glass font-semibold hover:bg-white/10">
              Explore <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      <section id="features" className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">AI <span className="text-orange-500">Capabilities</span></h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {features.map((f) => (
              <div key={f.label} className="glass p-6 rounded-2xl text-center hover:scale-105 transition-all">
                <f.icon className="w-8 h-8 mx-auto mb-3 text-orange-500" />
                <h3 className="font-semibold">{f.label}</h3>
                <p className="text-xs text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="services" className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">Professional <span className="text-orange-500">Services</span></h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((s) => (
              <div key={s.title} className="glass p-8 rounded-2xl hover:border-orange-500/50 transition-all">
                <Cpu className="w-8 h-8 text-orange-500 mb-4" />
                <h3 className="text-xl font-bold mb-2">{s.title}</h3>
                <p className="text-muted-foreground mb-4">{s.desc}</p>
                <p className="text-orange-500 font-bold">{s.price}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="about" className="py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">About <span className="text-orange-500">Developer</span></h2>
          <div className="glass p-10 rounded-3xl text-center">
            <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 mx-auto mb-6 flex items-center justify-center">
              <span className="text-5xl">👨‍💻</span>
            </div>
            <h3 className="text-3xl font-bold mb-2">Aung Myo Kyaw</h3>
            <p className="text-muted-foreground mb-8">Full-Stack Developer & AI Specialist</p>
            <div className="space-y-3 text-left max-w-md mx-auto mb-8">
              <p className="p-3 rounded-xl bg-white/5">📧 amk.kyaw92@gmail.com</p>
              <p className="p-3 rounded-xl bg-white/5">📱 09677740154</p>
              <p className="p-3 rounded-xl bg-white/5">🎵 TikTok: @amkyaw.dev</p>
            </div>
            <div className="flex justify-center gap-4">
              <a href="mailto:amk.kyaw92@gmail.com" className="px-8 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold">Contact Me</a>
              <Link href="/chat" className="px-8 py-3 rounded-xl glass font-bold hover:bg-white/10">Try AI</Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="py-12 px-4 border-t border-border/50">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center"><Bot className="w-5 h-5 text-white" /></div>
            <span className="font-bold">Amkyaw AI</span>
          </div>
          <p className="text-muted-foreground">© 2024 Amkyaw AI. Powered by Groq API.</p>
          <div className="flex gap-6">
            <Link href="/chat" className="hover:text-orange-500">Chat</Link>
            <Link href="/docs" className="hover:text-orange-500">Docs</Link>
            <Link href="/settings" className="hover:text-orange-500">Settings</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}