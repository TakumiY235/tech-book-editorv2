import { NextRequest } from 'next/server';
import { withErrorHandling } from '../../../../../middleware';
import { formatSuccessResponse } from '../../../../../_lib/responses/formatResponse';
import { ApiError } from '../../../../../_lib/errors/ApiError';
import { getRepositories } from '../../../../../../../services/prisma/repositories';
import { NodeType, Node as PrismaNode } from '@prisma/client';
import { Node, OrganizedNode, NodeCreateInput } from '../../../../../../../types/project';
import { validateNodeContext } from '../../../../../_lib/validation/serviceValidation';
import { NodeRepository } from '../../../../../../../services/prisma/repositories/NodeRepository';

// Prisma Node型をカスタムNode型に変換する関数
function convertPrismaNodeToNode(prismaNode: PrismaNode): OrganizedNode {
  const node: Node = {
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

  return {
    ...node,
    children: [],
  };
}

// サブセクション生成ハンドラー
const handleGenerateSubsections = async (
  request: NextRequest,
  context: { params: Promise<{ id: string; nodeId: string }> }
) => {
  // パラメータの検証と必要なコンテキストの取得
  const params = await context.params;
  const { project, node, editorService } = await validateNodeContext(params.id, params.nodeId);

  if (!node) {
    throw ApiError.notFound('Node not found');
  }

  const { nodeRepository } = getRepositories();

  try {
    // 親ノードの階層構造を取得
    const parentNodes = await getParentHierarchy(nodeRepository, node);
    
    // 同階層のノードを取得
    const siblings = await nodeRepository.findMany({
      where: {
        projectId: project.id,
        parentId: node.parentId,
      },
      orderBy: {
        order: 'asc',
      },
    });

    // Prisma Node型をカスタムNode型に変換
    const convertedNode = convertPrismaNodeToNode(node);
    const convertedParentNodes = parentNodes.map(convertPrismaNodeToNode);
    const convertedSiblings = siblings.map(convertPrismaNodeToNode);

    // AIを使用してサブセクションを生成
    const subsections = await editorService.generateNodeSubsections(
      convertedNode,
      convertedParentNodes,
      convertedSiblings
    );

    // 生成されたサブセクションを保存
    const createdNodes = await Promise.all(
      subsections.map((subsection: OrganizedNode, index: number) => {
        const nodeInput: NodeCreateInput = {
          projectId: params.id,
          parentId: node.id,
          type: NodeType.subsection,
          title: subsection.title,
          description: subsection.description,
          purpose: subsection.purpose,
          order: index,
        };
        
        if (typeof subsection.n_pages === 'number') {
          nodeInput.n_pages = subsection.n_pages;
        }
        
        if (typeof subsection.should_split === 'boolean') {
          nodeInput.should_split = subsection.should_split;
        }
        
        return nodeRepository.createNode(nodeInput);
      })
    );

    return formatSuccessResponse({
      subsections: createdNodes
    });
  } catch (error) {
    throw ApiError.internal('Failed to generate subsections');
  }
};

// 親ノードの階層構造を再帰的に取得する補助関数
async function getParentHierarchy(nodeRepository: NodeRepository, node: PrismaNode) {
  const parents: PrismaNode[] = [];
  let currentNode = node;

  while (currentNode.parentId) {
    const parent = await nodeRepository.findById(currentNode.parentId);
    if (!parent) break;
    parents.unshift(parent);
    currentNode = parent;
  }

  return parents;
}

// エンドポイントハンドラー
export const POST = withErrorHandling(handleGenerateSubsections);