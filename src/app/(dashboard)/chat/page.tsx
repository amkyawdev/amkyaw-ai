"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Send, Bot, User, Trash2, Plus, MessageSquare, 
  Settings, Copy, Check, Menu, X, Share2, RefreshCw, Home, Sparkles, Upload, Hash, Users, LogOut, UserCircle, Code, Cpu, Phone, Languages, Image, Globe
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useChatStore, Message } from "@/stores/chatStore";
import MarkdownMessage from "@/components/chat/MarkdownMessage";
import Link from "next/link";
import { detectIntent, getThinkingText, routeAI } from "@/lib/groq";
import { AGENTS, Agent, AgentType } from "@/lib/ai-providers";

const GROQ_MODEL = { name: "llama-3.3-70b-versatile", displayName: "Llama 3.3 70B" };

// Map icon names to components
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  sparkles: Sparkles,
  code: Code,
  cpu: Cpu,
  phone: Phone,
  languages: Languages,
  image: Image,
  globe: Globe,
};

// Agent Selector Component - Small icon buttons in chat area
const AgentSelector = ({ selectedAgent, onSelectAgent }: { selectedAgent: AgentType; onSelectAgent: (agent: AgentType) => void }) => {
  const selectedAgentData = AGENTS.find(a => a.id === selectedAgent);
  
  return (
    <div className="relative">
      {/* Small icon buttons row */}
      <div className="flex items-center gap-1">
        {AGENTS.map((agent) => {
          const IconComponent = iconMap[agent.icon] || Sparkles;
          return (
            <button
              key={agent.id}
              onClick={() => onSelectAgent(agent.id)}
              title={agent.name}
              className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center transition-all",
                selectedAgent === agent.id
                  ? "bg-orange-500/20 border border-orange-500/50"
                  : "bg-zinc-900 border border-zinc-800 hover:bg-zinc-800"
              )}
            >
              <IconComponent className={cn("w-4 h-4", selectedAgent === agent.id ? "text-orange-400" : "text-zinc-400")} />
            </button>
          );
        })}
      </div>
      
      {/* Selected agent name with animation */}
      <motion.div 
        key={selectedAgent}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap"
      >
        <span className="text-xs font-medium text-orange-400">
          {selectedAgentData?.name}
        </span>
      </motion.div>
    </div>
  );
};

// Component to separate text and code blocks
const ContentWithSeparateCode = ({ content }: { content: string }) => {
  // Split content by code blocks
  const parts = content.split(/(```[\s\S]*?```)/g);
  
  return (
    <div className="space-y-3">
      {parts.map((part, index) => {
        if (part.startsWith('```')) {
          // Code block
          const codeMatch = part.match(/```(\w*)\n?([\s\S]*?)```/);
          const language = codeMatch?.[1] || 'text';
          const code = codeMatch?.[2] || part.slice(3, -3);
          
          return (
            <div key={index} className="rounded-lg overflow-hidden bg-[#1a1a1a] border border-gray-700">
              <div className="px-3 py-1 bg-gray-800 text-xs text-gray-400 flex items-center justify-between">
                <span>{language || 'code'}</span>
                <button 
                  onClick={() => navigator.clipboard.writeText(code)}
                  className="hover:text-white"
                >
                  <Copy className="w-3 h-3" />
                </button>
              </div>
              <pre className="p-3 text-sm text-gray-200 overflow-x-auto font-mono">
                <code>{code}</code>
              </pre>
            </div>
          );
        } else if (part.trim()) {
          // Regular text - render as markdown
          return (
            <div key={index} className="text-gray-200">
              <MarkdownMessage content={part} />
            </div>
          );
        }
        return null;
      })}
    </div>
  );
};

// Avatar component for user - show avatar picture or project icon
const UserAvatar = ({ user }: { user: { name?: string; email?: string; avatar?: string } | null }) => {
  if (!user) return null;
  
  // If user has avatar URL, show the picture
  if (user.avatar) {
    return (
      <img 
        src={user.avatar} 
        alt={user.name || "User"} 
        className="w-8 h-8 rounded-full object-cover border-2 border-orange-500/50"
      />
    );
  }
  
  // Default show project icon
  return (
    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white border-2 border-orange-500/50">
      <span className="text-sm font-bold">AK</span>
    </div>
  );
};

