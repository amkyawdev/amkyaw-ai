import { NextRequest, NextResponse } from 'next/server';
import { generateImage, isHFConfigured } from '@/lib/huggingface';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt } = body;

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

    const result = await generateImage(prompt);

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
