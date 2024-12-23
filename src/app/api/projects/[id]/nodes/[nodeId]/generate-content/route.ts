import { NextRequest } from 'next/server';
import { db } from '../../../../../../../services/prisma/clients';
import { Node as PrismaNode, NodeStatus } from '@prisma/client';
import { validateNodeContext, validateProjectMetadata } from '../../../../../_lib/validation/serviceValidation';
import { formatSuccessResponse } from '../../../../../_lib/responses/formatResponse';
import { ApiError } from '../../../../../_lib/errors/ApiError';
import { Node } from '../../../../../../../types/project';

function convertToNode(prismaNode: PrismaNode | null): Node | null {
  if (!prismaNode) return null;
  
  const nodeMetadata = prismaNode.metadata ? (prismaNode.metadata as Record<string, unknown>) : {};
  const n_pages = typeof nodeMetadata.n_pages === 'number' ? nodeMetadata.n_pages : 1;

  return {
    id: prismaNode.id,
    projectId: prismaNode.projectId,
    parentId: prismaNode.parentId,
    type: prismaNode.type,
    title: prismaNode.title,
    description: prismaNode.description || '',
    purpose: prismaNode.purpose || '',
    content: prismaNode.content || '',
    status: prismaNode.status,
    order: prismaNode.order,
    metadata: nodeMetadata,
    n_pages,
    should_split: false,
    createdAt: prismaNode.createdAt,
    updatedAt: prismaNode.updatedAt,
    createdBy: prismaNode.createdBy || undefined,
    lastEditedBy: prismaNode.lastEditedBy || undefined
  };
}

export async function POST(
  request: NextRequest,
  context: { params: { id: string; nodeId: string } }
) {
  try {
    const { projectId, nodeId, project, node, editorService } = await validateNodeContext(
      context.params.id,
      context.params.nodeId
    );

    if (!node) {
      throw ApiError.notFound('Node not found');
    }

    // プロジェクトのメタデータを取得
    const metadata = validateProjectMetadata(project);

    // 前後のノードを取得
    const siblings = await db.node.findChildren(node.parentId || null);
    const currentIndex = siblings.findIndex((s: { id: string }) => s.id === node.id);
    const previousNode = currentIndex > 0 ? convertToNode(siblings[currentIndex - 1]) : null;
    const nextNode = currentIndex < siblings.length - 1 ? convertToNode(siblings[currentIndex + 1]) : null;

    // 現在のノードをNode型に変換
    const nodeForGeneration = convertToNode(node);
    if (!nodeForGeneration) {
      throw ApiError.internal('Failed to convert node');
    }

    // コンテンツを生成
    const generatedContent = await editorService.generateSectionContent(
      metadata.title,
      metadata.targetAudience,
      nodeForGeneration,
      previousNode,
      nextNode
    );

    // 生成されたコンテンツでノードを更新
    const updatedNode = await db.node.updateContent(node.id, {
      content: generatedContent,
      status: NodeStatus.draft
    });

    return formatSuccessResponse(updatedNode);
  } catch (error) {
    console.error('Error generating content:', error);
    if (error instanceof ApiError) {
      throw error;
    }
    throw ApiError.internal('Failed to generate content');
  }
}