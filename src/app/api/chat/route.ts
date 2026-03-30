import { NextRequest, NextResponse } from 'next/server';
import { callGroq, GROQ_MODELS, GroqModelType } from '@/lib/groq';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      prompt, 
      model = 'mixtral-8x7b', 
      temperature = 0.7, 
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
        { error: 'Invalid model selected. Available: mixtral-8x7b, llama-3.1-8b, gemma2-9b' },
        { status: 400 }
      );
    }

    const modelConfig = GROQ_MODELS[modelKey];
    
    // Build messages array
    const messages = chatMessages || [
      { role: 'system', content: 'You are a helpful AI assistant. Provide clear, concise, and accurate responses.' },
      { role: 'user', content: prompt }
    ];

    // Call Groq API
    const result = await callGroq(messages, modelConfig.name, temperature);
    const response = result.choices?.[0]?.message?.content ?? '';

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