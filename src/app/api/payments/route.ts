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

// GET - List payments (admin) or user's payments
export async function GET(request: NextRequest) {
  try {
    const db = await getDb();
    const { searchParams } = new URL(request.url);
    const admin = searchParams.get('admin');
    
    if (admin) {
      // Admin view - all pending payments with user info
      const payments = await db(`
        SELECT p.id, p.user_id, p.amount, p.screenshot_url, p.status, p.created_at,
               u.username
        FROM payments p
        LEFT JOIN users u ON p.user_id = u.id
        ORDER BY p.created_at DESC
        LIMIT 50
      `);
      
      const stats = await db(`
        SELECT 
          (SELECT COUNT(*) FROM users) as total_users,
          (SELECT COUNT(*) FROM payments WHERE status = 'pending') as pending_payments,
          (SELECT COALESCE(SUM(amount), 0) FROM payments WHERE status = 'approved') as total_revenue
      `);
      
      return NextResponse.json({ payments, stats: stats[0] });
    }
    
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  } catch (error) {
    console.error('Payments GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch payments' }, { status: 500 });
  }
}

// POST - Create new payment
export async function POST(request: NextRequest) {
  try {
    const db = await getDb();
    const body = await request.json();
    const { user_id, amount, screenshot_url } = body;
    
    if (!user_id || !amount || !screenshot_url) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    const result = await db(
      'INSERT INTO payments (user_id, amount, screenshot_url, status) VALUES ($1, $2, $3, $4) RETURNING id',
      [user_id, amount, screenshot_url, 'pending']
    );
    
    return NextResponse.json({ success: true, payment_id: result[0].id });
  } catch (error) {
    console.error('Payments POST error:', error);
    return NextResponse.json({ error: 'Failed to create payment' }, { status: 500 });
  }
}

// PUT - Update payment status (approve/reject)
export async function PUT(request: NextRequest) {
  try {
    const db = await getDb();
    const body = await request.json();
    const { payment_id, status } = body;
    
    if (!payment_id || !status) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // Update payment status
    await db('UPDATE payments SET status = $1 WHERE id = $2', [status, payment_id]);
    
    // If approved, update user premium status and set expiry
    if (status === 'approved') {
      // Get payment info
      const payment = await db('SELECT user_id, amount FROM payments WHERE id = $1', [payment_id]);
      
      if (payment.length > 0) {
        const { user_id, amount } = payment[0];
        
        // Calculate expiry based on amount
        let days = 30;
        if (amount >= 8000) days = 90;
        if (amount >= 15000) days = 180;
        if (amount >= 25000) days = 365;
        
        // Update user to premium
        await db(
          'UPDATE users SET is_premium = true, expire_date = NOW() + INTERVAL \'' + days + ' days\' WHERE id = $1',
          [user_id]
        );
      }
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Payments PUT error:', error);
    return NextResponse.json({ error: 'Failed to update payment' }, { status: 500 });
  }
}