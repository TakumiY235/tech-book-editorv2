import { NextRequest } from 'next/server';
import { NodeStatus, Prisma } from '@prisma/client';
import { ApiError } from '../errors/ApiError';
import { formatSuccessResponse } from '../responses/formatResponse';
import { validateNodeContext, validateProjectMetadata } from '../validation/serviceValidation';
import { getRepositories } from '../../../../services/prisma/repositories';
import { prisma } from '../../../../services/prisma/db';
import { NodeCreateInput, GenerateStructureOptions, BookMetadata, OrganizedNode } from '../../../../types/project';

/**
 * 構造生成の共通ハンドラー
 */
export const handleGenerateStructure = async (
  request: NextRequest,
  options: GenerateStructureOptions
) => {
  try {
    const { projectId, nodeId, requestBody } = options;
    const { nodeRepository } = getRepositories();

    // プロジェクトの検証とAIサービスの初期化
    const { project, node, editorService } = await validateNodeContext(projectId, nodeId);

    let chapterStructure;
    let bookMetadata: BookMetadata;
    
    if (nodeId) {
      // ノードレベルの構造生成
      const metadata = validateProjectMetadata(project);
      bookMetadata = {
        title: project.name,
        overview: metadata.overview,
        targetAudience: metadata.targetAudience,
        pageCount: metadata.pageCount,
      };

      // 既存の子ノードを削除
      const existingNodes = await nodeRepository.findMany({
        where: {
          projectId,
          parentId: nodeId
        }
      });
      for (const existingNode of existingNodes) {
        await nodeRepository.delete(existingNode.id);
      }
    } else {
      // プロジェクトレベルの構造生成
      if (!requestBody) {
        throw ApiError.badRequest('Request body is required for project-level structure generation');
      }
      
      const { title, overview, targetAudience, pageCount } = requestBody;
      if (!title || !overview || !targetAudience || !pageCount) {
        throw ApiError.badRequest('Missing required fields: title, overview, targetAudience, pageCount');
      }

      bookMetadata = { title, overview, targetAudience, pageCount };

      // プロジェクト全体のノードを削除
      await prisma.node.deleteMany({
        where: { projectId }
      });
    }

    // 構造生成
    chapterStructure = await editorService.generateChapterStructure(bookMetadata);

    // ノードの作成
    const createdNodes = await createNodesFromStructure(
      projectId,
      nodeRepository,
      chapterStructure,
      nodeId
    );

    return formatSuccessResponse(createdNodes);
  } catch (error) {
    console.error('Error in generate structure:', error);
    if (error instanceof ApiError) {
      throw error;
    }
    throw ApiError.internal('Failed to generate structure');
  }
};

/**
 * 構造からノードを再帰的に作成する補助関数
 */
async function createNodesFromStructure(
  projectId: string,
  nodeRepository: any,
  structures: OrganizedNode[],
  parentId?: string,
  nodeMap = new Map()
): Promise<Node[]> {
  try {
    const nodes = [];
    let order = 0;

    for (const structure of structures) {
      if (!structure.title || typeof structure.order !== 'number') {
        console.error(`Invalid node data:`, structure);
        continue;
      }

      const nodeData: NodeCreateInput = {
        id: structure.id,
        title: structure.title,
        type: structure.type,
        projectId: projectId,
        parentId: parentId,
        order: order++,
        status: NodeStatus.draft,
        description: structure.description || '',
        purpose: structure.purpose || '',
        n_pages: typeof structure.n_pages === 'number' ? structure.n_pages : 0,
        should_split: Boolean(structure.should_split)
      };

      const createdNode = await nodeRepository.createNode(nodeData);
      nodes.push(createdNode);
      nodeMap.set(structure.id, createdNode);

      // 子ノードがある場合は再帰的に作成
      if (structure.children?.length > 0) {
        const childNodes = await createNodesFromStructure(
          projectId,
          nodeRepository,
          structure.children,
          createdNode.id,
          nodeMap
        );
        nodes.push(...childNodes);
      }
    }

    return nodes;
  } catch (error) {
    console.error(`Error creating nodes from structure:`, error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      throw ApiError.internal(`Database error: ${error.message}`);
    }
    throw error;
  }
}