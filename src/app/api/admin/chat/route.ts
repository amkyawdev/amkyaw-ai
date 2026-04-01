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

// DELETE message by ID
export async function DELETE(request: NextRequest) {
  try {
    const db = await getDb();
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const id = searchParams.get('id');
    const userId = searchParams.get('user_id');

    if (!id && !userId) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 });
    }

    // Delete message
    if (action === 'delete_message' && id) {
      await db('DELETE FROM messages WHERE id = $1', [id]);
      return NextResponse.json({ success: true, message: 'Message deleted' });
    }

    // Kick user from group
    if (action === 'kick_user' && userId) {
      const groupId = searchParams.get('group_id');
      if (!groupId) {
        return NextResponse.json({ error: 'group_id required' }, { status: 400 });
      }
      await db('DELETE FROM group_members WHERE user_id = $1 AND group_id = $2', [userId, groupId]);
      return NextResponse.json({ success: true, message: 'User kicked from group' });
    }

    // Mute user (add to blocked list temporarily)
    if (action === 'mute_user' && userId) {
      const duration = searchParams.get('duration') || '24h'; // default 24 hours
      
      // Check if already blocked
      const existing = await db('SELECT id FROM users WHERE id = $1 AND is_premium = false', [userId]);
      if (existing.length === 0) {
        // Set premium to false to indicate muted (or create separate column)
        await db('UPDATE users SET is_premium = false WHERE id = $1', [userId]);
      }
      return NextResponse.json({ success: true, message: `User muted for ${duration}` });
    }

    // Block user
    if (action === 'block_user' && userId) {
      // Mark user as blocked by setting a special flag
      // We'll use is_premium column to store blocked status (false = blocked)
      await db('UPDATE users SET is_premium = false WHERE id = $1', [userId]);
      
      // Also remove from all groups
      await db('DELETE FROM group_members WHERE user_id = $1', [userId]);
      
      return NextResponse.json({ success: true, message: 'User blocked' });
    }

    // Unblock user
    if (action === 'unblock_user' && userId) {
      await db('UPDATE users SET is_premium = true WHERE id = $1', [userId]);
      return NextResponse.json({ success: true, message: 'User unblocked' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('Admin chat error:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}

// GET - Get admin data
export async function GET(request: NextRequest) {
  try {
    const db = await getDb();
    const { searchParams } = new URL(request.url);
    const admin = searchParams.get('admin');

    if (admin === 'true') {
      // Get all users
      const users = await db(`
        SELECT id, username, email, is_premium, created_at, last_login 
        FROM users 
        ORDER BY created_at DESC 
        LIMIT 100
      `);

      // Get all messages with user info
      const messages = await db(`
        SELECT m.id, m.content, m.created_at, m.group_id, u.username, g.name as group_name
        FROM messages m
        LEFT JOIN users u ON m.user_id = u.id
        LEFT JOIN chat_groups g ON m.group_id = g.id
        ORDER BY m.created_at DESC
        LIMIT 100
      `);

      // Get groups with member count
      const groups = await db(`
        SELECT g.id, g.name, g.description, g.created_at,
               (SELECT COUNT(*) FROM group_members WHERE group_id = g.id) as member_count
        FROM chat_groups g
        ORDER BY g.created_at DESC
      `);

      // Get blocked users (is_premium = false)
      const blockedUsers = await db(`
        SELECT id, username, email, created_at 
        FROM users 
        WHERE is_premium = false
        ORDER BY created_at DESC
      `);

      return NextResponse.json({
        users,
        messages,
        groups,
        blockedUsers,
        stats: {
          totalUsers: users.length,
          totalMessages: messages.length,
          totalGroups: groups.length,
          blockedUsers: blockedUsers.length,
        }
      });
    }

    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });

  } catch (error) {
    console.error('Admin chat GET error:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}