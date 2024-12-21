import { NextResponse } from 'next/server';
import { ErrorService } from '@services/errors/ErrorService';
import { ApiResponse, ValidationError } from '../types/responses';
import { ErrorCode } from '../types/errors';

export interface ErrorServiceOptions {
  message: string;
  code: ErrorCode;
  status: number;
  details?: Record<string, unknown>;
}

export interface ErrorDetails {
  name?: string;
  stack?: string;
  [key: string]: unknown;
}

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

  /**
   * エラーレスポンスを生成
   */
  toResponse(): NextResponse<ApiResponse> {
    return NextResponse.json(
      {
        success: false,
        error: {
          message: this.message,
          code: this.code,
          details: this.details,
        },
      },
      { status: this.status }
    );
  }

  /**
   * 成功レスポンスを生成
   */
  static formatSuccess<T>(data: T, status = 200): NextResponse<ApiResponse<T>> {
    return NextResponse.json(
      {
        success: true,
        data,
      },
      { status }
    );
  }

  /**
   * バリデーションエラーレスポンスを生成
   */
  static validation(errors: Record<string, string[]>): NextResponse<ApiResponse> {
    const validationError: ValidationError = {
      message: 'Validation failed',
      code: ErrorCode.VALIDATION_ERROR,
      details: errors,
    };

    return NextResponse.json(
      {
        success: false,
        error: validationError,
      },
      { status: 400 }
    );
  }

  static badRequest(message: string, details?: Record<string, unknown>): ApiError {
    return new ApiError(400, ErrorCode.BAD_REQUEST, message, details);
  }

  static unauthorized(message: string, details?: Record<string, unknown>): ApiError {
    return new ApiError(401, ErrorCode.UNAUTHORIZED, message, details);
  }

  static forbidden(message: string, details?: Record<string, unknown>): ApiError {
    return new ApiError(403, ErrorCode.FORBIDDEN, message, details);
  }

  static notFound(message: string, details?: Record<string, unknown>): ApiError {
    return new ApiError(404, ErrorCode.NOT_FOUND, message, details);
  }

  static internal(message: string, details?: Record<string, unknown>): ApiError {
    return new ApiError(500, ErrorCode.INTERNAL_ERROR, message, details);
  }

  static fromError(error: Error | unknown): ApiError {
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