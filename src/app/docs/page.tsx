'use client';

import { motion } from 'framer-motion';
import { 
  BookOpen, Code, MessageSquare, Database, 
  Zap, Shield, Settings, Globe, Terminal,
  ChevronRight, Copy, Check
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

const docsSections = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    icon: BookOpen,
    description: 'Learn how to set up and use Amkyaw AI',
    articles: [
      { title: 'Introduction', href: '#introduction' },
      { title: 'Quick Start Guide', href: '#quick-start' },
      { title: 'Installation', href: '#installation' },
    ],
  },
  {
    id: 'api',
    title: 'API Reference',
    icon: Code,
    description: 'Complete API documentation',
    articles: [
      { title: 'Chat API', href: '#chat-api' },
      { title: 'Authentication', href: '#authentication' },
      { title: 'Error Handling', href: '#errors' },
    ],
  },
  {
    id: 'features',
    title: 'Features',
    icon: Zap,
    description: 'Explore AI capabilities',
    articles: [
      { title: 'AI Models', href: '#models' },
      { title: 'Streaming Responses', href: '#streaming' },
      { title: 'Code Highlighting', href: '#code' },
    ],
  },
  {
    id: 'integrations',
    title: 'Integrations',
    icon: Globe,
    description: 'Connect with other services',
    articles: [
      { title: 'Database Setup', href: '#database' },
      { title: 'Authentication', href: '#auth' },
    ],
  },
];

