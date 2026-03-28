import { NextRequest, NextResponse } from 'next/server';
import { getAIResponse, AI_MODELS, AIModelType } from '@/lib/ai';
import { getDbClient } from '@/lib/db';
import { chats, messages } from '@/lib/schema';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, model = 'flash', temperature, maxTokens, chatId } = body;

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: 'Prompt is required and must be a string' },
        { status: 400 }
      );
    }

    const modelKey = model as AIModelType;
    if (!AI_MODELS[modelKey]) {
      return NextResponse.json(
        { error: 'Invalid model selected' },
        { status: 400 }
      );
    }

    // Get AI response
    const response = await getAIResponse({
      prompt,
      model: modelKey,
      temperature,
      maxTokens,
      systemInstruction: 'You are a helpful AI assistant. Provide clear, concise, and accurate responses.',
    });

    // Get database client
    let db;
    try {
      db = getDbClient();
    } catch (dbError) {
      console.log('Database not available, skipping save');
    }

    let savedChatId = chatId;

    // Save to database if available
    if (db) {
      const userId = 'demo-user';

      let newChat;
      try {
        [newChat] = await db
          .insert(chats)
          .values({
            userId,
            title: prompt.slice(0, 50) + (prompt.length > 50 ? '...' : ''),
          })
          .returning();
        savedChatId = newChat.id;
      } catch (insertError) {
        console.log('Could not create chat:', insertError);
      }

      if (savedChatId && typeof savedChatId === 'number') {
        try {
          await db.insert(messages).values([
            { chatId: savedChatId, role: 'user', content: prompt },
            { chatId: savedChatId, role: 'assistant', content: response.response },
          ]);
        } catch (msgError) {
          console.log('Could not save messages:', msgError);
        }
      }
    }

    return NextResponse.json({
      response: response.response,
      model: response.model,
      chatId: savedChatId,
      usage: response.usage,
    });
  } catch (error) {
    console.error('Chat API Error:', error);

    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        return NextResponse.json(
          { error: 'Invalid API configuration. Please check your GEMINI_API_KEY.' },
          { status: 503 }
        );
      }
      if (error.message.includes('rate limit') || error.message.includes('429')) {
        return NextResponse.json(
          { error: 'Rate limit exceeded. Please try again later.' },
          { status: 429 }
        );
      }
      if (error.message.includes('not set')) {
        return NextResponse.json(
          { error: 'API key not configured. Please set GEMINI_API_KEY environment variable.' },
          { status: 503 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to process your request. Please try again.' },
      { status: 500 }
    );
  }
}