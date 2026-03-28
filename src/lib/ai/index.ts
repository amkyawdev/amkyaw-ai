import { GoogleGenerativeAI, GenerationConfig } from '@google/generative-ai';

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

// AI Model configurations
export const AI_MODELS = {
  flash: {
    name: 'gemini-1.5-flash',
    displayName: 'Gemini 1.5 Flash',
    description: 'Fast and efficient for most tasks',
    maxTokens: 8192,
  },
  pro: {
    name: 'gemini-1.5-pro',
    displayName: 'Gemini 1.5 Pro',
    description: 'Most capable model for complex tasks',
    maxTokens: 32768,
  },
  flash2: {
    name: 'gemini-2.0-flash',
    displayName: 'Gemini 2.0 Flash',
    description: 'Latest model',
    maxTokens: 8192,
  },
} as const;

export type AIModelType = keyof typeof AI_MODELS;

export interface AIRequest {
  prompt: string;
  model?: AIModelType;
  temperature?: number;
  maxTokens?: number;
  systemInstruction?: string;
}

export interface AIResponse {
  response: string;
  model: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

const defaultGenerationConfig: GenerationConfig = {
  temperature: 0.7,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 4096,
};

export async function getAIResponse(request: AIRequest): Promise<AIResponse> {
  const ai = getGenAI();
  const modelConfig = AI_MODELS[request.model || 'flash'];
  
  const generationConfig: GenerationConfig = {
    ...defaultGenerationConfig,
    temperature: request.temperature ?? 0.7,
    maxOutputTokens: request.maxTokens ?? modelConfig.maxTokens,
  };

  const model = ai.getGenerativeModel({ 
    model: modelConfig.name,
    generationConfig,
    systemInstruction: request.systemInstruction,
  });

  const result = await model.generateContent(request.prompt);
  const response = result.response;
  
  // @ts-expect-error - usageMetadata may not be available in all versions
  const usageMetadata = result.usageMetadata;
  const usage = usageMetadata ? {
    promptTokens: usageMetadata.promptTokenCount || 0,
    completionTokens: usageMetadata.candidatesTokenCount || 0,
    totalTokens: usageMetadata.totalTokenCount || 0,
  } : undefined;

  return {
    response: response.text(),
    model: modelConfig.name,
    usage,
  };
}

// Stream response for real-time output
export async function* streamAIResponse(request: AIRequest): AsyncGenerator<string> {
  const ai = getGenAI();
  const modelConfig = AI_MODELS[request.model || 'flash'];
  
  const generationConfig: GenerationConfig = {
    ...defaultGenerationConfig,
    temperature: request.temperature ?? 0.7,
    maxOutputTokens: request.maxTokens ?? modelConfig.maxTokens,
  };

  const model = ai.getGenerativeModel({ 
    model: modelConfig.name,
    generationConfig,
  });

  const result = await model.generateContentStream(request.prompt);
  
  for await (const chunk of result.stream) {
    const text = chunk.text();
    if (text) {
      yield text;
    }
  }
}

// Chat session management
export interface ChatSession {
  id: string;
  messages: Array<{
    role: 'user' | 'model';
    content: string;
    timestamp: Date;
  }>;
  model: AIModelType;
  createdAt: Date;
  updatedAt: Date;
}

export class ChatManager {
  private sessions: Map<string, ChatSession> = new Map();

  createSession(model: AIModelType = 'flash'): ChatSession {
    const session: ChatSession = {
      id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      messages: [],
      model,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.sessions.set(session.id, session);
    return session;
  }

  getSession(id: string): ChatSession | undefined {
    return this.sessions.get(id);
  }

  addMessage(sessionId: string, role: 'user' | 'model', content: string): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.messages.push({
        role,
        content,
        timestamp: new Date(),
      });
      session.updatedAt = new Date();
    }
  }

  deleteSession(id: string): boolean {
    return this.sessions.delete(id);
  }

  getAllSessions(): ChatSession[] {
    return Array.from(this.sessions.values()).sort(
      (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()
    );
  }
}

export const chatManager = new ChatManager();