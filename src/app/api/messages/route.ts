import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.NEON_DATABASE_URL!);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const groupId = searchParams.get('group_id');
    
    if (!groupId) {
      return NextResponse.json({ error: 'Group ID required' }, { status: 400 });
    }

    const result = await sql(
      `SELECT m.id, m.content, m.created_at, u.username 
       FROM messages m 
       LEFT JOIN users u ON m.user_id = u.id 
       WHERE m.group_id = $1 
       ORDER BY m.created_at ASC 
       LIMIT 100`,
      [groupId]
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error('Messages error:', error);
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { group_id, content } = body;
    
    if (!group_id || !content) {
      return NextResponse.json({ error: 'Group ID and content required' }, { status: 400 });
    }

    // Get user from header
    const username = request.headers.get('x-username') || 'Anonymous';
    
    // Find or create user
    let userResult = await sql('SELECT id FROM users WHERE username = $1 LIMIT 1', [username]);
    let userId;
    
    if (userResult.length === 0) {
      const newUser = await sql(
        'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id',
        [username, `${username}@demo.com`, 'demo']
      );
      userId = newUser[0].id;
    } else {
      userId = userResult[0].id;
    }

    // Insert message
    const result = await sql(
      'INSERT INTO messages (group_id, user_id, content) VALUES ($1, $2, $3) RETURNING id, content, created_at',
      [group_id, userId, content]
    );

    // Get username for response
    const msg = result[0];
    return NextResponse.json({
      id: msg.id,
      content: msg.content,
      username,
      created_at: msg.created_at
    });
  } catch (error) {
    console.error('Send message error:', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