// Floating particles background
const FloatingParticles = () => {
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    size: Math.random() * 6 + 2,
    x: Math.random() * 100,
    delay: Math.random() * 5,
    duration: Math.random() * 10 + 15,
    opacity: Math.random() * 0.5 + 0.1,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full bg-gradient-to-r from-orange-400/30 to-amber-400/30"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.x}%`,
            bottom: '-20px',
            opacity: p.opacity,
            animation: `floatUp ${p.duration}s linear ${p.delay}s infinite`,
          }}
        />
      ))}
      <style jsx>{`
        @keyframes floatUp {
          0% {
            transform: translateY(0) scale(1);
            opacity: 0;
          }
          10% {
            opacity: 0.6;
          }
          90% {
            opacity: 0.6;
          }
          100% {
            transform: translateY(-100vh) scale(0.5);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

// Simple Thinking Loader
const ThinkingLoader = ({ text }: { text: string }) => (
  <div className="flex items-center gap-3 px-4 py-3">
    <div className="relative w-6 h-6">
      <div className="absolute inset-0 border-2 border-orange-500/30 rounded-full" />
      <div className="absolute inset-0 border-2 border-transparent border-t-orange-500 rounded-full animate-spin" />
    </div>
    <div className="flex gap-1">
      <span className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
      <span className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
      <span className="w-2 h-2 bg-orange-300 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
    </div>
    <span className="text-sm text-muted-foreground font-medium">{text}</span>
  </div>
);

const WelcomeScreen = ({ onSelect }: { onSelect: (text: string) => void }) => (
  <div className="flex items-center justify-center h-full p-4">
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-xl text-center">
      <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", duration: 0.8 }}
        className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-500 flex items-center justify-center shadow-2xl">
        <Bot className="w-10 h-10 text-white" />
      </motion.div>
      <h2 className="text-3xl font-bold mb-3 bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">
        Hi, I am Amkyaw AI
      </h2>
      <p className="text-muted-foreground mb-6">How can I help you today?</p>
      <div className="grid grid-cols-2 gap-3">
        {[
          { icon: "💬", text: "Chat", action: "Hello!" },
          { icon: "💻", text: "Write Code", action: "Write a Python function" },
          { icon: "🌐", text: "Translate", action: "Translate to English: Hello" },
          { icon: "📝", text: "Summarize", action: "Summarize this:" },
        ].map((item) => (
          <button key={item.text} onClick={() => onSelect(item.action)}
            className="p-4 rounded-xl glass text-center hover:bg-white/10 transition-all">
            <span className="text-2xl mb-2 block">{item.icon}</span>
            <p className="text-sm font-medium">{item.text}</p>
          </button>
        ))}
      </div>
    </motion.div>
  </div>
);

const ChatMessage = ({ message, onCopy, isCopied }: { message: Message; onCopy: (c: string, id: string) => void; isCopied: boolean }) => {
  // Check if message contains image
  const isImage = message.content.startsWith('[IMAGE:') && message.content.endsWith(']');
  const imageUrl = isImage ? message.content.slice(8, -1) : null;
  
  // Detect if content is primarily code (not just mixed with text)
  const isCodeContent = () => {
    if (message.role === 'user') return false;
    const content = message.content;
    
    // Must have code blocks to be considered code
    const hasCodeBlock = content.includes('```');
    if (!hasCodeBlock) return false;
    
    // Count code block lines vs normal text lines
    const codeBlockMatch = content.match(/```[\s\S]*?```/g);
    if (!codeBlockMatch) return false;
    
    // Calculate total code block characters
    const codeBlockChars = codeBlockMatch.join('').length;
    const totalChars = content.length;
    
    // If code blocks make up more than 40% of content, apply dark background
    // Or if there's significant code outside blocks
    const hasCodePatterns = /^(import |export |function |const |let |var |class |def |public |private |protected |interface |enum |return |if |for |while |switch |case )/m.test(content);
    
    return (codeBlockChars / totalChars > 0.4) || (hasCodePatterns && codeBlockMatch.length >= 2);
  };
  
  const isCode = isCodeContent();
  
  return (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
    className={cn("flex gap-3 max-w-4xl mx-auto group", message.role === "user" ? "flex-row-reverse" : "flex-row")}>
    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
      className={cn("w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0",
        message.role === "user" ? "bg-gradient-to-br from-orange-500 to-amber-500" : "bg-gradient-to-br from-purple-500 to-indigo-500")}>
      {message.role === "user" ? <User className="w-5 h-5 text-white" /> : <Bot className="w-5 h-5 text-white" />}
    </motion.div>
    <div className={cn("rounded-2xl px-5 py-4 max-w-[85%]",
      isCode 
        ? "bg-[#1e1e1e] border border-gray-700"  // Code background
        : message.role === "user" 
          ? "bg-gradient-to-r from-orange-500/15 to-amber-500/15 border border-orange-500/20" 
          : "glass"
    )}>
      {message.isLoading ? <ThinkingLoader text="Thinking..." /> : (
        <>
          {/* Image rendering */}
          {isImage && imageUrl && (
            <div className="mb-2">
              <img 
                src={imageUrl} 
                alt="Generated" 
                className="max-w-full rounded-lg border border-orange-500/20"
                style={{ maxHeight: '400px', objectFit: 'contain' }}
              />
            </div>
          )}
          {/* Text content - separate from code blocks */}
          {!isImage && (
            <div className="text-sm">
              {isCode ? (
                // Separate text and code
                <ContentWithSeparateCode content={message.content} />
              ) : (
                <MarkdownMessage content={message.content} />
              )}
            </div>
          )}
          {/* Copy button */}
          <div className="flex items-center gap-1 mt-3 pt-3 border-t border-white/10 opacity-0 group-hover:opacity-100">
            <button onClick={() => onCopy(message.content, message.id)} className="p-2 rounded-lg hover:bg-white/10">
              {isCopied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </>
      )}
    </div>
  </motion.div>
  );
};