const codeExamples = [
  {
    title: 'Chat API Request',
    language: 'javascript',
    code: `const response = await fetch('/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    prompt: 'Hello, how are you?',
    model: 'flash8b'
  })
});

const data = await response.json();
console.log(data.response);`,
  },
  {
    title: 'Python Request',
    language: 'python',
    code: `import requests

response = requests.post(
    'https://your-app.vercel.app/api/chat',
    json={
        'prompt': 'Hello, how are you?',
        'model': 'flash8b'
    }
)

print(response.json()['response'])`,
  },
];

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState('getting-started');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopyCode = async (code: string, id: string) => {
    await navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-72 border-r border-border p-6 hidden lg:block sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="flex items-center gap-2 mb-6">
              <BookOpen className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold">Documentation</h2>
            </div>

            <nav className="space-y-4">
              {docsSections.map((section) => (
                <div key={section.id}>
                  <button
                    onClick={() => setActiveSection(section.id)}
                    className={cn(
                      'flex items-center gap-2 w-full text-left py-2 px-3 rounded-lg transition-colors',
                      activeSection === section.id 
                        ? 'bg-primary/20 text-primary' 
                        : 'hover:bg-white/10'
                    )}
                  >
                    <section.icon className="w-4 h-4" />
                    <span className="font-medium">{section.title}</span>
                  </button>
                </div>
              ))}
            </nav>
          </motion.div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 lg:p-8">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <h1 className="text-3xl font-bold mb-2">Amkyaw AI Documentation</h1>
              <p className="text-muted-foreground">
                Everything you need to build with Amkyaw AI Power Platform
              </p>
            </motion.div>

            {/* Getting Started Section */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-12"
              id="introduction"
            >
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-primary" />
                Getting Started
              </h2>
              <div className="glass rounded-2xl p-6 space-y-4">
                <h3 className="text-xl font-semibold" id="introduction">Introduction</h3>
                <p className="text-muted-foreground">
                  Welcome to Amkyaw AI Power Platform! This platform provides a powerful 
                  AI chat interface powered by Google's Gemini models, with support for 
                  multiple models, streaming responses, and conversation history.
                </p>
                <div className="flex gap-4 mt-4">
                  <Link href="/chat" className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors inline-flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Try Demo
                  </Link>
                  <Link href="/login" className="px-4 py-2 rounded-lg glass glass-hover inline-flex items-center gap-2">
                    Get Started
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </motion.section>

            {/* API Section */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-12"
            >
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Code className="w-6 h-6 text-primary" />
                API Reference
              </h2>
              <div className="space-y-6">
                <div className="glass rounded-2xl p-6" id="chat-api">
                  <h3 className="text-xl font-semibold mb-4">Chat Endpoint</h3>
                  <div className="flex items-center gap-4 mb-4">
                    <span className="px-3 py-1 rounded-lg bg-green-500/20 text-green-500 text-sm font-mono">POST</span>
                    <code className="text-muted-foreground">/api/chat</code>
                  </div>
                  
                  <h4 className="font-medium mb-2">Request Body</h4>
                  <div className="space-y-2 text-sm text-muted-foreground mb-4">
                    <p><code className="text-primary">prompt</code> (string) - Your message to the AI</p>
                    <p><code className="text-primary">model</code> (string) - Model to use: 'flash', 'pro', 'flash8b'</p>
                    <p><code className="text-primary">temperature</code> (number) - Creativity level (0-1)</p>
                  </div>

                  <h4 className="font-medium mb-2">Example</h4>
                  {codeExamples.map((example, index) => (
                    <div key={index} className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">{example.title}</span>
                        <button
                          onClick={() => handleCopyCode(example.code, `code-${index}`)}
                          className="p-1 rounded hover:bg-white/10"
                        >
                          {copiedCode === `code-${index}` ? (
                            <Check className="w-4 h-4 text-green-500" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                      <pre className="bg-black/50 p-4 rounded-xl text-sm overflow-x-auto">
                        <code>{example.code}</code>
                      </pre>
                    </div>
                  ))}
                </div>
              </div>
            </motion.section>

            {/* Features Section */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-12"
            >
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Zap className="w-6 h-6 text-primary" />
                Features
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="glass rounded-2xl p-6">
                  <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center mb-4">
                    <Terminal className="w-5 h-5 text-primary" />
                  </div>
                  <h4 className="font-semibold mb-2">Multiple AI Models</h4>
                  <p className="text-sm text-muted-foreground">
                    Choose from Gemini 1.5 Flash, Pro, or Flash-8B based on your needs
                  </p>
                </div>
                <div className="glass rounded-2xl p-6">
                  <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center mb-4">
                    <MessageSquare className="w-5 h-5 text-primary" />
                  </div>
                  <h4 className="font-semibold mb-2">Code Highlighting</h4>
                  <p className="text-sm text-muted-foreground">
                    Beautiful syntax highlighting for code blocks in AI responses
                  </p>
                </div>
                <div className="glass rounded-2xl p-6">
                  <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center mb-4">
                    <Database className="w-5 h-5 text-primary" />
                  </div>
                  <h4 className="font-semibold mb-2">Conversation History</h4>
                  <p className="text-sm text-muted-foreground">
                    Save and view past conversations stored in PostgreSQL
                  </p>
                </div>
                <div className="glass rounded-2xl p-6">
                  <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center mb-4">
                    <Shield className="w-5 h-5 text-primary" />
                  </div>
                  <h4 className="font-semibold mb-2">User Authentication</h4>
                  <p className="text-sm text-muted-foreground">
                    Secure login system with session management
                  </p>
                </div>
              </div>
            </motion.section>

            {/* Security Section */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mb-12"
            >
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Shield className="w-6 h-6 text-primary" />
                Security
              </h2>
              <div className="glass rounded-2xl p-6">
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-500 mt-0.5" />
                    <span>API keys stored securely in environment variables</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-500 mt-0.5" />
                    <span>Secure database connections with SSL encryption</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-500 mt-0.5" />
                    <span>User sessions stored securely with encryption</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-500 mt-0.5" />
                    <span>CORS protection for API endpoints</span>
                  </li>
                </ul>
              </div>
            </motion.section>

            {/* Footer */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-center text-muted-foreground text-sm py-8 border-t border-border"
            >
              <p>Need help? Contact us at support@amkyaw.dev</p>
              <p className="mt-2">© 2024 Amkyaw AI Power Platform. All rights reserved.</p>
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
}