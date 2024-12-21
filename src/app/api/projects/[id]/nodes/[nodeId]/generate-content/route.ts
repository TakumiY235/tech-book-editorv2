import { NextRequest } from 'next/server';
import { withErrorHandling } from '../../../../../middleware';
import { formatSuccessResponse } from '../../../../../_lib/responses/formatResponse';
import { ApiError } from '../../../../../_lib/errors/ApiError';
import { getRepositories } from '../../../../../../../services/prisma/repositories';
import { NodeStatus } from '@prisma/client';
import { ChapterStructure } from '../../../../../../../types/project';
import { validateNodeContext, validateProjectMetadata } from '../../../../../_lib/validation/serviceValidation';

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

  const chapterStructure: ChapterStructure = {
    id: node.id,
    type: node.type as 'section' | 'subsection',
    title: node.title,
    description: node.description || '',
    purpose: node.purpose || '',
    content: node.content || '',
    should_split: node.should_split ?? false,
    n_pages: node.n_pages ?? 1,
    order: node.order ?? 0,
    parentId: node.parentId || ''
  };

  try {
    // プロジェクトのメタデータを検証
    const { targetAudience } = validateProjectMetadata(project);

    // AIを使用してコンテンツを生成
    const generatedContent = await editorService.generateSectionContent(
      project.name,
      targetAudience,
      chapterStructure,
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