import { NextRequest } from 'next/server';
import { withErrorHandling } from '../../../../../middleware';
import { formatSuccessResponse } from '../../../../../_lib/responses/formatResponse';
import { ApiError } from '../../../../../_lib/errors/ApiError';
import { getRepositories } from '../../../../../../../services/prisma/repositories';
import { NodeType, NodeStatus } from '@prisma/client';
import { AIEditorService } from '../../../../../../../services/ai/base/editorService';
import { ChapterStructure } from '../../../../../../../types/project';

interface RouteParams {
  id: string;
  nodeId: string;
}

// サブセクション生成ハンドラー
const handleGenerateSubsections = async (
  request: NextRequest,
  { params }: { params: RouteParams }
) => {
  const { projectRepository, nodeRepository } = getRepositories();
  const editorService = new AIEditorService(process.env.ANTHROPIC_API_KEY || '');

  // プロジェクトの存在確認
  const project = await projectRepository.findById(params.id);
  if (!project) {
    throw ApiError.notFound('Project not found');
  }

  // 親ノードの存在確認とプロジェクトへの所属確認
  const parentNode = await nodeRepository.findByIdWithChildren(params.nodeId);
  if (!parentNode) {
    throw ApiError.notFound('Parent node not found');
  }
  if (parentNode.projectId !== params.id) {
    throw ApiError.badRequest('Node does not belong to this project');
  }

  try {
    // 親ノードの階層構造を取得
    const parentNodes = await getParentHierarchy(nodeRepository, parentNode);
    
    // 同階層のノードを取得
    const siblings = await nodeRepository.findMany({
      where: {
        projectId: params.id,
        parentId: parentNode.parentId,
      },
      orderBy: {
        order: 'asc',
      },
    });

    // ChapterStructure型に変換
    const parentChapterStructure: ChapterStructure = {
      id: parentNode.id,
      title: parentNode.title,
      type: parentNode.type,
      description: parentNode.description || '',
      purpose: parentNode.purpose || '',
      content: parentNode.content || '',
      should_split: parentNode.should_split,
      n_pages: parentNode.n_pages,
      order: parentNode.order,
      parentId: parentNode.parentId,
    };

    const parentChapters = parentNodes.map(node => ({
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

    const siblingChapters = siblings.map(node => ({
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
      subsections.map((subsection, index) =>
        nodeRepository.createNode({
          projectId: params.id,
          parentId: params.nodeId,
          type: NodeType.subsection,
          title: subsection.title,
          description: subsection.description,
          purpose: subsection.purpose,
          order: index,
        })
      )
    );

    return formatSuccessResponse(createdNodes);
  } catch (error) {
    throw ApiError.internal('Failed to generate subsections');
  }
};

// 親ノードの階層構造を再帰的に取得する補助関数
async function getParentHierarchy(nodeRepository: any, node: any) {
  const parents: any[] = [];
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