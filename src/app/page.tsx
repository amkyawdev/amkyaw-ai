import Link from 'next/link';
import { Sparkles, Shield, Zap, MessageSquare } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center min-h-screen px-4 py-20 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background to-background" />
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[128px]" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-[128px]" />
        </div>

        <div className="text-center space-y-8 max-w-4xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass glass-hover">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm text-muted-foreground">Powered by Gemini 1.5 Flash</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
            Amkyaw AI <span className="text-primary">Power</span> Platform
          </h1>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Experience the future of AI-powered conversations. 
            Secure, fast, and intelligent - all in one place.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link 
              href="/dashboard"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all hover:animate-glow"
            >
              <Zap className="w-5 h-5" />
              Get Started
            </Link>
            <Link 
              href="#features"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full glass glass-hover font-semibold"
            >
              Learn More
            </Link>
          </div>
        </div>

        {/* Features Preview */}
        <div id="features" className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-32 max-w-5xl">
          <div className="glass p-8 rounded-2xl text-center hover:scale-105 transition-transform">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Smart Chat</h3>
            <p className="text-muted-foreground">Powered by Gemini 1.5 Flash for intelligent responses</p>
          </div>
          
          <div className="glass p-8 rounded-2xl text-center hover:scale-105 transition-transform">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Secure Auth</h3>
            <p className="text-muted-foreground">Neon Auth provides enterprise-grade security</p>
          </div>
          
          <div className="glass p-8 rounded-2xl text-center hover:scale-105 transition-transform">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
              <Zap className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Fast Response</h3>
            <p className="text-muted-foreground">Lightning-fast responses with real-time processing</p>
          </div>
        </div>
      </section>
    </main>
  );
}