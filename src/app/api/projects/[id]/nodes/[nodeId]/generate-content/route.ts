import { NextRequest } from 'next/server';
import { withErrorHandling } from '../../../../../middleware';
import { formatSuccessResponse } from '../../../../../_lib/responses/formatResponse';
import { ApiError } from '../../../../../_lib/errors/ApiError';
import { getRepositories } from '../../../../../../../services/prisma/repositories';
import { NodeStatus, Node as PrismaNode } from '@prisma/client';
import { Node } from '../../../../../../../types/project';
import { validateNodeContext, validateProjectMetadata } from '../../../../../_lib/validation/serviceValidation';

// Prisma Node型をカスタムNode型に変換する関数
function convertPrismaNodeToNode(prismaNode: PrismaNode): Node {
  return {
    id: prismaNode.id,
    title: prismaNode.title,
    type: prismaNode.type,
    description: prismaNode.description || '',
    purpose: prismaNode.purpose || '',
    content: prismaNode.content || undefined,
    status: prismaNode.status,
    should_split: prismaNode.should_split,
    n_pages: prismaNode.n_pages,
    order: prismaNode.order,
    parentId: prismaNode.parentId,
  };
}

// コンテンツ生成ハンドラー
async function handleGenerateContent(
  request: NextRequest,
  context: { params: Promise<{ id: string; nodeId: string }> }
) {
  // パラメータの検証と必要なコンテキストの取得
  const params = await context.params;
  const { project, node, editorService } = await validateNodeContext(params.id, params.nodeId);
  
  if (!node) {
    throw ApiError.notFound('Node not found');
  }

  const { nodeRepository } = getRepositories();

  try {
    // プロジェクトのメタデータを検証
    const { targetAudience } = validateProjectMetadata(project);

    // Prisma Node型をカスタムNode型に変換
    const convertedNode = convertPrismaNodeToNode(node);

    // AIを使用してコンテンツを生成
    const generatedContent = await editorService.generateSectionContent(
      project.name,
      targetAudience,
      convertedNode,
      null, // 前のノード（現在は未実装）
      null  // 次のノード（現在は未実装）
    );

    // 生成されたコンテンツでノードを更新
    const updatedNode = await nodeRepository.updateContent(node.id, {
      content: generatedContent,
      status: NodeStatus.in_progress
    });

    return formatSuccessResponse(updatedNode);
  } catch (error) {
    console.error('Content generation error:', error);
    throw ApiError.internal('Failed to generate content', { 
      error: error instanceof Error ? error.message : String(error) 
    });
  }
}

// エンドポイントハンドラー
export const POST = withErrorHandling(handleGenerateContent);