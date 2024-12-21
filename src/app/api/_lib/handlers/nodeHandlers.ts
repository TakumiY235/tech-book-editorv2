import { NextRequest, NextResponse } from 'next/server';
import { NodeType, NodeStatus } from '@prisma/client';
import { ApiError } from '../errors/ApiError';
import { formatSuccessResponse } from '../responses/formatResponse';
import { getRepositories } from '../../../../services/prisma/repositories';
import { validateProjectExists, validateNodeExists, validateParentNodeExists } from '../validation/entityValidation';
import { transformNode } from '../operations/nodeOperations';

interface CreateNodeRequest {
  title: string;
  type: NodeType;
  parentId?: string;
  description?: string;
  purpose?: string;
}

type ValidUpdateFields = {
  title?: string;
  content?: string;
  type?: NodeType;
  status?: NodeStatus;
  description?: string;
  purpose?: string;
  keywords?: string[];
};

// ノード作成ハンドラー
export const handleCreateNode = async (
  request: NextRequest,
  validatedData: CreateNodeRequest,
  context: { params: { id: string } }
) => {
  try {
    const { nodeRepository } = getRepositories();
    const params = await context.params;
    const id = params.id;

    // プロジェクトの存在確認
    await validateProjectExists(id);

    // 親ノードの存在確認（指定されている場合）
    if (validatedData.parentId) {
      await validateParentNodeExists(validatedData.parentId, id);
    }

    // 同じ階層のノードの最大order値を取得
    const siblings = await nodeRepository.findMany({
      where: {
        projectId: id,
        parentId: validatedData.parentId || null,
      },
      orderBy: {
        order: 'desc',
      },
      take: 1,
    });

    const order = siblings.length > 0 ? siblings[0].order + 1 : 0;

    // ノードを作成
    const node = await nodeRepository.createNode({
      projectId: id,
      parentId: validatedData.parentId,
      type: validatedData.type,
      title: validatedData.title,
      description: validatedData.description,
      purpose: validatedData.purpose,
      order,
    });

    return formatSuccessResponse(node, 201);
  } catch (error) {
    console.error('Error creating node:', error);
    if (error instanceof ApiError) {
      throw error;
    }
    throw ApiError.internal('Failed to create node');
  }
};

// ノード一覧取得ハンドラー
export const handleGetNodes = async (
  request: NextRequest,
  context: { params: { id: string } }
) => {
  try {
    const { nodeRepository } = getRepositories();
    const params = await context.params;
    const id = params.id;

    // プロジェクトの存在確認
    await validateProjectExists(id);

    const nodes = await nodeRepository.findByProjectId(id);
    if (!nodes.length) {
      throw ApiError.notFound('No nodes found for this project');
    }

    return formatSuccessResponse(nodes);
  } catch (error) {
    console.error('Error getting nodes:', error);
    if (error instanceof ApiError) {
      throw error;
    }
    throw ApiError.internal('Failed to get nodes');
  }
};

// ノード更新ハンドラー
export const handleUpdateNode = async (
  request: NextRequest,
  context: { params: { id: string; nodeId: string } }
) => {
  try {
    const params = await context.params;
    const { id, nodeId } = params;
    const updates = await request.json();
    const allowedUpdates = ['title', 'content', 'type', 'status', 'description', 'purpose', 'keywords'] as const;
    
    // プロジェクトとノードの存在確認
    await validateProjectExists(id);
    await validateNodeExists(nodeId, id);
    
    // Filter out undefined values and only allow specific fields
    const validUpdates = allowedUpdates.reduce<Partial<ValidUpdateFields>>((acc, key) => {
      const value = updates[key];
      if (value !== undefined && value !== null) {
        acc[key] = value;
      }
      return acc;
    }, {});

    // Only proceed with update if there are valid fields to update
    if (Object.keys(validUpdates).length === 0) {
      throw ApiError.badRequest('No valid fields to update');
    }

    const { nodeRepository } = getRepositories();
    const node = await nodeRepository.update(nodeId, validUpdates);

    return formatSuccessResponse(transformNode(node));
  } catch (error) {
    console.error('Error updating node:', error);
    if (error instanceof ApiError) {
      throw error;
    }
    throw ApiError.internal('Failed to update node');
  }
};

// ノード削除ハンドラー
export const handleDeleteNode = async (
  request: NextRequest,
  context: { params: { id: string; nodeId: string } }
) => {
  try {
    const params = await context.params;
    const { id, nodeId } = params;
    
    // プロジェクトとノードの存在確認
    await validateProjectExists(id);
    await validateNodeExists(nodeId, id);

    const { nodeRepository } = getRepositories();
    await nodeRepository.deleteWithChildren(nodeId);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting node:', error);
    if (error instanceof ApiError) {
      throw error;
    }
    throw ApiError.internal('Failed to delete node');
  }
};