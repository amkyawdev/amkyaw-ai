import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error('GEMINI_API_KEY environment variable is not set');
}

export const genAI = new GoogleGenerativeAI(apiKey);

export async function getGeminiResponse(prompt: string): Promise<string> {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  
  const result = await model.generateContent(prompt);
  const response = result.response;
  
  return response.text();
}