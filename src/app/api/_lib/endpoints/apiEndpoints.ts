/**
 * API エンドポイントの定義
 * フロントエンドのAPI_ENDPOINTSと対応する形で、
 * バックエンド側のルーティングパターンを定義
 */
export const API_PATTERNS = {
  // プロジェクト関連
  projects: '/api/projects',
  project: '/api/projects/:id',
  projectImport: '/api/projects/:id/import',

  // ノード関連
  nodes: '/api/projects/:id/nodes',
  node: '/api/projects/:id/nodes/:nodeId',
  nodeReorder: '/api/projects/:id/nodes/reorder',
  nodeGenerateContent: '/api/projects/:id/nodes/:nodeId/generate-content',
  nodeGenerateSubsections: '/api/projects/:id/nodes/:nodeId/generate-subsections',
  nodeGenerateStructure: '/api/projects/:id/nodes/generate-structure',
  nodeRefineStructure: '/api/projects/:id/nodes/refine-structure',
} as const;

/**
 * パスパラメータを置換してエンドポイントを生成
 */
export function replacePathParams(pattern: string, params: Record<string, string>): string {
  return Object.entries(params).reduce(
    (path, [key, value]) => path.replace(`:${key}`, value),
    pattern
  );
}

/**
 * エンドポイントのパターンマッチング
 */
export function matchPathPattern(path: string, pattern: string): Record<string, string> | null {
  const pathParts = path.split('/');
  const patternParts = pattern.split('/');

  if (pathParts.length !== patternParts.length) {
    return null;
  }

  const params: Record<string, string> = {};

  for (let i = 0; i < patternParts.length; i++) {
    if (patternParts[i].startsWith(':')) {
      const paramName = patternParts[i].slice(1);
      params[paramName] = pathParts[i];
    } else if (patternParts[i] !== pathParts[i]) {
      return null;
    }
  }

  return params;
}