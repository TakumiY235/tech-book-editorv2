import { NextRequest } from 'next/server';
import { withErrorHandling, withValidation } from '../../../../middleware';
import { formatSuccessResponse } from '../../../../_lib/responses/formatResponse';
import { ApiError } from '../../../../_lib/errors/ApiError';
import { getRepositories } from '../../../../../../services/prisma/repositories';

interface ReorderNodesRequest {
  nodes: Array<{
    id: string;
    order: number;
  }>;
}

const reorderNodesSchema = {
  validate: (data: any) => {
    const errors: Record<string, string[]> = {};

    if (!Array.isArray(data.nodes)) {
      errors.nodes = ['Nodes must be an array'];
      return { success: false, error: errors };
    }

    const invalidNodes = data.nodes.filter(
      (node: any) =>
        typeof node !== 'object' ||
        typeof node.id !== 'string' ||
        typeof node.order !== 'number'
    );

    if (invalidNodes.length > 0) {
      errors.nodes = ['Each node must have an id (string) and order (number)'];
    }

    return {
      success: Object.keys(errors).length === 0,
      error: errors
    };
  }
};

// ノード並び替えハンドラー
const handleReorderNodes = async (
  request: NextRequest,
  validatedData: ReorderNodesRequest,
  { params }: { params: { id: string } }
) => {
  const { projectRepository, nodeRepository } = getRepositories();

  // プロジェクトの存在確認
  const project = await projectRepository.findById(params.id);
  if (!project) {
    throw ApiError.notFound('Project not found');
  }

  // 各ノードの存在確認とプロジェクトへの所属確認
  const nodes = await Promise.all(
    validatedData.nodes.map(node => nodeRepository.findById(node.id))
  );

  const invalidNodes = nodes.filter(
    (node, index) =>
      !node || node.projectId !== params.id
  );

  if (invalidNodes.length > 0) {
    throw ApiError.badRequest('One or more nodes are invalid or do not belong to this project');
  }

  // ノードの並び替えを実行
  await nodeRepository.reorderNodes(validatedData.nodes);

  return formatSuccessResponse({ message: 'Nodes reordered successfully' });
};

// エンドポイントハンドラー
export const PUT = withErrorHandling(
  withValidation<ReorderNodesRequest>(reorderNodesSchema, handleReorderNodes)
);