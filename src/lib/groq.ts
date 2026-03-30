const GROQ_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';

// Groq supported models
export const GROQ_MODELS = {
  'mixtral-8x7b': {
    name: 'mixtral-8x7b-32768',
    displayName: 'Mixtral 8x7B',
    description: 'Fast and capable mixture of experts',
    maxTokens: 32768,
  },
  'llama-3.1-8b': {
    name: 'llama-3.1-8b-instant',
    displayName: 'Llama 3.1 8B',
    description: 'Fast and efficient Llama model',
    maxTokens: 8192,
  },
  'gemma2-9b': {
    name: 'gemma2-9b-it',
    displayName: 'Gemma 2 9B',
    description: 'Google Gemma instruction tuned',
    maxTokens: 8192,
  },
} as const;

export type GroqModelType = keyof typeof GROQ_MODELS;

export async function callGroq(
  messages: { role: string; content: string }[],
  model: string = 'mixtral-8x7b-32768',
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
  model: GroqModelType = 'mixtral-8x7b'
): Promise<string> {
  const modelConfig = GROQ_MODELS[model];
  const result = await callGroq(messages, modelConfig.name);
  return result.choices?.[0]?.message?.content ?? '';
}