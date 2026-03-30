const GROQ_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';

// Groq supported models (updated March 2026)
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
  'gemma2-9b': {
    name: 'gemma2-9b-it',
    displayName: 'Gemma 2 9B',
    description: 'Google Gemma - Instruction tuned',
    maxTokens: 8192,
  },
} as const;

export type GroqModelType = keyof typeof GROQ_MODELS;

export async function callGroq(
  messages: { role: string; content: string }[],
  model: string = 'llama-3.3-70b-versatile',
  temperature: number = 0.7
) {
  const apiKey = process.env.GROQ_API_KEY;
  
  if (!apiKey) {
    throw new Error('GROQ_API_KEY is not defined in environment variables.');
  }

  const payload = {
    model,
    messages,
    temperature,
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
  return result.choices?.[0]?.message?.content ?? '';
}