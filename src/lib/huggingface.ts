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
  
}

export async function generateImage(prompt: string, options: ImageGenerationOptions = {}): Promise<HuggingFaceResponse> {
  const apiKey = process.env.HUGGINGFACE_API_KEY;
  
  if (!apiKey) {
    return { 
      error: 'HUGGINGFACE_API_KEY not configured'
    };
  }

  const { width = 512, height = 512, seed } = options;

  try {
    // Build the request body with optimized parameters for speed
    const requestBody: Record<string, unknown> = {
      inputs: prompt,
    };

    // Add parameters optimized for faster generation
    requestBody.parameters = {
      width,
      height,
      guidance_scale: 3.5,  // Lower for faster generation
      num_inference_steps: 4, // Fewer steps = much faster
      ...(seed ? { seed } : {}),
    };

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
        error: 'Model deprecated - trying fallback'
      };
    }
    
    if (response.status === 429) {
      return { 
        error: 'Rate limit exceeded'
      };
    }

    if (response.status === 503) {
      return { 
        error: 'Service unavailable'
      };
    }
    
    if (!response.ok) {
      const errorText = await response.text();
      return { 
        error: `HF API Error: ${response.status}`
      };
    }

    // Check content type
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('image')) {
      const errorText = await response.text();
      return { 
        error: `Expected image but got: ${errorText.slice(0, 100)}`
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
  };
}

// Check if HF API is configured
export function isHFConfigured(): boolean {
  return !!process.env.HUGGINGFACE_API_KEY;
}
