import type { NextRequest } from 'next/server';
import { db } from '../../../../../../../services/prisma/clients';
import { NodeType, Node as PrismaNode } from '@prisma/client';
import { validateNodeContext } from '../../../../../_lib/validation/serviceValidation';
import { formatSuccessResponse } from '../../../../../_lib/responses/formatResponse';
import { ApiError } from '../../../../../_lib/errors/ApiError';
import { AIEditorService } from '../../../../../../../services/ai/AIGeneration';
import { OrganizedNode } from '../../../../../../../types/project';

// PrismaNodeをOrganizedNodeに変換するヘルパー関数
function toOrganizedNode(prismaNode: PrismaNode): OrganizedNode {
  return {
    id: prismaNode.id,
    title: prismaNode.title,
    content: prismaNode.content || undefined,
    description: prismaNode.description || undefined,
    purpose: prismaNode.purpose || undefined,
    type: prismaNode.type,
    status: prismaNode.status,
    order: prismaNode.order,
    n_pages: prismaNode.n_pages,
    should_split: prismaNode.should_split,
    projectId: prismaNode.projectId,
    parentId: prismaNode.parentId,
    children: [],
    metadata: prismaNode.metadata as Record<string, unknown>,
    createdBy: prismaNode.createdBy || undefined,
    lastEditedBy: prismaNode.lastEditedBy || undefined,
    createdAt: prismaNode.createdAt,
    updatedAt: prismaNode.updatedAt
  };
}

export async function POST(
  request: NextRequest,
  context: { params: { id: string; nodeId: string } }
) {
  try {
    const { projectId, nodeId, node } = await validateNodeContext(
      context.params.id,
      context.params.nodeId
    );

    if (!node) {
      throw ApiError.notFound('Node not found');
    }

    // 親ノードの階層構造を取得
    const parentNodes = await getParentHierarchy(node);

    // 同階層のノードを取得
    const siblings = await db.node.findChildren(node.parentId || null);

    // AIを使用してサブセクションを生成
    const aiService = new AIEditorService(process.env.ANTHROPIC_API_KEY || '');
    const organizedNode = toOrganizedNode(node);
    const organizedParentNodes = parentNodes.map(toOrganizedNode);
    const organizedSiblings = siblings.map(toOrganizedNode);

    const subsections = await aiService.nodeSplitting.generateSubsections(
      organizedNode,
      organizedParentNodes,
      organizedSiblings
    );

    // 生成された各サブセクションをデータベースに保存
    const subsectionPromises = subsections.map((subsection, index) => {
      const nodeInput = {
        projectId,
        parentId: node.id,
        type: NodeType.section,
        title: subsection.title,
        description: subsection.description || '',
        purpose: subsection.purpose,
        order: index,
        n_pages: subsection.n_pages || 0,
        should_split: false,
        metadata: {},
        status: 'draft'
      };

      return db.node.create(nodeInput);
    });

    const createdNodes = await Promise.all(subsectionPromises);
    return formatSuccessResponse({ subsections: createdNodes });
  } catch (error) {
    console.error('Error generating subsections:', error);
    if (error instanceof ApiError) {
      throw error;
    }
    throw ApiError.internal('Failed to generate subsections');
  }
}

// 親ノードの階層構造を再帰的に取得する補助関数
async function getParentHierarchy(node: PrismaNode) {
  const parents: PrismaNode[] = [];
  let currentNode = node;

  while (currentNode.parentId) {
    const parent = await db.node.findById(currentNode.parentId);
    if (!parent) break;
    parents.unshift(parent);
    currentNode = parent;
  }

  return parents;
}