import { NextRequest, NextResponse } from 'next/server';

// Lazy database connection
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

export async function GET() {
  try {
    const db = await getDb();
    const result = await db('SELECT id, name, description FROM chat_groups ORDER BY created_at DESC');
    return NextResponse.json({ groups: result });
  } catch (error) {
    console.error('Chat groups error:', error);
    return NextResponse.json({ error: 'Failed to fetch groups', details: String(error) }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const db = await getDb();
    const body = await request.json();
    const { name, description = '' } = body;

    if (!name) {
      return NextResponse.json({ error: 'Name required' }, { status: 400 });
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

    const existing = await db('SELECT id, name, description FROM chat_groups WHERE name = $1 LIMIT 1', [name]);
    if (existing.length > 0) {
      return NextResponse.json(existing[0]);
    }

    const result = await db(
      'INSERT INTO chat_groups (name, description, created_by) VALUES ($1, $2, $3) RETURNING id, name, description',
      [name, description, userId]
    );

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error('Create group error:', error);
    return NextResponse.json({ error: 'Failed to create group', details: String(error) }, { status: 500 });
  }
}
