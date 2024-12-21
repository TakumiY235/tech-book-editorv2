import { withErrorHandling } from '../../../../middleware';
import { handleUpdateNode, handleDeleteNode } from '../../../../_lib/handlers/nodeHandlers';

// エンドポイントハンドラー
export const PUT = withErrorHandling(handleUpdateNode);
export const DELETE = withErrorHandling(handleDeleteNode);