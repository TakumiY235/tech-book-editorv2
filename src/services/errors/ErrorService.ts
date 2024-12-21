export enum ErrorCode {
  BAD_REQUEST = 'BAD_REQUEST',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  AI_SERVICE_ERROR = 'AI_SERVICE_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  RATE_LIMIT_ERROR = 'RATE_LIMIT_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  PARSING_ERROR = 'PARSING_ERROR',
  GENERATION_ERROR = 'GENERATION_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

export interface ErrorContext {
  code: ErrorCode;
  message: string;
  status: number;
  details?: Record<string, unknown>;
}

export class ErrorService extends Error {
  readonly code: ErrorCode;
  readonly status: number;
  readonly details?: Record<string, unknown>;

  constructor(context: ErrorContext) {
    super(context.message);
    this.name = this.constructor.name;
    this.code = context.code;
    this.status = context.status;
    this.details = context.details;
    Object.setPrototypeOf(this, new.target.prototype);
  }

  static badRequest(message: string, details?: Record<string, unknown>): ErrorService {
    return new ErrorService({
      code: ErrorCode.BAD_REQUEST,
      message,
      status: 400,
      details
    });
  }

  static unauthorized(message: string, details?: Record<string, unknown>): ErrorService {
    return new ErrorService({
      code: ErrorCode.UNAUTHORIZED,
      message,
      status: 401,
      details
    });
  }

  static forbidden(message: string, details?: Record<string, unknown>): ErrorService {
    return new ErrorService({
      code: ErrorCode.FORBIDDEN,
      message,
      status: 403,
      details
    });
  }

  static notFound(message: string, details?: Record<string, unknown>): ErrorService {
    return new ErrorService({
      code: ErrorCode.NOT_FOUND,
      message,
      status: 404,
      details
    });
  }

  static conflict(message: string, details?: Record<string, unknown>): ErrorService {
    return new ErrorService({
      code: ErrorCode.CONFLICT,
      message,
      status: 409,
      details
    });
  }

  static internal(message: string, details?: Record<string, unknown>): ErrorService {
    return new ErrorService({
      code: ErrorCode.INTERNAL_ERROR,
      message,
      status: 500,
      details
    });
  }

  static validation(message: string, details?: Record<string, unknown>): ErrorService {
    return new ErrorService({
      code: ErrorCode.VALIDATION_ERROR,
      message,
      status: 422,
      details
    });
  }

  static aiService(message: string, details?: Record<string, unknown>): ErrorService {
    return new ErrorService({
      code: ErrorCode.AI_SERVICE_ERROR,
      message,
      status: 502,
      details
    });
  }

  static database(message: string, details?: Record<string, unknown>): ErrorService {
    return new ErrorService({
      code: ErrorCode.DATABASE_ERROR,
      message,
      status: 503,
      details
    });
  }

  static rateLimit(message: string = 'Rate limit exceeded', details?: Record<string, unknown>): ErrorService {
    return new ErrorService({
      code: ErrorCode.RATE_LIMIT_ERROR,
      message,
      status: 429,
      details
    });
  }

  static authentication(message: string = 'Authentication failed', details?: Record<string, unknown>): ErrorService {
    return new ErrorService({
      code: ErrorCode.AUTHENTICATION_ERROR,
      message,
      status: 401,
      details
    });
  }

  toJSON(): ErrorContext {
    return {
      code: this.code,
      message: this.message,
      status: this.status,
      details: this.details
    };
  }

  static isErrorService(error: unknown): error is ErrorService {
    return error instanceof ErrorService;
  }

  static fromError(error: Error | unknown): ErrorService {
    if (ErrorService.isErrorService(error)) {
      return error;
    }

    if (error instanceof Error) {
      return ErrorService.internal(error.message, {
        name: error.name,
        stack: error.stack
      });
    }

    return ErrorService.internal('An unknown error occurred');
  }
}