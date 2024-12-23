import { NextRequest } from 'next/server';
import { Node as PrismaNode, Prisma } from '@prisma/client';
import { ApiError } from '../errors/ApiError';
import { formatSuccessResponse } from '../responses/formatResponse';
import { validateProjectExists } from '../validation/entityValidation';
import { CreateProjectRequest, UpdateProjectRequest } from '../types/projects';
import { db } from '../../../../services/prisma/clients';

// プロジェクト作成ハンドラー
export const handleCreateProject = async (
  request: NextRequest,
  validatedData: CreateProjectRequest
) => {
  try {
    // 開発用の固定ユーザーを取得または作成
    const user = await db.user.findOrCreateDevUser();

    const project = await db.project.create({
      name: validatedData.name,
      userId: user.id,
    });

    return formatSuccessResponse(project, 201);
  } catch (error) {
    console.error('Error creating project:', error);
    if (error instanceof ApiError) {
      throw error;
    }
    throw ApiError.internal('Failed to create project');
  }
};

// プロジェクト一覧取得ハンドラー
export const handleGetProjects = async (request: NextRequest) => {
  try {
    const projects = await db.project.findByUserId('dev-user');

    if (!projects.length) {
      throw ApiError.notFound('No projects found');
    }

    return formatSuccessResponse(projects);
  } catch (error) {
    console.error('Error getting projects:', error);
    if (error instanceof ApiError) {
      throw error;
    }
    throw ApiError.internal('Failed to get projects');
  }
};

// プロジェクト取得ハンドラー
export const handleGetProject = async (
  request: NextRequest,
  context: { params: { id: string } }
) => {
  try {
    const params = await context.params;
    const id = params.id;
    
    await validateProjectExists(id);
    const project = await db.project.findByIdWithDetails(id);
    
    if (!project) {
      throw ApiError.notFound('Project not found');
    }

    return formatSuccessResponse(project);
  } catch (error) {
    console.error('Error getting project:', error);
    if (error instanceof ApiError) {
      throw error;
    }
    throw ApiError.internal('Failed to get project');
  }
};

// プロジェクト更新ハンドラー
export const handleUpdateProject = async (
  request: NextRequest,
  validatedData: UpdateProjectRequest,
  context: { params: { id: string } }
) => {
  try {
    const params = await context.params;
    const id = params.id;
    
    await validateProjectExists(id);

    let updateData = {};
    if (validatedData.name) {
      updateData = { ...updateData, name: validatedData.name };
    }
    if (validatedData.metadata) {
      const metadata: Prisma.JsonObject = {
        title: validatedData.metadata.title,
        overview: validatedData.metadata.overview,
        targetAudience: validatedData.metadata.targetAudience,
        pageCount: validatedData.metadata.pageCount
      };
      await db.project.updateMetadata(id, metadata);
    }

    const updatedProject = await db.project.findByIdWithDetails(id);
    if (!updatedProject) {
      throw ApiError.notFound('Project not found after update');
    }

    return formatSuccessResponse(updatedProject);
  } catch (error) {
    console.error('Error updating project:', error);
    if (error instanceof ApiError) {
      throw error;
    }
    throw ApiError.internal('Failed to update project');
  }
};

// プロジェクト削除ハンドラー
export const handleDeleteProject = async (
  request: NextRequest,
  context: { params: { id: string } }
) => {
  try {
    const params = await context.params;
    const id = params.id;
    
    await validateProjectExists(id);

    // プロジェクトに属するすべてのノードを取得
    const nodes = await db.node.findByProjectId(id);

    // ルートノードから再帰的に削除
    const rootNodes = nodes.filter((node: PrismaNode) => !node.parentId);
    await Promise.all(
      rootNodes.map((node: PrismaNode) => db.node.deleteWithChildren(node.id))
    );

    // プロジェクトを削除
    await db.project.delete(id);

    return formatSuccessResponse({ message: 'Project deleted successfully' }, 204);
  } catch (error) {
    console.error('Error deleting project:', error);
    if (error instanceof ApiError) {
      throw error;
    }
    throw ApiError.internal('Failed to delete project');
  }
};