/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type SubscriptionTier = 'free' | 'basic_pro' | 'pro';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  isImage?: boolean;
  imageUrls?: string[];
  stylingOptions?: {
    style?: string;
    aspectRatio?: string;
    imageSize?: string;
  };
  attachments?: string[]; // Base64 encoded images or attachments
  modelUsed?: string;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  updatedAt: string;
  model: string;
}

export interface SubscriptionStatus {
  tier: SubscriptionTier;
  imageLimit: number;
  imageCount: number;
  stripeCustomerId?: string;
  isActive: boolean;
  cardBrand?: string;
  cardLast4?: string;
  expiresAt?: string;
}

export interface ImageGenerationParams {
  prompt: string;
  style?: string;
  aspectRatio?: string;
  imageSize?: string;
  tier: SubscriptionTier;
}
