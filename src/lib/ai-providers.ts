// ZAI API (Zhipu AI) and Stability AI integration with fallback system
import { BURMESE_SYSTEM_PROMPT } from './groq';

const ZAI_ENDPOINT = 'https://api.z.ai/api/paas/v4/chat/completions';
const STABILITY_ENDPOINT = 'https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0';

export interface AIProvider {
  name: string;
  type: 'zai' | 'groq' | 'stability' | 'huggingface';
}

// Check if ZAI is configured
export function isZAIConfigured(): boolean {
  return !!process.env.ZAI_API_KEY;
}

// Check if Stability is configured
export function isStabilityConfigured(): boolean {
  return !!process.env.STABILITY_API_KEY;
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

// Fallback chain for chat - tries providers in order
export async function callWithFallback(
  messages: { role: string; content: string }[],
  preferredProvider: AIProvider['type'] = 'groq'
): Promise<{ success: boolean; response?: string; provider?: string; error?: string }> {
  const providers: AIProvider[] = [
    { name: 'Groq', type: 'groq' },
    { name: 'ZAI', type: 'zai' },
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
          return { success: true, response, provider: 'Groq' };
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