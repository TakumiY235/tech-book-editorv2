import { ErrorCode } from './errors';

export interface ApiSuccessResponse<T = any> {
  success: true;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    message: string;
    code: ErrorCode;
    details?: Record<string, unknown>;
  };
}

export type ApiResponse<T = any> = ApiSuccessResponse<T> | ApiErrorResponse;

export interface ValidationError {
  message: string;
  code: ErrorCode.VALIDATION_ERROR;
  details: Record<string, string[]>;
}

export interface ApiResponseOptions {
  status?: number;
  headers?: Record<string, string>;
}