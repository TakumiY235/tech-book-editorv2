import { NextRequest } from 'next/server';
import { withErrorHandling } from '../../../../../middleware';
import { formatSuccessResponse } from '../../../../../_lib/responses/formatResponse';
import { ApiError } from '../../../../../_lib/errors/ApiError';
import { getRepositories } from '../../../../../../../services/prisma/repositories';
import { NodeType, Node } from '@prisma/client';
import { ChapterStructure } from '../../../../../../../types/project';
import { validateNodeContext } from '../../../../../_lib/validation/serviceValidation';
import { NodeRepository } from '../../../../../../../services/prisma/repositories/NodeRepository';

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
        projectId: params.id,
        parentId: node.parentId,
      },
      orderBy: {
        order: 'asc',
      },
    });

    // ChapterStructure型に変換
    const parentChapterStructure: ChapterStructure = {
      id: node.id,
      title: node.title,
      type: node.type,
      description: node.description || '',
      purpose: node.purpose || '',
      content: node.content || '',
      should_split: node.should_split,
      n_pages: node.n_pages,
      order: node.order,
      parentId: node.parentId,
    };

    const parentChapters = parentNodes.map((node: Node) => ({
      id: node.id,
      title: node.title,
      type: node.type,
      description: node.description || '',
      purpose: node.purpose || '',
      content: node.content || '',
      should_split: node.should_split,
      n_pages: node.n_pages,
      order: node.order,
      parentId: node.parentId,
    }));

    const siblingChapters = siblings.map((node: Node) => ({
      id: node.id,
      title: node.title,
      type: node.type,
      description: node.description || '',
      purpose: node.purpose || '',
      content: node.content || '',
      should_split: node.should_split,
      n_pages: node.n_pages,
      order: node.order,
      parentId: node.parentId,
    }));

    // AIを使用してサブセクションを生成
    const subsections = await editorService.generateNodeSubsections(
      parentChapterStructure,
      parentChapters,
      siblingChapters
    );

    // 生成されたサブセクションを保存
    const createdNodes = await Promise.all(
      subsections.map((subsection: { title: string; description: string; purpose: string }, index: number) =>
        nodeRepository.createNode({
          projectId: params.id,
          parentId: node.id,
          type: NodeType.subsection,
          title: subsection.title,
          description: subsection.description,
          purpose: subsection.purpose,
          order: index,
        })
      )
    );

    return formatSuccessResponse({
      subsections: createdNodes
    });
  } catch (error) {
    throw ApiError.internal('Failed to generate subsections');
  }
};

// 親ノードの階層構造を再帰的に取得する補助関数
async function getParentHierarchy(nodeRepository: NodeRepository, node: Node) {
  const parents: Node[] = [];
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