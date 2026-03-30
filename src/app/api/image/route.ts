import { NextRequest, NextResponse } from 'next/server';
import { generateImage, isHFConfigured } from '@/lib/huggingface';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt } = body;

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    if (!isHFConfigured()) {
      return NextResponse.json(
        { error: 'HUGGINGFACE_API_KEY not configured. Please add it in Vercel environment variables.' },
        { status: 503 }
      );
    }

    const result = await generateImage(prompt);

    if (result.error) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      imageUrl: result.imageUrl,
      provider: 'huggingface',
    });

  } catch (error) {
    console.error('Image API Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
