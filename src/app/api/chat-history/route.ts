import { NextRequest, NextResponse } from 'next/server';

let sql: any;

async function getDb() {
  if (!sql) {
    const { neon } = await import('@neondatabase/serverless');
    const dbUrl = process.env.NEON_DATABASE_URL;
    if (!dbUrl) {
      throw new Error('NEON_DATABASE_URL not configured');
    }
    sql = neon(dbUrl);
  }
  return sql;
}

// GET - Fetch chat history for a user
export async function GET(request: NextRequest) {
  try {
    const db = await getDb();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');
    const chatId = searchParams.get('chat_id');
    
    // If chat_id provided, get specific chat with messages
    if (chatId) {
      const chatResult = await db(
        `SELECT id, title, model, created_at, updated_at 
         FROM chat_history 
         WHERE id = $1`,
        [chatId]
      );
      
      if (chatResult.length === 0) {
        return NextResponse.json({ chat: null, messages: [] });
      }
      
      const messagesResult = await db(
        `SELECT id, role, content, created_at 
         FROM chat_messages 
         WHERE chat_id = $1 
         ORDER BY created_at ASC`,
        [chatId]
      );
      
      return NextResponse.json({ 
        chat: chatResult[0], 
        messages: messagesResult 
      });
    }
    
    // Otherwise, get all chats for user
    if (!userId) {
      return NextResponse.json({ error: 'user_id required' }, { status: 400 });
    }
    
    const chats = await db(
      `SELECT id, title, model, created_at, updated_at 
       FROM chat_history 
       WHERE user_id = $1 
       ORDER BY updated_at DESC 
       LIMIT 50`,
      [userId]
    );
    
    return NextResponse.json({ chats });
  } catch (error) {
    console.error('Chat history error:', error);
    return NextResponse.json({ error: 'Failed to fetch chat history', details: String(error) }, { status: 500 });
  }
}

// POST - Save new chat or update existing
export async function POST(request: NextRequest) {
  try {
    const db = await getDb();
    const body = await request.json();
    const { user_id, chat_id, title, model, messages } = body;
    
    if (!user_id) {
      return NextResponse.json({ error: 'user_id required' }, { status: 400 });
    }
    
    let savedChatId = chat_id;
    
    // Create or update chat
    if (chat_id) {
      // Update existing chat
      await db(
        `UPDATE chat_history 
         SET title = COALESCE($1, title), updated_at = NOW() 
         WHERE id = $2`,
        [title, chat_id]
      );
    } else {
      // Create new chat
      const newChat = await db(
        `INSERT INTO chat_history (user_id, title, model) 
         VALUES ($1, $2, $3) 
         RETURNING id`,
        [user_id, title || 'New Chat', model || 'llama-3.3-70b-instant']
      );
      savedChatId = newChat[0].id;
    }
    
    // Save messages if provided
    if (messages && messages.length > 0 && savedChatId) {
      // Clear existing messages for this chat (optional - keep if you want to replace)
      // await db('DELETE FROM chat_messages WHERE chat_id = $1', [savedChatId]);
      
      // Insert new messages
      for (const msg of messages) {
        await db(
          `INSERT INTO chat_messages (chat_id, role, content) 
           VALUES ($1, $2, $3)`,
          [savedChatId, msg.role, msg.content]
        );
      }
      
      // Update chat timestamp
      await db(
        `UPDATE chat_history SET updated_at = NOW() WHERE id = $1`,
        [savedChatId]
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      chat_id: savedChatId,
      message: chat_id ? 'Chat updated' : 'Chat created'
    });
  } catch (error) {
    console.error('Save chat error:', error);
    return NextResponse.json({ error: 'Failed to save chat', details: String(error) }, { status: 500 });
  }
}

// DELETE - Delete a chat
export async function DELETE(request: NextRequest) {
  try {
    const db = await getDb();
    const { searchParams } = new URL(request.url);
    const chatId = searchParams.get('chat_id');
    
    if (!chatId) {
      return NextResponse.json({ error: 'chat_id required' }, { status: 400 });
    }
    
    // Delete messages first
    await db('DELETE FROM chat_messages WHERE chat_id = $1', [chatId]);
    // Delete chat
    await db('DELETE FROM chat_history WHERE id = $1', [chatId]);
    
    return NextResponse.json({ success: true, message: 'Chat deleted' });
  } catch (error) {
    console.error('Delete chat error:', error);
    return NextResponse.json({ error: 'Failed to delete chat', details: String(error) }, { status: 500 });
  }
}