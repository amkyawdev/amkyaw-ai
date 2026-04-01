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

export async function POST(request: NextRequest) {
  try {
    const db = await getDb();
    const body = await request.json();
    const { sql: sqlStatements } = body;

    if (!sqlStatements) {
      return NextResponse.json({ error: 'SQL statements required' }, { status: 400 });
    }

    // Split by semicolon and execute each statement
    const statements = sqlStatements.split(';').filter((s: string) => s.trim());
    const results: any[] = [];

    for (const statement of statements) {
      const trimmed = statement.trim();
      if (!trimmed) continue;
      
      try {
        // For SELECT queries, return the results
        if (trimmed.toUpperCase().startsWith('SELECT')) {
          const result = await db(trimmed);
          results.push({ type: 'SELECT', data: result });
        } else {
          // For INSERT, UPDATE, DELETE, CREATE, DROP
          const result = await db(trimmed);
          results.push({ type: 'ACTION', statement: trimmed.substring(0, 50), result });
        }
      } catch (err: any) {
        results.push({ type: 'ERROR', statement: trimmed.substring(0, 50), error: err.message });
      }
    }

    return NextResponse.json({ success: true, results });
  } catch (error) {
    console.error('SQL execution error:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      details: 'Make sure NEON_DATABASE_URL is configured'
    }, { status: 500 });
  }
}

export async function GET() {
  // Return available tables
  try {
    const db = await getDb();
    const tables = await db(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    
    return NextResponse.json({ tables: tables.map(t => t.table_name) });
  } catch (error) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
  }
}