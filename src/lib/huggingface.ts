// HuggingFace API for image generation
// Using Flux Schnell for faster inference
const HF_API_URL = 'https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-schnell';

export interface ImageGenerationOptions {
  seed?: number;
  width?: number;
  height?: number;
  guidance_scale?: number;
  num_inference_steps?: number;
}

export interface HuggingFaceResponse {
  imageUrl?: string;
  error?: string;
  errorMy?: string; // Myanmar error message
}

export async function generateImage(prompt: string, options: ImageGenerationOptions = {}): Promise<HuggingFaceResponse> {
  const apiKey = process.env.HUGGINGFACE_API_KEY;
  
  if (!apiKey) {
    return { 
      error: 'HUGGINGFACE_API_KEY not configured', 
      errorMy: 'AI ပါ်မှာ ပုံထုပ်ဖို့ ခွင့်မရှိပါ။ Admin ကို ဆက်သွယ်ပါ။' 
    };
  }

  const { width = 1024, height = 1024, seed } = options;

  try {
    // Build the request body with parameters
    const requestBody: Record<string, unknown> = {
      inputs: prompt,
    };

    // Add parameters if specified
    if (width && height) {
      requestBody.parameters = {
        width,
        height,
        ...(seed ? { seed } : {}),
      };
    }

    const response = await fetch(HF_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    // Handle different status codes
    if (response.status === 410) {
      return { 
        error: 'Model deprecated - trying fallback', 
        errorMy: 'စိတ်မရှိပါနဲ့၊ Update တွင်းပါမယ်။ နောက်ထပ် ကြိုးစားပါ။' 
      };
    }
    
    if (response.status === 429) {
      return { 
        error: 'Rate limit exceeded', 
        errorMy: 'Limited ပြည့်ပါပြီ။ နောက်ရက်မှ ပြန်ကြိုးစားပါ။' 
      };
    }

    if (response.status === 503) {
      return { 
        error: 'Service unavailable', 
        errorMy: 'ဝန်ဆောည်က မရှိပါ။ နောက်မှ ပြန်ကြိုးစားပါ။' 
      };
    }
    
    if (!response.ok) {
      const errorText = await response.text();
      return { 
        error: `HF API Error: ${response.status}`, 
        errorMy: 'ပုံထုပ်ရာတွင် အမှားဖြစ်ပါ။ နောက်မှ ပြန်ကြိုးစားပါ။' 
      };
    }

    // Check content type
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('image')) {
      const errorText = await response.text();
      return { 
        error: `Expected image but got: ${errorText.slice(0, 100)}`, 
        errorMy: 'ပုံပါ်လာတာ မဟုတ်ပါ။ နောက်မှ ပြန်ကြိုးစားပါ။' 
      };
    }

    // Convert response to base64 and return as data URL
    const arrayBuffer = await response.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');
    const imageUrl = `data:${contentType};base64,${base64}`;

    return { imageUrl };
  } catch (error) {
    return { 
      error: error instanceof Error ? error.message : 'Unknown error', 
      errorMy: 'ပုံထုပ်ရာတွင် အမှားဖြစ်ပါ။ နောက်မှ ပြန်ကြိုးစားပါ။' 
    };
  }
}

// Fallback model if primary fails
async function generateWithFallback(prompt: string, apiKey: string): Promise<HuggingFaceResponse> {
  const fallbackModels = [
    'https://api-inference.huggingface.co/models/StrayBrooklyn/stable-diffusion-1.5-emoji',
    'https://api-inference.huggingface.co/models/gsdx/Dreamshaper-8',
  ];
  
  for (const modelUrl of fallbackModels) {
    try {
      const response = await fetch(modelUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            negative_prompt: 'blurry, low quality, distorted, deformed',
            guidance_scale: 7.5,
            num_inference_steps: 25,
          },
        }),
      });

      if (response.ok) {
        const contentType = response.headers.get('content-type') || 'image/png';
        const arrayBuffer = await response.arrayBuffer();
        const base64 = Buffer.from(arrayBuffer).toString('base64');
        return { imageUrl: `data:${contentType};base64,${base64}` };
      }
    } catch {
      continue;
    }
  }
  
  return { 
    error: 'All image models unavailable', 
    errorMy: 'ပုံထုပ်ဖို့ ဆာဗာ မရှိပါ။ နောက်ရက်မှ ပြန်ကြိုးစားပါ။' 
  };
}

// Check if HF API is configured
export function isHFConfigured(): boolean {
  return !!process.env.HUGGINGFACE_API_KEY;
}
