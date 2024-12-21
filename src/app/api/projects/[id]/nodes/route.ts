import { withErrorHandling, withValidation } from '../../../middleware';
import { createNodeSchema } from '../../../_lib/validation/schemas';
import { handleCreateNode, handleGetNodes } from '../../../_lib/handlers/nodeHandlers';

// エンドポイントハンドラー
export const POST = withErrorHandling(
  withValidation(createNodeSchema, handleCreateNode)
);

export const GET = withErrorHandling(handleGetNodes);