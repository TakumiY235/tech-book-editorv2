import { NextRequest } from 'next/server';
import { withErrorHandling } from '../../../../../middleware';
import { formatSuccessResponse } from '../../../../../_lib/responses/formatResponse';
import { ApiError } from '../../../../../_lib/errors/ApiError';
import { getRepositories } from '../../../../../../../services/prisma/repositories';
import { NodeType } from '@prisma/client';
import { AIServiceFactory } from '../../../../../../../services/ai/factory/AIServiceFactory';
import { BookMetadata } from '../../../../../../../types/project';

interface RouteParams {
  id: string;
}

// 構造生成ハンドラー
const handleGenerateStructure = async (
  request: NextRequest,
  { params }: { params: RouteParams }
) => {
  const { projectRepository, nodeRepository } = getRepositories();
  const editorService = AIServiceFactory.create('anthropic', {
    apiKey: process.env.ANTHROPIC_API_KEY || '',
  });

  // プロジェクトの存在確認
  const project = await projectRepository.findById(params.id);
  if (!project) {
    throw ApiError.notFound('Project not found');
  }

  try {
    // プロジェクトのメタデータを取得
    const metadata = project.metadata as Record<string, any>;
    const bookMetadata: BookMetadata = {
      title: project.name,
      overview: metadata?.overview || '',
      targetAudience: metadata?.targetAudience || 'general',
      pageCount: metadata?.pageCount || 200,
    };

    // AIを使用して章構造を生成
    const chapterStructures = await editorService.generateChapterStructure(bookMetadata);

    // 既存のノードを削除（新しい構造を生成するため）
    const existingNodes = await nodeRepository.findByProjectId(params.id);
    for (const node of existingNodes) {
      if (!node.parentId) { // ルートノードのみを削除（子ノードは CASCADE で削除される）
        await nodeRepository.delete(node.id);
      }
    }

    // 生成された構造からノードを作成
    const createdNodes = await createNodesFromStructure(
      params.id,
      nodeRepository,
      chapterStructures
    );

    return formatSuccessResponse(createdNodes);
  } catch (error) {
    throw ApiError.internal('Failed to generate project structure');
  }
};

// 構造からノードを再帰的に作成する補助関数
async function createNodesFromStructure(
  projectId: string,
  nodeRepository: any,
  structures: any[],
  parentId: string | null = null
): Promise<any[]> {
  const nodes = [];
  let order = 0;

  for (const structure of structures) {
    const node = await nodeRepository.createNode({
      projectId,
      parentId,
      type: structure.type as NodeType,
      title: structure.title,
      description: structure.description,
      purpose: structure.purpose,
      order: order++,
      n_pages: structure.n_pages,
      should_split: structure.should_split,
    });

    nodes.push(node);

    // 子ノードがある場合は再帰的に作成
    if (structure.children?.length > 0) {
      const childNodes = await createNodesFromStructure(
        projectId,
        nodeRepository,
        structure.children,
        node.id
      );
      nodes.push(...childNodes);
    }
  }

  return nodes;
}

// エンドポイントハンドラー
export const POST = withErrorHandling(handleGenerateStructure);