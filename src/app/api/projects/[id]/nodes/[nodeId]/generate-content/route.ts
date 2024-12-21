import { NextRequest } from 'next/server';
import { withErrorHandling } from '../../../../../middleware';
import { formatSuccessResponse } from '../../../../../_lib/responses/formatResponse';
import { ApiError } from '../../../../../_lib/errors/ApiError';
import { getRepositories } from '../../../../../../../services/prisma/repositories';
import { NodeStatus } from '@prisma/client';
import { AIEditorService } from '../../../../../../../services/ai/base/editorService';
import { ChapterStructure } from '../../../../../../../types/project';

interface RouteParams {
  id: string;
  nodeId: string;
}

// コンテンツ生成ハンドラー
const handleGenerateContent = async (
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

  // ノードの存在確認とプロジェクトへの所属確認
  const node = await nodeRepository.findByIdWithParent(params.nodeId);
  if (!node) {
    throw ApiError.notFound('Node not found');
  }
  if (node.projectId !== params.id) {
    throw ApiError.badRequest('Node does not belong to this project');
  }

  try {
    // プロジェクトのメタデータからターゲットオーディエンスを取得
    const metadata = project.metadata as Record<string, any>;
    const targetAudience = metadata?.targetAudience || 'general';

    // ChapterStructure型に変換
    const chapterStructure: ChapterStructure = {
      id: node.id,
      title: node.title,
  if (node.projectId !== params.id) {
      description: node.description || '',
      purpose: node.purpose || '',
      content: node.content || '',
      should_split: node.should_split,
      n_pages: node.n_pages,
      order: node.order,
      parentId: node.parentId,
    };

    // AIを使用してコンテンツを生成
    const generatedContent = await editorService.generateSectionContent(
      project.name,
      targetAudience,
      chapterStructure,
      null, // 前のノード（現在は未実装）
      null  // 次のノード（現在は未実装）
    );

    // 生成されたコンテンツでノードを更新
    const updatedNode = await nodeRepository.updateContent(params.nodeId, {
      content: generatedContent,
      status: NodeStatus.in_progress,
    });

    return formatSuccessResponse(updatedNode);
  } catch (error) {
    throw ApiError.internal('Failed to generate content');
  }
};

// エンドポイントハンドラー
export const POST = withErrorHandling(handleGenerateContent);