import { NextRequest } from 'next/server';
import { ApiError } from '../errors/ApiError';
import { formatSuccessResponse } from '../responses/formatResponse';
import { getRepositories } from '../../../../services/prisma/repositories';
import { validateProjectExists } from '../validation/entityValidation';
import { CreateProjectRequest, UpdateProjectRequest } from '../types/projects';

// プロジェクト作成ハンドラー
export const handleCreateProject = async (
  request: NextRequest,
  validatedData: CreateProjectRequest
) => {
  try {
    const { userRepository, projectRepository } = getRepositories();

    // 開発用の固定ユーザーを取得または作成
    const user = await userRepository.findOrCreateDevUser();

    const project = await projectRepository.createWithUser({
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
    const { projectRepository } = getRepositories();

    const projects = await projectRepository.findMany({
      include: {
        user: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

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
    const { projectRepository } = getRepositories();
    const params = await context.params;
    const id = params.id;
    
    await validateProjectExists(id);
    const project = await projectRepository.findByIdWithDetails(id);
    
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
    const { projectRepository } = getRepositories();
    const params = await context.params;
    const id = params.id;
    
    await validateProjectExists(id);

    const updatedProject = await projectRepository.update(id, {
      ...(validatedData.name && { name: validatedData.name }),
      ...(validatedData.metadata && { metadata: validatedData.metadata }),
    });

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
    const { projectRepository, nodeRepository } = getRepositories();
    const params = await context.params;
    const id = params.id;
    
    await validateProjectExists(id);

    // プロジェクトに属するすべてのノードを取得
    const nodes = await nodeRepository.findByProjectId(id);

    // ルートノードから再帰的に削除
    const rootNodes = nodes.filter(node => !node.parentId);
    for (const node of rootNodes) {
      await nodeRepository.deleteWithChildren(node.id);
    }

    // プロジェクトを削除
    await projectRepository.delete(id);

    return formatSuccessResponse({ message: 'Project deleted successfully' }, 204);
  } catch (error) {
    console.error('Error deleting project:', error);
    if (error instanceof ApiError) {
      throw error;
    }
    throw ApiError.internal('Failed to delete project');
  }
};