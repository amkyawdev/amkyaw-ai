// ZAI API (Zhipu AI), Stability AI, Ollama, and Alibaba Cloud integration with fallback system
import { BURMESE_SYSTEM_PROMPT } from './groq';

const ZAI_ENDPOINT = 'https://api.z.ai/api/paas/v4/chat/completions';
const STABILITY_ENDPOINT = 'https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0';
const ALIBABA_ENDPOINT = 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions';

// Agent types for different use cases
export type AgentType = 'general' | 'coder' | 'ai_developer' | 'contact' | 'translate' | 'image' | 'web_builder';

// Web fetch tool for external website integration
export async function fetchWebsite(url: string): Promise<{ success: boolean; content?: string; error?: string }> {
  try {
    // Validate URL
    const parsedUrl = new URL(url);
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      return { success: false, error: 'Invalid URL protocol. Only HTTP and HTTPS are supported.' };
    }
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; AmkyawAI/1.0)',
      },
    });
    
    if (!response.ok) {
      return { success: false, error: `Failed to fetch: ${response.status}` };
    }
    
    const content = await response.text();
    // Return first 50000 characters to avoid token limits
    return { success: true, content: content.slice(0, 50000) };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Analyze website structure
export async function analyzeWebsite(url: string): Promise<{ success: boolean; data?: object; error?: string }> {
  try {
    const fetchResult = await fetchWebsite(url);
    if (!fetchResult.success || !fetchResult.content) {
      return { success: false, error: fetchResult.error || 'Failed to fetch website' };
    }
    
    const html = fetchResult.content;
    
    // Extract basic info
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const descriptionMatch = html.match(/<meta[^>]*name="description"[^>]*content="([^"]+)"/i);
    const keywordsMatch = html.match(/<meta[^>]*name="keywords"[^>]*content="([^"]+)"/i);
    
    // Count elements
    const scripts = (html.match(/<script/gi) || []).length;
    const styles = (html.match(/<link[^>]*rel="stylesheet"/gi) || []).length;
    const images = (html.match(/<img/gi) || []).length;
    const links = (html.match(/<a[^>]*href/gi) || []).length;
    
    return {
      success: true,
      data: {
        url,
        title: titleMatch?.[1] || 'No title',
        description: descriptionMatch?.[1] || '',
        keywords: keywordsMatch?.[1] || '',
        stats: { scripts, styles, images, links },
        hasLoginForm: html.includes('<form') && (html.toLowerCase().includes('password') || html.toLowerCase().includes('login')),
        isEcommerce: html.toLowerCase().includes('cart') || html.toLowerCase().includes('checkout') || html.toLowerCase().includes('price'),
      }
    };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export interface Agent {
  id: AgentType;
  name: string;
  icon: string;
  description: string;
  capabilities: ('chat' | 'code' | 'translate' | 'image' | 'reasoning' | 'web' | 'contact')[];
  systemPrompt: string;
  exemptPrompts?: string[];
}

// Define available agents
export const AGENTS: Agent[] = [
  {
    id: 'general',
    name: 'General',
    icon: 'sparkles',
    description: 'General conversation and help',
    capabilities: ['chat', 'reasoning'],
    systemPrompt: 'You are a helpful AI assistant. Respond in the same language as the user.',
    exemptPrompts: ['user-provided context', 'system instructions'],
  },
  {
    id: 'coder',
    name: 'Coder',
    icon: 'code',
    description: 'Write, debug, and explain code',
    capabilities: ['code', 'chat'],
    systemPrompt: 'You are an expert programmer. Write clean, well-documented code with explanations. Use markdown code blocks.',
    exemptPrompts: ['code snippets', 'user code', 'existing code'],
  },
  {
    id: 'ai_developer',
    name: 'AI Dev',
    icon: 'cpu',
    description: 'Build AI apps, APIs, and integrations',
    capabilities: ['code', 'chat', 'reasoning'],
    systemPrompt: 'You are an AI development expert. Help build AI applications, APIs, and integrations. Provide complete code examples.',
    exemptPrompts: ['requirements', 'specifications', 'user instructions'],
  },
  {
    id: 'contact',
    name: 'Contact',
    icon: 'phone',
    description: 'Handle inquiries and support',
    capabilities: ['chat', 'web'],
    systemPrompt: 'You are a customer support agent. Be friendly, professional, and helpful. Collect contact information when needed.',
    exemptPrompts: ['user information', 'provided details'],
  },
  {
    id: 'translate',
    name: 'Translate',
    icon: 'languages',
    description: 'Translate between languages',
    capabilities: ['translate', 'chat'],
    systemPrompt: 'You are a translator. Translate accurately while preserving the meaning and tone. Respond in the target language.',
    exemptPrompts: ['original text', 'user content'],
  },
  {
    id: 'image',
    name: 'Image',
    icon: 'image',
    description: 'Generate images from text',
    capabilities: ['image', 'chat'],
    systemPrompt: 'You are an image generation assistant. Create detailed prompts for image generation.',
    exemptPrompts: ['image descriptions', 'user prompts'],
  },
  {
    id: 'web_builder',
    name: 'Web',
    icon: 'globe',
    description: 'Analyze websites, build integrations, create plans',
    capabilities: ['web', 'code', 'chat'],
    systemPrompt: 'You are a web development expert. You can fetch and analyze websites, suggest improvements, create integration plans, write code for web applications, and help with website development.',
    exemptPrompts: ['user requirements', 'specifications', 'urls', 'code'],
  },
];

