import { NextRequest, NextResponse } from 'next/server';
import { getAIResponse, AI_MODELS, AIModelType } from '@/lib/ai';
import { callGroq, GROQ_MODELS, GroqModelType } from '@/lib/groq';
import { getDbClient } from '@/lib/db';
import { chats, messages } from '@/lib/schema';

export const runtime = 'nodejs';

// Provider type
type AIProvider = 'gemini' | 'groq';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      prompt, 
      model = 'flash', 
      temperature, 
      maxTokens, 
      chatId,
      provider = 'gemini',
      messages: chatMessages 
    } = body;

    if (!prompt && (!chatMessages || chatMessages.length === 0)) {
      return NextResponse.json(
        { error: 'Prompt or messages are required' },
        { status: 400 }
      );
    }

    let response: string;
    let modelName: string;

    // Handle Groq API (for chat messages format)
    if (provider === 'groq') {
      const groqModelKey = model as GroqModelType;
      if (!GROQ_MODELS[groqModelKey]) {
        return NextResponse.json(
          { error: 'Invalid Groq model selected' },
          { status: 400 }
        );
      }

      const modelConfig = GROQ_MODELS[groqModelKey];
      
      // Build messages array
      const messages = chatMessages || [
        { role: 'system', content: 'You are a helpful AI assistant. Provide clear, concise, and accurate responses.' },
        { role: 'user', content: prompt }
      ];

      try {
        const result = await callGroq(messages, modelConfig.name, temperature);
        response = result.choices?.[0]?.message?.content ?? '';
        modelName = modelConfig.name;
      } catch (groqError) {
        console.error('Groq API Error:', groqError);
        return NextResponse.json(
          { error: groqError instanceof Error ? groqError.message : 'Groq API error' },
          { status: 500 }
        );
      }
    } 
    // Handle Gemini API (default)
    else {
      const modelKey = model as AIModelType;
      if (!AI_MODELS[modelKey]) {
        return NextResponse.json(
          { error: 'Invalid Gemini model selected' },
          { status: 400 }
        );
      }

      try {
        const aiResponse = await getAIResponse({
          prompt,
          model: modelKey,
          temperature,
          maxTokens,
          systemInstruction: 'You are a helpful AI assistant. Provide clear, concise, and accurate responses.',
        });
        response = aiResponse.response;
        modelName = aiResponse.model;
      } catch (geminiError) {
        console.error('Gemini API Error:', geminiError);
        return NextResponse.json(
          { error: geminiError instanceof Error ? geminiError.message : 'Gemini API error' },
          { status: 500 }
        );
      }
    }

    // Try to save to database (non-blocking)
    let savedChatId = chatId;
    try {
      const db = getDbClient();
      if (db) {
        const userId = 'demo-user';
        let newChat;
        
        [newChat] = await db
          .insert(chats)
          .values({
            userId,
            title: prompt?.slice(0, 50) + (prompt?.length > 50 ? '...' : '') || 'New Chat',
          })
          .returning();
        savedChatId = newChat.id;

        if (savedChatId && typeof savedChatId === 'number') {
          await db.insert(messages).values([
            { chatId: savedChatId, role: 'user', content: prompt || chatMessages?.[chatMessages.length - 1]?.content || '' },
            { chatId: savedChatId, role: 'assistant', content: response },
          ]);
        }
      }
    } catch (dbError) {
      console.log('Database save skipped:', dbError);
    }

    return NextResponse.json({
      response,
      model: modelName,
      provider,
      chatId: savedChatId,
    });

  } catch (error) {
    console.error('Chat API Error:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    if (errorMessage.includes('API key') || errorMessage.includes('key')) {
      return NextResponse.json(
        { error: 'API key not configured. Please check your environment variables.' },
        { status: 503 }
      );
    }

    if (errorMessage.includes('rate limit') || errorMessage.includes('429')) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: errorMessage || 'Failed to process your request. Please try again.' },
      { status: 500 }
    );
  }
}