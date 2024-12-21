import { ErrorService, ErrorCode } from '@/services/errors/ErrorService';

export class ApiError extends ErrorService {
  constructor(status: number, code: ErrorCode, message: string, details?: Record<string, unknown>) {
    super({
      message,
      code,
      status,
      details
    });
    this.name = 'ApiError';
  }

  static override badRequest(message: string, details?: Record<string, unknown>): ApiError {
    return new ApiError(400, ErrorCode.BAD_REQUEST, message, details);
  }

  static override unauthorized(message: string, details?: Record<string, unknown>): ApiError {
    return new ApiError(401, ErrorCode.UNAUTHORIZED, message, details);
  }

  static override forbidden(message: string, details?: Record<string, unknown>): ApiError {
    return new ApiError(403, ErrorCode.FORBIDDEN, message, details);
  }

  static override notFound(message: string, details?: Record<string, unknown>): ApiError {
    return new ApiError(404, ErrorCode.NOT_FOUND, message, details);
  }

  static override internal(message: string, details?: Record<string, unknown>): ApiError {
    return new ApiError(500, ErrorCode.INTERNAL_ERROR, message, details);
  }

  static override fromError(error: Error | unknown): ApiError {
    if (error instanceof ApiError) {
      return error;
    }

    if (ErrorService.isErrorService(error)) {
      return new ApiError(
        (error as ErrorService).status,
        (error as ErrorService).code,
        (error as ErrorService).message,
        (error as ErrorService).details
      );
    }

    if (error instanceof Error) {
      return ApiError.internal(error.message, {
        name: error.name,
        stack: error.stack
      });
    }

    return ApiError.internal('An unknown error occurred');
  }
}