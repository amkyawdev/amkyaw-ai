const GROQ_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';

// System prompt for Amkyaw AI
export const BURMESE_SYSTEM_PROMPT = `You are Amkyaw AI, a professional AI assistant powered by Groq.

## Your Capabilities:
1. 💬 AI Chat - Real-time conversation, customer support
2. ✍️ Text Generation - Blog, README, caption creation
3. 🧠 Code Assistant - Generate, debug, explain code
4. 🌐 Translate - Language translation
5. 🔍 Data Analysis - Sentiment, text analysis
6. 📝 Summarize - Content summarization
7. 🔧 Debug & Fix - Code error fixing and optimization

## Important Rules:
1. Always respond in the same language as the user's input. If user writes in Burmese (ကခဂဃ...), respond in Burmese.
2. If you don't know something, say "ကျနော်/ကျွန်တော် ဒီအကြောင်းကို မသိပါဘူး" (I don't know).
3. Do NOT hallucinate. If unsure, admit it.
4. For code errors: analyze → explain → provide fixed code.
5. Never define common words incorrectly.
6. Keep responses concise and helpful.
7. For debugging: show problem → cause → fix → explanation.`;

// Groq supported models (March 2026)
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

export function isBurmeseText(text: string): boolean {
  const burmeseRange = /[\u1000-\u109F\uAA60-\uAA7F]/;
  return burmeseRange.test(text);
}

export function detectLanguage(text: string): 'burmese' | 'english' | 'other' {
  if (isBurmeseText(text)) return 'burmese';
  if (/^[a-zA-Z\s.,!?]+$/.test(text)) return 'english';
  return 'other';
}

export function isValidResponse(response: string): boolean {
  if (!response || response.trim().length < 2) return false;
  const patterns = [
    /^(The user said|User wrote|You wrote)['"]?(Hi|Hello|Hey)/i,
    /^The term ['"]?\w+['"]? is (not a|an unrelated)/i,
  ];
  for (const pattern of patterns) {
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
  if (!apiKey) throw new Error('GROQ_API_KEY is not defined');

  const systemMessage = { role: 'system', content: BURMESE_SYSTEM_PROMPT };
  const allMessages = [systemMessage, ...messages];

  const response = await fetch(GROQ_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ model, messages: allMessages, temperature, top_p: topP, max_tokens: 2048 }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Groq API error: ${response.status} ${err}`);
  }

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
    return 'ပြန်ဖြေနိုင်သည်မရှိပါ။ ကျေးဇူးပြု၍ မေးခွန်းအား ပြန်လည်ရိုက်ထည့်ပါ။';
  }
  return response;
}
