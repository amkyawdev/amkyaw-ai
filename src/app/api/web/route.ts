import { NextRequest, NextResponse } from 'next/server';
import { fetchWebsite, analyzeWebsite } from '@/lib/ai-providers';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, url } = body;

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    let result;

    switch (action) {
      case 'fetch':
        result = await fetchWebsite(url);
        if (result.success) {
          return NextResponse.json({
            success: true,
            content: result.content,
            message: 'Website fetched successfully',
          });
        }
        return NextResponse.json(
          { error: result.error },
          { status: 500 }
        );

      case 'analyze':
        result = await analyzeWebsite(url);
        if (result.success) {
          return NextResponse.json({
            success: true,
            analysis: result.data,
            message: 'Website analyzed successfully',
          });
        }
        return NextResponse.json(
          { error: result.error },
          { status: 500 }
        );

      default:
        return NextResponse.json(
          { error: 'Invalid action. Use "fetch" or "analyze"' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Web API Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Handle GET requests
export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Web API - Use POST to fetch or analyze websites',
    actions: ['fetch', 'analyze'],
    example: {
      action: 'analyze',
      url: 'https://example.com',
    },
  });
}