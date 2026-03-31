import { NextRequest, NextResponse } from 'next/server';
import { generateImage, isHFConfigured } from '@/lib/huggingface';
import { callStabilityImage, isStabilityConfigured } from '@/lib/ai-providers';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, seed, aspectRatio = '1:1' } = body;

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required', errorMy: 'ပြန်ကြားချက်ထည့်ပါ။' },
        { status: 400 }
      );
    }

    // Map aspect ratio to smaller dimensions for faster generation
    const dimensions: Record<string, { width: number; height: number }> = {
      '1:1': { width: 512, height: 512 },
      '16:9': { width: 768, height: 432 },
      '9:16': { width: 432, height: 768 },
      '4:3': { width: 640, height: 480 },
      '3:4': { width: 480, height: 640 },
    };

    const size = dimensions[aspectRatio] || dimensions['1:1'];

    let imageUrl = '';
    let provider = '';

    // Try Stability AI first (often faster)
    if (isStabilityConfigured()) {
      const stabilityResult = await callStabilityImage(
        prompt,
        'blurry, low quality, distorted, deformed, bad anatomy'
      );
      
      if (stabilityResult.success && stabilityResult.imageUrl) {
        imageUrl = stabilityResult.imageUrl;
        provider = 'Stability AI (SDXL)';
      }
    }

    // Fallback to HuggingFace if Stability fails or not configured
    if (!imageUrl && isHFConfigured()) {
      const hfResult = await generateImage(prompt, {
        seed,
        width: size.width,
        height: size.height,
      });

      if (hfResult.error) {
        // If both fail, return error
        if (!isStabilityConfigured()) {
          return NextResponse.json(
            { error: 'No image API configured', errorMy: 'ပုံထုပ်ဖို့ API မရှိပါ။ Admin ကို ဆက်သွယ်ပါ။' },
            { status: 503 }
          );
        }
        return NextResponse.json(
          { error: hfResult.error, errorMy: hfResult.errorMy || 'ပုံထုပ်ရာတွင် အမှားဖြစ်ပါ။' },
          { status: 500 }
        );
      }

      imageUrl = hfResult.imageUrl || '';
      provider = 'HuggingFace (FLUX)';
    }

    if (!imageUrl) {
      return NextResponse.json(
        { error: 'Image generation failed', errorMy: 'ပုံထုပ်ရာတွင် အမှားဖြစ်ပါ။' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      imageUrl,
      provider,
    });

  } catch (error) {
    console.error('Image API Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error', errorMy: 'ပုံထုပ်ရာတွင် အမှားဖြစ်ပါ။' },
      { status: 500 }
    );
  }
}
