import { NextRequest, NextResponse } from 'next/server';
import { getGeminiResponse } from '@/lib/gemini';
import { db } from '@/lib/db';
import { chats, messages } from '@/lib/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: 'Prompt is required and must be a string' },
        { status: 400 }
      );
    }

    // Get AI response from Gemini
    const response = await getGeminiResponse(prompt);

    // Get user ID (for now using a default - in production this would come from auth)
    const userId = 'default-user';

    // Create new chat if needed, or use existing
    const [newChat] = await db
      .insert(chats)
      .values({
        userId,
        title: prompt.slice(0, 50) + (prompt.length > 50 ? '...' : ''),
      })
      .returning();

    // Save user message
    const [userMessage] = await db
      .insert(messages)
      .values({
        chatId: newChat.id,
        role: 'user',
        content: prompt,
      })
      .returning();

    // Save assistant message
    const [assistantMessage] = await db
      .insert(messages)
      .values({
        chatId: newChat.id,
        role: 'assistant',
        content: response,
      })
      .returning();

    return NextResponse.json({
      response,
      chatId: newChat.id,
      messageId: assistantMessage.id,
    });
  } catch (error) {
    console.error('Chat API Error:', error);

    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        return NextResponse.json(
          { error: 'Invalid API configuration' },
          { status: 503 }
        );
      }
      if (error.message.includes('rate limit') || error.message.includes('429')) {
        return NextResponse.json(
          { error: 'Rate limit exceeded. Please try again later.' },
          { status: 429 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to process your request' },
      { status: 500 }
    );
  }
}