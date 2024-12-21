import { ErrorCode, ErrorServiceOptions } from '@app/api/_lib/types/errors';

// Re-export ErrorCode for backward compatibility
export { ErrorCode };

export class ErrorService extends Error {
  readonly code: ErrorCode;
  readonly status: number;
  readonly details?: Record<string, unknown>;

  constructor(options: ErrorServiceOptions) {
    super(options.message);
    this.name = 'ErrorService';
    this.code = options.code;
    this.status = options.status;
    this.details = options.details;
  }

  static isErrorService(error: unknown): error is ErrorService {
    return error instanceof ErrorService;
  }

  static badRequest(message: string, details?: Record<string, unknown>): ErrorService {
    return new ErrorService({
      message,
      code: ErrorCode.BAD_REQUEST,
      status: 400,
      details
    });
  }

  static unauthorized(message: string, details?: Record<string, unknown>): ErrorService {
    return new ErrorService({
      message,
      code: ErrorCode.UNAUTHORIZED,
      status: 401,
      details
    });
  }

  static forbidden(message: string, details?: Record<string, unknown>): ErrorService {
    return new ErrorService({
      message,
      code: ErrorCode.FORBIDDEN,
      status: 403,
      details
    });
  }

  static notFound(message: string, details?: Record<string, unknown>): ErrorService {
    return new ErrorService({
      message,
      code: ErrorCode.NOT_FOUND,
      status: 404,
      details
    });
  }

  static internal(message: string, details?: Record<string, unknown>): ErrorService {
    return new ErrorService({
      message,
      code: ErrorCode.INTERNAL_ERROR,
      status: 500,
      details
    });
  }
}