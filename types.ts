export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  isStreaming?: boolean;
}

export interface ChatSession {
  id: string;
  title: string;
  date: string;
  preview: string;
}

export enum ModelType {
  FAST = 'gemini-2.5-flash',
  PRO = 'gemini-3-pro-preview',
}

export interface UserProfile {
  name: string;
  credits: number;
  avatarUrl?: string;
}