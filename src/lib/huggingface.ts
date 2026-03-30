// HuggingFace API for image generation
const HF_API_URL = 'https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-2-1';

export interface HuggingFaceResponse {
  imageUrl?: string;
  error?: string;
}

export async function generateImage(prompt: string): Promise<HuggingFaceResponse> {
  const apiKey = process.env.HUGGINGFACE_API_KEY;
  
  if (!apiKey) {
    return { error: 'HUGGINGFACE_API_KEY not configured' };
  }

  try {
    const response = await fetch(HF_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          negative_prompt: 'blurry, low quality, distorted',
          guidance_scale: 7.5,
          num_inference_steps: 30,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return { error: `HF API Error: ${response.status}` };
    }

    // Convert response to base64 and return as data URL
    const arrayBuffer = await response.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');
    const contentType = response.headers.get('content-type') || 'image/png';
    const imageUrl = `data:${contentType};base64,${base64}`;

    return { imageUrl };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Check if HF API is configured
export function isHFConfigured(): boolean {
  return !!process.env.HUGGINGFACE_API_KEY;
}
