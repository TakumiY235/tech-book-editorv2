import { NodeType } from '../../../types/project';

// Base node interface
export interface BaseNode {
  id: string;
  title: string;
  description: string;
  purpose: string;
  type: NodeType;
  order: number;
  parentId: string | null;
}

// Extended node interface for chapters
export interface ChapterNode extends BaseNode {
  n_pages: number;
  should_split: boolean;
}

// API response wrapper
export interface AIResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    context?: Record<string, unknown>;
  };
}

// Error codes
export enum AIErrorCode {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  PARSING_ERROR = 'PARSING_ERROR',
  API_ERROR = 'API_ERROR',
  RATE_LIMIT_ERROR = 'RATE_LIMIT_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  GENERATION_ERROR = 'GENERATION_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

// Anthropic specific types
export interface AnthropicTextResponse {
  content: Array<{ type: string; text: string }>;
}

// Configuration interface
export interface AIServiceConfig {
  model: string;
  maxTokens: number;
  temperature: number;
}