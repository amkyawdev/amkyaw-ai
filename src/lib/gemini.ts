import { GoogleGenerativeAI } from '@google/generative-ai';

let genAI: GoogleGenerativeAI | null = null;

function getGenAI(): GoogleGenerativeAI {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is not set');
    }
    genAI = new GoogleGenerativeAI(apiKey);
  }
  return genAI;
}

export async function getGeminiResponse(prompt: string): Promise<string> {
  const ai = getGenAI();
  // Use v1 API instead of v1beta
  const model = ai.getGenerativeModel({ 
    model: 'gemini-1.5-flash-8b',
  }, {
    apiVersion: 'v1',
  });
  
  const result = await model.generateContent(prompt);
  const response = result.response;
  
  return response.text();
}