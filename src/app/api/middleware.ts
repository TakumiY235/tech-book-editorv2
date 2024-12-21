import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { formatErrorResponse } from './_lib/responses/formatResponse';
import { ApiError } from './_lib/errors/ApiError';

type ApiHandler = (request: NextRequest, ...args: any[]) => Promise<NextResponse>;
type ValidationSchema = {
  validate: (data: any) => { success: boolean; error?: any };
};

export async function middleware(request: NextRequest) {
  try {
    // リクエストログ
    console.log(`[API] ${request.method} ${request.url}`);

    // CORSヘッダーの設定
    const response = NextResponse.next();
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set(
      'Access-Control-Allow-Methods',
      'GET, POST, PUT, DELETE, OPTIONS'
    );
    response.headers.set(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization'
    );

    // プリフライトリクエストの処理
    if (request.method === 'OPTIONS') {
      return response;
    }

    // APIキーの検証（必要に応じて）
    const apiKey = request.headers.get('x-api-key');
    if (process.env.REQUIRE_API_KEY === 'true' && !apiKey) {
      throw ApiError.unauthorized('API key is required');
    }

    // レスポンスヘッダーの設定
    response.headers.set('Content-Type', 'application/json');
    response.headers.set('X-Response-Time', Date.now().toString());

    return response;
  } catch (error) {
    console.error('[Middleware Error]', error);
    return formatErrorResponse(error as Error);
  }
}

// ミドルウェアを適用するパスの設定
export const config = {
  matcher: '/api/:path*',
};

// エラーハンドリングミドルウェア
export function withErrorHandling(handler: ApiHandler): ApiHandler {
  return async (request: NextRequest, ...args: any[]) => {
    try {
      const response = await handler(request, ...args);
      return response;
    } catch (error) {
      console.error('[API Error]', error);
      return formatErrorResponse(error as Error);
    }
  };
}

// バリデーションミドルウェア
export function withValidation<T>(
  schema: ValidationSchema,
  handler: (request: NextRequest, validatedData: T, ...args: any[]) => Promise<NextResponse>
): ApiHandler {
  return async (request: NextRequest, ...args: any[]) => {
    try {
      const body = await request.json();
      const validation = schema.validate(body);

      if (!validation.success) {
        throw ApiError.badRequest('Validation failed', {
          code: 'VALIDATION_ERROR',
          error: validation.error
        });
      }

      return handler(request, body as T, ...args);
    } catch (error) {
      console.error('[Validation Error]', error);
      return formatErrorResponse(error as Error);
    }
  };
}

// パフォーマンス計測ミドルウェア
export function withPerformanceLogging(handler: ApiHandler): ApiHandler {
  return async (request: NextRequest, ...args: any[]) => {
    const start = Date.now();
    try {
      const response = await handler(request, ...args);
      const duration = Date.now() - start;
      console.log(`[Performance] ${request.method} ${request.url} - ${duration}ms`);
      return response;
    } catch (error) {
      const duration = Date.now() - start;
      console.error(`[Performance Error] ${request.method} ${request.url} - ${duration}ms`, error);
      throw error;
    }
  };
}