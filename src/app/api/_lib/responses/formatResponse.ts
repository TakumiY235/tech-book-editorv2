import { ApiError } from '../errors/ApiError';
import { ErrorService } from '../../../../services/errors/ErrorService';

/**
 * 成功レスポンスを生成
 * @deprecated Use ApiError.formatSuccess instead
 */
export function formatSuccessResponse(data: any, status = 200) {
  return ApiError.formatSuccess(data, status);
}

/**
 * エラーレスポンスを生成
 * @deprecated Use error.toResponse() or ApiError static methods instead
 */
export function formatErrorResponse(error: Error | ErrorService) {
  if (error instanceof ApiError) {
    return error.toResponse();
  }
  return ApiError.fromError(error).toResponse();
}

/**
 * バリデーションエラーレスポンスを生成
 * @deprecated Use ApiError.validation instead
 */
export function formatValidationErrorResponse(errors: Record<string, string[]>) {
  return ApiError.validation(errors);
}