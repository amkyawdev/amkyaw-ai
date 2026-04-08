const GROQ_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';

// Enhanced System Prompt for Amkyaw AI with Myanmar support
export const BURMESE_SYSTEM_PROMPT = `You are Amkyaw AI, a professional AI assistant powered by Groq (Llama 3.3 70B).

## Your Identity:
- Name: Amkyaw AI
- Created by: Aung Myo Kyaw
- Always be helpful, friendly, and professional

## Your Capabilities:
1. 💬 AI Chat - Conversation, Q&A, casual chat, greetings
2. 💻 Code - Write, debug, explain code (use markdown code blocks)
3. 🌐 Translate - English ↔ Burmese (Unicode only)
4. ✍️ Text - Write articles, stories, content
5. 🔍 Analyze - Data, sentiment analysis
6. 📝 Summarize - Quick summarization

## Myanmar Text Rules:
- Respond in the same language as user input
- Use proper Unicode characters

## Important:
- Use markdown code blocks for code
- If unsure, say "I don't know"
- Keep responses concise but complete`;

export const GROQ_MODELS = {
  'llama-3.3-70b': {
    name: 'llama-3.3-70b-versatile',
    displayName: 'Llama 3.3 70B',
    description: 'Most capable - Best for all tasks',
    maxTokens: 32768,
  },
  'llama-3.1-8b-instant': {
    name: 'llama-3.1-8b-instant',
    displayName: 'Llama 3.1 8B',
    description: 'Fast - Quick responses',
    maxTokens: 8192,
  },
} as const;

export type GroqModelType = keyof typeof GROQ_MODELS;

// Detect if text contains Myanmar Unicode
export function isBurmeseText(text: string): boolean {
  return /[\u1000-\u109F\uAA60-\uAA7F]/.test(text);
}

// Detect user intent from message
export type IntentType = 'chat' | 'code' | 'translate' | 'image' | 'default';

export function detectIntent(message: string): IntentType {
  const text = message.toLowerCase();
  
  // Image generation intent
  const imageKeywords = ['image', 'photo', 'picture', 'draw', 'generate image', 'create image', 'generate picture', 'create picture', 'draw', 'art', 'artwork', 'illustration', 'stable diffusion'];
  if (imageKeywords.some(keyword => text.includes(keyword))) {
    return 'image';
  }
  
  // Coding intent
  const codeKeywords = ['code', 'javascript', 'python', 'html', 'css', 'react', 'node', 'debug', 'fix error', 'write code', 'programming', 'function', 'api', 'sql', 'typescript', 'java', 'php', 'coding', 'program'];
  if (codeKeywords.some(keyword => text.includes(keyword))) {
    return 'code';
  }
  
  // Translate intent
  const translateKeywords = ['translate', 'translation', 'interpreter'];
  if (translateKeywords.some(keyword => text.includes(keyword)) || isBurmeseText(message.slice(0, 50))) {
    return 'translate';
  }
  
  // Chat intent (short messages, greetings)
  const chatKeywords = ['hi', 'hello', 'hey', 'good morning', 'good night', 'bye', 'thanks'];
  if (chatKeywords.some(keyword => text.includes(keyword)) || message.trim().length < 30) {
    return 'chat';
  }
  
  return 'default';
}

// Route to correct AI based on intent
export function routeAI(intent: IntentType): 'groq' | 'huggingface' {
  if (intent === 'image') {
    return 'huggingface';
  }
  return 'groq';
}

// Get thinking text based on intent
export function getThinkingText(intent: string): string {
  switch (intent) {
    case 'chat': return 'Typing...';
    case 'code': return 'Writing code...';
    case 'translate': return 'Translating...';
    case 'image': return 'Generating Image...';
    default: return 'Thinking...';
  }
}

export function isValidResponse(response: string): boolean {
  if (!response || response.trim().length < 2) return false;
  return true;
}

export async function callGroq(
  messages: { role: string; content: string }[],
  model: string = 'llama-3.3-70b-versatile',
  temperature: number = 0.5,
  topP: number = 0.9
) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error('GROQ_API_KEY is not defined');

  // System Message ကို အမြဲတမ်း ထိပ်ဆုံးမှာ ထားပါ
  const systemMessage = { role: 'system', content: BURMESE_SYSTEM_PROMPT };
  
  // History အရှည်ကြီးဖြစ်နေရင် နောက်ဆုံး message ၁၀ ခုကနေ ၁၅ ခုလောက်ပဲ ဖြတ်ယူတာမျိုး (Token ချွေတာရန်) လုပ်သင့်ပါတယ်
  const conversationContext = messages.slice(-15); 
  const allMessages = [systemMessage, ...conversationContext];

  const response = await fetch(GROQ_ENDPOINT, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json', 
      'Authorization': `Bearer ${apiKey}` 
    },
    body: JSON.stringify({ 
      model, 
      messages: allMessages, 
      temperature, 
      top_p: topP, 
      max_tokens: 2048,
      stream: false // လိုအပ်ရင် stream true လုပ်နိုင်ပါတယ်
    }),
  });

  if (!response.ok) throw new Error(`Groq API error: ${response.status}`);
  return response.json();
}

export async function getGroqResponse(
  messages: { role: string; content: string }[],
  model: GroqModelType = 'llama-3.3-70b'
): Promise<string> {
  const modelConfig = GROQ_MODELS[model];
  const result = await callGroq(messages, modelConfig.name);
  const response = result.choices?.[0]?.message?.content ?? '';
  if (!isValidResponse(response)) {
    return 'Sorry, I could not generate a response. Please try again.';
  }
  return response;
}

// Streaming version of callGroq
export async function callGroqStream(
  messages: { role: string; content: string }[],
  model: string = 'llama-3.3-70b-versatile',
  temperature: number = 0.5,
  topP: number = 0.9
): Promise<ReadableStream> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error('GROQ_API_KEY is not defined');

  const systemMessage = { role: 'system', content: BURMESE_SYSTEM_PROMPT };
  const conversationContext = messages.slice(-15);
  const allMessages = [systemMessage, ...conversationContext];

  const response = await fetch(GROQ_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      messages: allMessages,
      temperature,
      top_p: topP,
      max_tokens: 2048,
      stream: true
    }),
  });

  if (!response.ok) throw new Error(`Groq API error: ${response.status}`);

  return response.body as ReadableStream;
}
