export interface User {
  id: string;
  email: string;
  name?: string;
  createdAt: Date;
  isActive: boolean;
}

export interface Chat {
  id: number;
  userId: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  id: number;
  chatId: number;
  role: 'user' | 'assistant';
  content: string;
  createdAt: Date;
}

export interface ChatWithMessages extends Chat {
  messages: Message[];
}

export interface GenerateContentRequest {
  prompt: string;
  chatId?: number;
}

export interface GenerateContentResponse {
  response: string;
  chatId: number;
  messageId: number;
}