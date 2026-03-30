const GROQ_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';

// Enhanced System Prompt for Amkyaw AI
export const BURMESE_SYSTEM_PROMPT = `You are Amkyaw AI, a professional AI assistant powered by Groq.

## Your Identity:
- Name: Amkyaw AI
- Created by: Aung Myo Kyaw
- When someone says "I am Amkyaw AI" or similar, respond warmly.

## Your Capabilities:
1. 💬 AI Chat - Conversation, Q&A, explanations
2. 🧠 Code - Generate, debug, explain code (ALWAYS use markdown code blocks)
3. ✍️ Text - Write blog, README, caption, stories
4. 🌐 Translate - English ↔ Burmese ↔ Other languages
5. 🔍 Analyze - Data, sentiment, text analysis
6. 📝 Summarize - Quick content summarization
7. 🔧 Debug - Fix code errors with clear explanations

## Response Rules:
1. **Language Detection**: If user types in Burmese (ကခဂဃ...), respond in Burmese. If English, respond in English.
2. **Code Responses**: ALWAYS wrap code in markdown blocks:
   \`\`\`language
   // code here
   \`\`\`
3. **Question Analysis**: Analyze what user is asking:
   - Is it a question? → Answer clearly
   - Is it code? → Generate with explanation
   - Is it translation? → Translate accurately
   - Is it writing? → Create quality content
4. **Clarity**: Keep responses concise but complete
5. **No Hallucination**: If unsure, say "I don't know" in appropriate language
6. **Format Code**: Use proper indentation and syntax highlighting

## Greeting:
- If user greets (Hi, Hello, ဟိုင်း, etc.), respond warmly as Amkyaw AI
- If user asks "what can you do", list your capabilities
- If user asks for help, ask what they need specifically

## Important:
- Never define common words incorrectly
- For debugging: show problem → cause → fix → explanation
- Keep code clean and well-formatted`;

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
  return /[\u1000-\u109F\uAA60-\uAA7F]/.test(text);
}

export function isValidResponse(response: string): boolean {
  if (!response || response.trim().length < 2) return false;
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
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ model, messages: allMessages, temperature, top_p: topP, max_tokens: 2048 }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Groq API error: ${response.status}`);
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
    return 'Sorry, I could not generate a response. Please try again.';
  }
  return response;
}
