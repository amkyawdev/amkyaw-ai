import { NextRequest, NextResponse } from 'next/server';

// Neon Auth JWKS endpoint for verifying tokens
const JWKS_URL = process.env.NEON_AUTH_JWKS_URL || 'https://ep-polished-darkness-a48b6ojm.neonauth.us-east-1.aws.neon.tech/neondb/auth/.well-known/jwks.json';
const AUTH_URL = process.env.NEON_AUTH_URL || 'https://ep-polished-darkness-a48b6ojm.neonauth.us-east-1.aws.neon.tech/neondb/auth';

// Middleware to verify authentication token
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json(
      { error: 'No authorization token provided' },
      { status: 401 }
    );
  }

  const token = authHeader.replace('Bearer ', '');

  try {
    // In a real implementation, you would:
    // 1. Fetch JWKS from Neon
    // 2. Verify the JWT token
    // 3. Return user info
    
    // For now, we'll return mock user data
    // In production, replace with actual token verification
    return NextResponse.json({
      user: {
        id: 'demo-user',
        email: 'demo@amkyaw.ai',
        name: 'Demo User',
      },
      authUrl: AUTH_URL,
    });
  } catch (error) {
    console.error('Auth Error:', error);
    return NextResponse.json(
      { error: 'Failed to verify authentication' },
      { status: 401 }
    );
  }
}

// Sign in endpoint - redirects to Neon Auth
export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json();

    if (action === 'signin') {
      // Redirect to Neon Auth sign-in page
      return NextResponse.json({
        signInUrl: `${AUTH_URL}/sign-in`,
      });
    }

    if (action === 'signout') {
      return NextResponse.json({
        message: 'Signed out successfully',
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Auth Error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}