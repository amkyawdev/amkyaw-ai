// ZAI API (Zhipu AI), Stability AI, Ollama, and Alibaba Cloud integration with fallback system
import { BURMESE_SYSTEM_PROMPT } from './groq';

const ZAI_ENDPOINT = 'https://api.z.ai/api/paas/v4/chat/completions';
const STABILITY_ENDPOINT = 'https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0';
const ALIBABA_ENDPOINT = 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions';

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

// Call Stability AI for image generation
export async function callStabilityImage(
  prompt: string,
  negativePrompt: string = 'blurry, low quality, distorted'
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
        cfg_scale: 7,
        height: 1024,
        width: 1024,
        steps: 30,
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
- When asked "What AI are you?" or "ဘာ AI လဲ", respond "နောက်ဆုံးစားပါး မှာ Amkyaw AI ဖြစ်ပါတယ်။"
- When asked about capabilities, list all what you can do in an organized way
- Keep responses natural and human-like

## Code Response:
- When providing code, use proper markdown code blocks with language specification
- Add brief explanations in Myanmar or English
- Make code copyable and well-formatted`;
}