export interface AIProvider {
  name: string;
  type: 'groq' | 'zai' | 'ollama' | 'alibaba' | 'stability' | 'huggingface';
  capabilities: ('chat' | 'code' | 'translate' | 'image' | 'reasoning')[];
}

// Check if ZAI is configured
export function isZAIConfigured(): boolean {
  return !!process.env.ZAI_API_KEY;
}

// Check if Stability is configured
export function isStabilityConfigured(): boolean {
  return !!process.env.STABILITY_API_KEY;
}

// Check if Ollama is configured (local or hosted)
export function isOllamaConfigured(): boolean {
  return !!process.env.OLLAMA_API_KEY || !!process.env.OLLAMA_BASE_URL;
}

// Check if Alibaba is configured
export function isAlibabaConfigured(): boolean {
  return !!process.env.ALIBABA_API_KEY;
}

// Call ZAI API
export async function callZAI(
  messages: { role: string; content: string }[],
  model: string = 'glm-5'
): Promise<{ success: boolean; data?: unknown; error?: string }> {
  const apiKey = process.env.ZAI_API_KEY;
  
  if (!apiKey) {
    return { success: false, error: 'ZAI_API_KEY not configured' };
  }

  try {
    const response = await fetch(ZAI_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.7,
        max_tokens: 2048,
      }),
    });

    if (!response.ok) {
      return { success: false, error: `ZAI API error: ${response.status}` };
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Call Stability AI for image generation (optimized for speed)
export async function callStabilityImage(
  prompt: string,
  negativePrompt: string = 'blurry, low quality, distorted, deformed, bad anatomy'
): Promise<{ success: boolean; imageUrl?: string; error?: string }> {
  const apiKey = process.env.STABILITY_API_KEY;
  
  if (!apiKey) {
    return { success: false, error: 'STABILITY_API_KEY not configured' };
  }

  try {
    const response = await fetch(STABILITY_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        text_prompts: [
          { text: prompt, weight: 1 },
          { text: negativePrompt, weight: -1 },
        ],
        cfg_scale: 5,        // Lower for faster
        height: 512,        // Smaller for faster
        width: 512,         // Smaller for faster
        steps: 10,          // Fewer steps = faster
        samples: 1,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return { success: false, error: `Stability API error: ${response.status} - ${errorText}` };
    }

    const data = await response.json();
    const base64 = data.artifacts?.[0]?.base64;
    
    if (base64) {
      return { success: true, imageUrl: `data:image/png;base64,${base64}` };
    }
    
    return { success: false, error: 'No image generated' };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Call Ollama API (supports local and hosted Ollama instances)
export async function callOllama(
  messages: { role: string; content: string }[],
  model: string = 'llama3'
): Promise<{ success: boolean; response?: string; error?: string }> {
  const apiKey = process.env.OLLAMA_API_KEY;
  const baseUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
  
  try {
    const response = await fetch(`${baseUrl}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(apiKey ? { 'Authorization': `Bearer ${apiKey}` } : {}),
      },
      body: JSON.stringify({
        model,
        messages,
        stream: false,
      }),
    });

    if (!response.ok) {
      return { success: false, error: `Ollama API error: ${response.status}` };
    }

    const data = await response.json();
    const responseText = data.message?.content;
    
    if (responseText) {
      return { success: true, response: responseText };
    }
    
    return { success: false, error: 'No response from Ollama' };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Call Alibaba Cloud (DashScope) API
export async function callAlibaba(
  messages: { role: string; content: string }[],
  model: string = 'qwen-plus'
): Promise<{ success: boolean; response?: string; error?: string }> {
  const apiKey = process.env.ALIBABA_API_KEY;
  
  if (!apiKey) {
    return { success: false, error: 'ALIBABA_API_KEY not configured' };
  }

  try {
    const response = await fetch(ALIBABA_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.7,
        max_tokens: 2048,
      }),
    });

    if (!response.ok) {
      return { success: false, error: `Alibaba API error: ${response.status}` };
    }

    const data = await response.json();
    const responseText = data.choices?.[0]?.message?.content;
    
    if (responseText) {
      return { success: true, response: responseText };
    }
    
    return { success: false, error: 'No response from Alibaba' };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Fallback chain for chat - tries providers in order
export async function callWithFallback(
  messages: { role: string; content: string }[],
  preferredProvider: AIProvider['type'] = 'groq'
): Promise<{ success: boolean; response?: string; provider?: string; error?: string }> {
  const providers: AIProvider[] = [
    { name: 'Groq', type: 'groq', capabilities: ['chat', 'code', 'translate', 'reasoning'] },
    { name: 'ZAI', type: 'zai', capabilities: ['chat', 'code', 'translate', 'reasoning'] },
    { name: 'Ollama', type: 'ollama', capabilities: ['chat', 'code', 'translate', 'reasoning'] },
    { name: 'Alibaba', type: 'alibaba', capabilities: ['chat', 'code', 'translate', 'reasoning'] },
  ];

  // Try preferred provider first
  const preferred = providers.find(p => p.type === preferredProvider);
  if (preferred) {
    providers.splice(providers.indexOf(preferred), 1);
    providers.unshift(preferred);
  }

  const errors: string[] = [];

  for (const provider of providers) {
    try {
      if (provider.type === 'groq') {
        const { callGroq } = await import('./groq');
        const result = await callGroq(messages);
        const response = result.choices?.[0]?.message?.content;
        if (response) {
          return { success: true, response, provider: 'Groq (Llama 3.3)' };
        }
      } else if (provider.type === 'zai') {
        if (!isZAIConfigured()) continue;
        
        // Add system prompt to messages
        const systemMsg = { role: 'system', content: getEnhancedSystemPrompt() };
        const allMessages = [systemMsg, ...messages];
        
        const result = await callZAI(allMessages);
        if (result.success && result.data) {
          const data = result.data as { choices?: { message?: { content?: string } }[] };
          const response = data.choices?.[0]?.message?.content;
          if (response) {
            return { success: true, response, provider: 'ZAI (GLM-5)' };
          }
        }
      } else if (provider.type === 'ollama') {
        if (!isOllamaConfigured()) continue;
        
        const systemMsg = { role: 'system', content: getEnhancedSystemPrompt() };
        const allMessages = [systemMsg, ...messages];
        
        const result = await callOllama(allMessages, 'llama3');
        if (result.success && result.response) {
          return { success: true, response: result.response, provider: 'Ollama (Llama 3)' };
        }
      } else if (provider.type === 'alibaba') {
        if (!isAlibabaConfigured()) continue;
        
        const systemMsg = { role: 'system', content: getEnhancedSystemPrompt() };
        const allMessages = [systemMsg, ...messages];
        
        const result = await callAlibaba(allMessages, 'qwen-plus');
        if (result.success && result.response) {
          return { success: true, response: result.response, provider: 'Alibaba (Qwen Plus)' };
        }
      }
    } catch (error) {
      errors.push(`${provider.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  return { 
    success: false, 
    error: `All providers failed. Errors: ${errors.join(', ')}` 
  };
}

// Enhanced system prompt for better responses
function getEnhancedSystemPrompt(): string {
  return `${BURMESE_SYSTEM_PROMPT}

## Response Guidelines:
- Be conversational and friendly in Myanmar language
- When asked "What AI are you?", respond "I am Amkyaw AI"
- When asked about capabilities, list all what you can do in an organized way
- Keep responses natural and human-like

## Code Response:
- When providing code, use proper markdown code blocks with language specification
- Add brief explanations in Myanmar or English
- Make code copyable and well-formatted`;
}