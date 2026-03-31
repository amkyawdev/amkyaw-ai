import { NextRequest, NextResponse } from 'next/server';
import { generateImage, isHFConfigured } from '@/lib/huggingface';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, seed, aspectRatio } = body;

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required', errorMy: 'ပြန်ကြားချက်ထည့်ပါ။' },
        { status: 400 }
      );
    }

    if (!isHFConfigured()) {
      return NextResponse.json(
        { error: 'HUGGINGFACE_API_KEY not configured', errorMy: 'AI ပါ်မှာ ပုံထုပ်ဖို့ ခွင့်မရှိပါ။ Admin ကို ဆက်သွယ်ပါ။' },
        { status: 503 }
      );
    }

    // Map aspect ratio to dimensions
    const dimensions: Record<string, { width: number; height: number }> = {
      '1:1': { width: 1024, height: 1024 },
      '16:9': { width: 1344, height: 768 },
      '9:16': { width: 768, height: 1344 },
      '4:3': { width: 1152, height: 864 },
      '3:4': { width: 864, height: 1152 },
    };

    const result = await generateImage(prompt, {
      seed,
      width: dimensions[aspectRatio]?.width || 1024,
      height: dimensions[aspectRatio]?.height || 1024,
    });

    if (result.error) {
      return NextResponse.json(
        { error: result.error, errorMy: result.errorMy || 'ပုံထုပ်ရာတွင် အမှားဖြစ်ပါ။' },
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
      { error: error instanceof Error ? error.message : 'Unknown error', errorMy: 'ပုံထုပ်ရာတွင် အမှားဖြစ်ပါ။' },
      { status: 500 }
    );
  }
}
