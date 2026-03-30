import { NextRequest, NextResponse } from 'next/server';
import { callGroq, GROQ_MODELS, GroqModelType, BURMESE_SYSTEM_PROMPT, isValidResponse } from '@/lib/groq';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      prompt, 
      model = 'llama-3.3-70b', 
      temperature = 0.2, 
      topP = 0.8,
      chatId,
      messages: chatMessages 
    } = body;

    if (!prompt && (!chatMessages || chatMessages.length === 0)) {
      return NextResponse.json(
        { error: 'Prompt or messages are required' },
        { status: 400 }
      );
    }

    const modelKey = model as GroqModelType;
    if (!GROQ_MODELS[modelKey]) {
      return NextResponse.json(
        { error: 'Invalid model selected. Available: llama-3.3-70b, llama-3.3-70b' },
        { status: 400 }
      );
    }

    const modelConfig = GROQ_MODELS[modelKey];
    
    // Build messages array with system prompt for Burmese context
    const systemMessage = { role: 'system', content: BURMESE_SYSTEM_PROMPT };
    const userMessage = { role: 'user', content: prompt };
    
    const messages = chatMessages 
      ? [systemMessage, ...chatMessages]
      : [systemMessage, userMessage];

    // Call Groq API with optimized parameters
    const result = await callGroq(messages, modelConfig.name, temperature, topP);
    let response = result.choices?.[0]?.message?.content ?? '';

    // Validate response - check for hallucinations
    if (!isValidResponse(response)) {
      response = 'ပြန်ဖြေနိုင်သည်မရှိပါ။ ကျေးဇူးပြု၍ မေးခွန်းအား ပြန်လည်ရိုက်ထည့်ပါ။';
    }

    return NextResponse.json({
      response,
      model: modelConfig.name,
      provider: 'groq',
      chatId,
    });

  } catch (error) {
    console.error('Chat API Error:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    if (errorMessage.includes('GROQ_API_KEY') || errorMessage.includes('key')) {
      return NextResponse.json(
        { error: 'GROQ_API_KEY not configured. Please add it in Vercel environment variables.' },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}