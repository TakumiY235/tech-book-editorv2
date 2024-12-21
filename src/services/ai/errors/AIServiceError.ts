import { AIErrorCode } from '../types';

export class AIServiceError extends Error {
  constructor(
    message: string,
    public readonly code: AIErrorCode,
    public readonly context?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'AIServiceError';
    Object.setPrototypeOf(this, AIServiceError.prototype);
  }

  static validation(message: string, context?: Record<string, unknown>): AIServiceError {
    return new AIServiceError(message, AIErrorCode.VALIDATION_ERROR, context);
  }

  static parsing(message: string, context?: Record<string, unknown>): AIServiceError {
    return new AIServiceError(message, AIErrorCode.PARSING_ERROR, context);
  }

  static api(message: string, context?: Record<string, unknown>): AIServiceError {
    return new AIServiceError(message, AIErrorCode.API_ERROR, context);
  }

  static rateLimit(context?: Record<string, unknown>): AIServiceError {
    return new AIServiceError(
      'AI service rate limit exceeded. Please try again later.',
      AIErrorCode.RATE_LIMIT_ERROR,
      context
    );
  }

  static authentication(context?: Record<string, unknown>): AIServiceError {
    return new AIServiceError(
      'Invalid API key configuration',
      AIErrorCode.AUTHENTICATION_ERROR,
      context
    );
  }

  static generation(message: string, context?: Record<string, unknown>): AIServiceError {
    return new AIServiceError(message, AIErrorCode.GENERATION_ERROR, context);
  }

  static unknown(error: unknown, context?: Record<string, unknown>): AIServiceError {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return new AIServiceError(message, AIErrorCode.UNKNOWN_ERROR, context);
  }

  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      context: this.context
    };
  }
}