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

export async function GET(request: NextRequest) {
  try {
    const db = await getDb();
    const { searchParams } = new URL(request.url);
    const groupId = searchParams.get('group_id');
    
    if (!groupId) {
      return NextResponse.json({ error: 'Group ID required' }, { status: 400 });
    }

    const result = await db(
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
    return NextResponse.json({ error: 'Failed to fetch messages', details: String(error) }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const db = await getDb();
    const body = await request.json();
    const { group_id, content } = body;
    
    if (!group_id || !content) {
      return NextResponse.json({ error: 'Group ID and content required' }, { status: 400 });
    }

    const username = request.headers.get('x-username') || 'Anonymous';

    let userResult = await db('SELECT id FROM users WHERE username = $1 LIMIT 1', [username]);
    let userId;
    
    if (userResult.length === 0) {
      const newUser = await db(
        'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id',
        [username, `${username}@demo.com`, 'demo']
      );
      userId = newUser[0].id;
    } else {
      userId = userResult[0].id;
    }

    const result = await db(
      'INSERT INTO messages (group_id, user_id, content) VALUES ($1, $2, $3) RETURNING id, content, created_at',
      [group_id, userId, content]
    );

    const msg = result[0];
    return NextResponse.json({
      id: msg.id,
      content: msg.content,
      username,
      created_at: msg.created_at
    });
  } catch (error) {
    console.error('Send message error:', error);
    return NextResponse.json({ error: 'Failed to send message', details: String(error) }, { status: 500 });
  }
}
