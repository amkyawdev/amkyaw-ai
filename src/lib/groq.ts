const GROQ_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';

// System prompt for Burmese language context
export const BURMESE_SYSTEM_PROMPT = `You are Amkyaw AI, a helpful assistant specialized in Burmese (Myanmar) language and culture.

IMPORTANT RULES:
1. Always respond in the same language as the user's input. If the user writes in Burmese (Unicode: ကခဂဃစကခ...), respond in Burmese.
2. If you don't know or understand something, clearly say "ကျနော်/ကျွန်တော် ဒီအကြောင်းကို မသိပါဘူး" (I don't know about this).
3. Do NOT make up or hallucinate answers. If unsure, admit it.
4. For code-related questions, respond with proper code examples.
5. Keep responses concise and helpful.
6. If the input contains Burmese script (Unicode characters 1000-109F), treat it as Burmese language.
7. Never define common English words (like "Hi", "Hello") as body parts or unrelated meanings.
8. For greetings in any language, respond appropriately to the greeting's meaning.
9. Analyze user input and provide the most relevant response based on these capabilities:
   - AI Chat / Chatbot
   - Text Generation (blog, README, caption)
   - Code Assistant (HTML, CSS, JS, debugging)
   - Language Processing (translate, grammar, summarize)
   - Data Understanding (analysis, sentiment)
   - AI Automation`;

// Groq supported models (updated March 2026 - Gemma deprecated)
export const GROQ_MODELS = {
  'llama-3.3-70b': {
    name: 'llama-3.3-70b-versatile',
    displayName: 'Llama 3.3 70B',
    description: 'Most capable - Best for complex tasks',
    maxTokens: 32768,
  },
  'llama-3.1-8b': {
    name: 'llama-3.1-8b-instant',
    displayName: 'Llama 3.1 8B',
    description: 'Fast & efficient - Best for quick responses',
    maxTokens: 8192,
  },
} as const;

export type GroqModelType = keyof typeof GROQ_MODELS;

// AI Capability Options for users
export const AI_CAPABILITIES = [
  { id: 'chat', label: '💬 AI Chat', icon: 'MessageSquare', desc: 'Real-time chatbot, customer support' },
  { id: 'text', label: '✍️ Text Generation', icon: 'FileText', desc: 'Blog, README, caption creation' },
  { id: 'code', label: '🧠 Code Assistant', icon: 'Code', desc: 'Generate, debug, explain code' },
  { id: 'translate', label: '🌐 Translate', icon: 'Languages', desc: 'Translate, grammar fix, summarize' },
  { id: 'analysis', label: '🔍 Data Analysis', icon: 'BarChart3', desc: 'Sentiment, text analysis' },
  { id: 'automation', label: '🤖 Automation', icon: 'Zap', desc: 'Auto reply, content generation' },
] as const;

export type AICapabilityType = typeof AI_CAPABILITIES[number]['id'];

// Check if text contains Burmese Unicode characters
export function isBurmeseText(text: string): boolean {
  const burmeseRange = /[\u1000-\u109F\uAA60-\uAA7F]/;
  return burmeseRange.test(text);
}

// Detect language from text
export function detectLanguage(text: string): 'burmese' | 'english' | 'other' {
  if (isBurmeseText(text)) return 'burmese';
  if (/^[a-zA-Z\s.,!?]+$/.test(text)) return 'english';
  return 'other';
}

// Check if response is valid (not hallucinated/empty)
export function isValidResponse(response: string): boolean {
  if (!response || response.trim().length < 2) return false;
  
  const hallucinationPatterns = [
    /^(The user said|User wrote|You wrote)['"]?(Hi|Hello|Hey)/i,
    /^The term ['"]?\w+['"]? is (not a|an unrelated)/i,
    /This is (not related|a body part|an anatomical)/i,
  ];
  
  for (const pattern of hallucinationPatterns) {
    if (pattern.test(response.trim())) return false;
  }
  
  return true;
}

export async function callGroq(
  messages: { role: string; content: string }[],
  model: string = 'llama-3.3-70b-versatile',
  temperature: number = 0.2,
  topP: number = 0.8
) {
  const apiKey = process.env.GROQ_API_KEY;
  
  if (!apiKey) {
    throw new Error('GROQ_API_KEY is not defined in environment variables.');
  }

  const systemMessage = { role: 'system', content: BURMESE_SYSTEM_PROMPT };
  const allMessages = [systemMessage, ...messages];

  const payload = {
    model,
    messages: allMessages,
    temperature,
    top_p: topP,
    max_tokens: 2048,
  };

  const response = await fetch(GROQ_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Groq API error: ${response.status} ${err}`);
  }

  const data = await response.json();
  return data;
}

export async function getGroqResponse(
  messages: { role: string; content: string }[],
  model: GroqModelType = 'llama-3.3-70b'
): Promise<string> {
  const modelConfig = GROQ_MODELS[model];
  const result = await callGroq(messages, modelConfig.name);
  const response = result.choices?.[0]?.message?.content ?? '';
  
  if (!isValidResponse(response)) {
    return 'ပြန်ဖြေနိုင်သည်မရှိပါ။ ကျေးဇူးပြု၍ မေးခွန်းအား ပြန်လည်ရိုက်ထည့်ပါ။';
  }
  
  return response;
}