const ChatInput = ({ input, setInput, onSubmit, isLoading, thinkingText, showThinking, selectedAgent, onSelectAgent }: { 
  input: string; 
  setInput: (v: string) => void; 
  onSubmit: (e: React.FormEvent) => void; 
  isLoading: boolean; 
  thinkingText?: string; 
  showThinking?: boolean;
  selectedAgent?: AgentType;
  onSelectAgent?: (agent: AgentType) => void;
}) => {
  const [showAgentDropdown, setShowAgentDropdown] = useState(false);
  return (
    <div className="p-4 border-t border-border/50 bg-background/95 backdrop-blur-xl">
      <div className="max-w-4xl mx-auto">
        {/* Thinking indicator in input area */}
        {showThinking && isLoading && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }} 
            animate={{ opacity: 1, height: "auto" }} 
            exit={{ opacity: 0, height: 0 }}
            className="mb-3"
          >
            <div className="flex items-center gap-2 px-3 py-2 bg-orange-500/10 rounded-lg border border-orange-500/20">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-1.5 h-1.5 bg-orange-300 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
              <span className="text-xs text-orange-400 font-medium">{thinkingText || "Thinking..."}</span>
            </div>
          </motion.div>
        )}
        
        {/* Agent Selector - Above input box */}
        {selectedAgent && onSelectAgent && (
          <AnimatePresence>
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative mb-3"
            >
              {/* Main button showing current agent */}
              <button
                type="button"
                onClick={() => setShowAgentDropdown(!showAgentDropdown)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg glass border border-border/50 hover:border-orange-500/30 transition-all"
              >
                <Sparkles className="w-3.5 h-3.5 text-orange-400" />
                <span className="text-xs font-medium text-zinc-300">AI Agent</span>
                <motion.div
                  animate={{ rotate: showAgentDropdown ? 180 : 0 }}
                  className="w-3 h-3 text-zinc-500"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </motion.div>
              </button>
              
              {/* Animated dropdown */}
              {showAgentDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute bottom-full left-0 mb-2 py-2 rounded-xl glass border border-border/50 shadow-xl overflow-hidden z-50"
                >
                  {AGENTS.map((agent, index) => {
                    const IconComponent = iconMap[agent.icon] || Sparkles;
                    return (
                      <motion.button
                        key={agent.id}
                        type="button"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => {
                          onSelectAgent(agent.id);
                          setShowAgentDropdown(false);
                        }}
                        className={cn(
                          "w-full flex items-center gap-3 px-4 py-2.5 text-left transition-all",
                          selectedAgent === agent.id
                            ? "bg-orange-500/20 text-orange-400"
                            : "hover:bg-white/5 text-zinc-300"
                        )}
                      >
                        <IconComponent className={cn("w-4 h-4", selectedAgent === agent.id ? "text-orange-400" : "text-zinc-500")} />
                        <span className="text-sm">{agent.name}</span>
                        {selectedAgent === agent.id && (
                          <motion.div 
                            initial={{ scale: 0 }} 
                            animate={{ scale: 1 }}
                            className="ml-auto w-1.5 h-1.5 bg-orange-500 rounded-full" 
                          />
                        )}
                      </motion.button>
                    );
                  })}
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        )}
        
        <form onSubmit={onSubmit} className="max-w-4xl mx-auto flex gap-3 items-end">
          <div className="flex-1">
            <textarea value={input} onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); onSubmit(e); } }}
              placeholder="Message Amkyaw AI..."
              className="w-full px-5 py-4 rounded-2xl glass border border-border/50 focus:border-orange-500/50 resize-none min-h-[56px] max-h-[200px] text-sm bg-black/30"
              disabled={isLoading} rows={1} />
          </div>
          <motion.button type="submit" disabled={!input.trim() || isLoading}
            className={cn("p-4 rounded-2xl font-medium transition-all flex items-center justify-center",
              input.trim() && !isLoading ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white" : "bg-muted/50 text-muted-foreground cursor-not-allowed")}
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            {isLoading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </motion.button>
        </form>
      </div>
    </div>
  );
};

export default function ChatPage() {
  const [input, setInput] = useState("");
  const [showSidebar, setShowSidebar] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [thinkingText, setThinkingText] = useState("Thinking...");
  const [user, setUser] = useState<{ name?: string; email?: string; avatar?: string } | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<AgentType>('general');

  // Load user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        // Support both avatar and profile_picture field names
        setUser({
          name: parsed.username,
          email: parsed.email,
          avatar: parsed.avatar || parsed.profile_picture
        });
      } catch (e) {
        console.error("Failed to parse user:", e);
      }
    }
  }, []);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { chats, currentChat, isLoading, error, createChat, setCurrentChat, addMessage, updateMessage, deleteChat, clearError, setLoading } = useChatStore();

  const scrollToBottom = useCallback(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), []);
  useEffect(() => { scrollToBottom(); }, [currentChat?.messages, scrollToBottom]);

  const handleCopy = async (content: string, id: string) => {
    await navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    // Check for login
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      // Guest mode - limit to 3 messages
      const guestChats = parseInt(sessionStorage.getItem("guest_chats") || "0");
      if (guestChats >= 3) {
        alert("Guest limit reached. Please login to continue.");
        window.location.href = "/login";
        return;
      }
      sessionStorage.setItem("guest_chats", String(guestChats + 1));
    }

    // Detect intent and route to correct API
    const intent = detectIntent(input);
    const aiProvider = routeAI(intent);
    const thinking = getThinkingText(intent);
    setThinkingText(thinking);

    let chatId = currentChat?.id;
    if (!chatId) { const newChat = createChat("llama-3.3-70b"); chatId = newChat.id; }

    const userMessage: Message = { id: `msg_${Date.now()}`, role: "user", content: input.trim(), timestamp: new Date() };
    const assistantMessage: Message = { id: `msg_${Date.now()}_ai`, role: "assistant", content: "", timestamp: new Date(), isLoading: true };

    addMessage(chatId, userMessage);
    addMessage(chatId, assistantMessage);
    const msgInput = input;
    setInput("");
    setLoading(true);

    try {
      let data;
      
      if (aiProvider === 'huggingface') {
        // Use HuggingFace for image generation
        const imageResponse = await fetch("/api/image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: msgInput })
        });
        
        if (!imageResponse.ok) {
          const errorData = await imageResponse.json();
          throw new Error(errorData.error || "Image generation failed");
        }
        
        const imageData = await imageResponse.json();
        // For image responses, we show the image URL in a special format
        updateMessage(chatId, assistantMessage.id, { 
          content: `[IMAGE:${imageData.imageUrl}]`, 
          isLoading: false 
        });
      } else {
        // Use Groq for text responses with agent context
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            prompt: msgInput, 
            model: "llama-3.3-70b",
            agent: selectedAgent
          })
        });
        if (!response.ok) throw new Error((await response.json()).error || "Failed");
        data = await response.json();
        updateMessage(chatId, assistantMessage.id, { content: data.response, isLoading: false });
        
        // Track which provider was used
        if (data.provider) {
          console.log('Response from provider:', data.provider);
        }
      }
    } catch (err) {
      updateMessage(chatId, assistantMessage.id, { content: err instanceof Error ? err.message : "Error", isLoading: false });
    } finally { setLoading(false); }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <AnimatePresence>
        {showSidebar && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setShowSidebar(false)} />
            <motion.aside initial={{ x: -300 }} animate={{ x: 0 }} exit={{ x: -300 }}
              className="fixed left-0 top-0 bottom-0 w-80 border-r border-border/50 flex flex-col bg-background/95 z-50 md:relative md:translate-x-0 md:w-72">
              <div className="p-4 border-b border-border/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="font-bold">Amkyaw AI</h2>
                    <p className="text-xs text-muted-foreground">Llama 3.3 70B</p>
                  </div>
                </div>
                <button onClick={() => setShowSidebar(false)} className="p-2 rounded-lg hover:bg-white/10 md:hidden">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-4">
                <button onClick={() => { createChat("llama-3.3-70b"); setShowSidebar(false); }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold">
                  <Plus className="w-5 h-5" /> New Chat
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {chats.length === 0 ? (
                  <div className="text-center text-muted-foreground py-10">
                    <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">No conversations yet</p>
                  </div>
                ) : (
                  chats.map(chat => (
                    <button key={chat.id} onClick={() => { setCurrentChat(chat.id); setShowSidebar(false); }}
                      className={cn("w-full text-left p-3 rounded-xl transition-all flex items-center gap-3",
                        currentChat?.id === chat.id ? "bg-orange-500/10 border border-orange-500/30" : "hover:bg-white/5")}>
                      <MessageSquare className="w-5 h-5 text-orange-500/70" />
                      <span className="truncate text-sm flex-1">{chat.title}</span>
                      <button onClick={(e) => { e.stopPropagation(); deleteChat(chat.id); }} className="p-1 rounded hover:bg-destructive/20 text-destructive">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </button>
                  ))
                )}
              </div>
              <div className="p-4 border-t border-border/50 space-y-2">
                <Link href="/" className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5">
                  <Home className="w-5 h-5" /><span className="text-sm">Home</span>
                </Link>
                <Link href="/public-chat" className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5">
                  <Hash className="w-5 h-5 text-orange-500" /><span className="text-sm">Public Chat</span>
                </Link>
                <Link href="/about" className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5">
                  <Users className="w-5 h-5" /><span className="text-sm">About</span>
                </Link>
                <Link href="/docs" className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5">
                  <MessageSquare className="w-5 h-5" /><span className="text-sm">Docs</span>
                </Link>
                <Link href="/profile" className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5">
                  <User className="w-5 h-5" /><span className="text-sm">Profile</span>
                </Link>
                <Link href="/settings" className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5">
                  <Settings className="w-5 h-5" /><span className="text-sm">Settings</span>
                </Link>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <main className="flex-1 flex flex-col overflow-hidden bg-zinc-950 relative">
        {/* Floating Particles Background */}
        <FloatingParticles />
        
        {/* Header */}
        <header className="h-16 border-b border-zinc-800 flex items-center justify-between px-8 bg-zinc-950/80 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <h2 className="font-semibold text-zinc-200">AI Assistant</h2>
          </div>
          <div className="flex items-center gap-4">
            {/* Model Badge */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800">
              <Sparkles className="w-4 h-4 text-orange-500" />
              <span className="text-sm font-medium text-zinc-300">{GROQ_MODEL.displayName}</span>
            </div>
            {/* User Avatar - only show when logged in */}
            {user && (
              <div className="pl-4 border-l border-zinc-800">
                <UserAvatar user={user} />
              </div>
            )}
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-8 space-y-6 scrollbar-thin scrollbar-thumb-zinc-800">
          {!currentChat || currentChat.messages.length === 0 ? (
            <WelcomeScreen onSelect={(text) => setInput(text)} />
          ) : (
            <AnimatePresence>
              {currentChat.messages.map((message) => (
                <ChatMessage key={message.id} message={message} onCopy={handleCopy} isCopied={copiedId === message.id} />
              ))}
            </AnimatePresence>
          )}
          
          {error && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto p-4 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20">
              <p>{error}</p>
              <button onClick={clearError} className="mt-2 text-sm underline">Dismiss</button>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-6 bg-zinc-950 border-t border-zinc-800">
          <ChatInput input={input} setInput={setInput} onSubmit={handleSubmit} isLoading={isLoading} thinkingText={thinkingText} showThinking={true} selectedAgent={selectedAgent} onSelectAgent={setSelectedAgent} />
        </div>
      </main>
    </div>
  );
}
