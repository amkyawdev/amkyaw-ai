import Link from "next/link";
import { Sparkles, Zap, Bot, Cpu, MessageSquare, Code, Globe, ArrowRight } from "lucide-react";

const features = [
  { icon: MessageSquare, label: "AI Chat" },
  { icon: Code, label: "Code" },
  { icon: Globe, label: "Translate" },
];

export default function Home() {
  return (
    <main className="min-h-screen">
      <section className="flex flex-col items-center justify-center min-h-screen px-4 py-20">
        <div className="text-center space-y-6 max-w-4xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass">
            <Zap className="w-4 h-4 text-orange-500" />
            <span className="text-sm text-muted-foreground">Powered by Groq</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold">
            <span className="bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">Amkyaw AI</span>
          </h1>
          <p className="text-xl text-muted-foreground">Professional AI Platform</p>
          <Link href="/chat" className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold">
            <Bot className="w-5 h-5" /> Start Chatting
          </Link>
        </div>
      </section>
      <section className="py-20 px-4">
        <h2 className="text-3xl font-bold text-center mb-12">AI Capabilities</h2>
        <div className="grid grid-cols-3 gap-4 max-w-4xl mx-auto">
          {features.map((f) => (
            <div key={f.label} className="glass p-6 rounded-2xl text-center">
              <f.icon className="w-8 h-8 mx-auto mb-3 text-orange-500" />
              <h3 className="font-semibold">{f.label}</h3>
            </div>
          ))}
        </div>
      </section>
      <section id="about" className="py-20 px-4">
        <h2 className="text-3xl font-bold text-center mb-12">About Developer</h2>
        <div className="glass p-8 rounded-3xl max-w-4xl mx-auto text-center">
          <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 mx-auto mb-6 flex items-center justify-center">
            <span className="text-4xl">👨‍💻</span>
          </div>
          <h3 className="text-2xl font-bold mb-2">Aung Myo Kyaw</h3>
          <p className="text-muted-foreground mb-4">Full-Stack Developer & AI Specialist</p>
          <div className="space-y-2 text-sm mb-6">
            <p>📧 amk.kyaw92@gmail.com</p>
            <p>📱 09677740154</p>
            <p>🎵 TikTok: @amkyaw.dev</p>
          </div>
          <a href="mailto:amk.kyaw92@gmail.com" className="px-6 py-3 rounded-lg bg-orange-500 text-white font-medium">Contact Me</a>
        </div>
      </section>
      <footer className="py-8 px-4 border-t border-border/50 text-center">
        <p className="text-sm text-muted-foreground">© 2024 Amkyaw AI. Powered by Groq API.</p>
        <div className="flex gap-4 justify-center mt-4">
          <Link href="/chat" className="text-sm hover:text-orange-500">Chat</Link>
          <Link href="/settings" className="text-sm hover:text-orange-500">Settings</Link>
        </div>
      </footer>
    </main>
  );
}
