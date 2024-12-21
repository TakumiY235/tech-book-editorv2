import { NextRequest } from 'next/server';
import { formatSuccessResponse } from '../responses/formatResponse';
import { getRepositories } from '../../../../services/prisma/repositories';
import { validateProjectExists } from '../validation/entityValidation';
import { CreateProjectRequest, UpdateProjectRequest } from '../../../../types/api/projects';
import { ApiError } from '../errors/ApiError';

// プロジェクト作成ハンドラー
export const handleCreateProject = async (
  request: NextRequest,
  validatedData: CreateProjectRequest
) => {
  const { userRepository, projectRepository } = getRepositories();

  // 開発用の固定ユーザーを取得または作成
  const user = await userRepository.findOrCreateDevUser();

  const project = await projectRepository.createWithUser({
    name: validatedData.name,
    userId: user.id,
  });

  return formatSuccessResponse(project, 201);
};

// プロジェクト一覧取得ハンドラー
export const handleGetProjects = async (request: NextRequest) => {
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
};

// プロジェクト取得ハンドラー
export const handleGetProject = async (
  request: NextRequest,
  context: { params: { id: string } }
) => {
  const { projectRepository } = getRepositories();
  const params = await context.params;
  await validateProjectExists(params.id);
  
  const project = await projectRepository.findByIdWithDetails(params.id);
  return formatSuccessResponse(project);
};

// プロジェクト更新ハンドラー
export const handleUpdateProject = async (
  request: NextRequest,
  validatedData: UpdateProjectRequest,
  context: { params: { id: string } }
) => {
  const { projectRepository } = getRepositories();
  const params = await context.params;
  await validateProjectExists(params.id);

  const updatedProject = await projectRepository.update(params.id, {
    ...(validatedData.name && { name: validatedData.name }),
    ...(validatedData.metadata && { metadata: validatedData.metadata }),
  });

  return formatSuccessResponse(updatedProject);
};

// プロジェクト削除ハンドラー
export const handleDeleteProject = async (
  request: NextRequest,
  context: { params: { id: string } }
) => {
  const { projectRepository, nodeRepository } = getRepositories();
  const params = await context.params;
  await validateProjectExists(params.id);

  // プロジェクトに属するすべてのノードを取得
  const nodes = await nodeRepository.findByProjectId(params.id);

  // ルートノードから再帰的に削除
  const rootNodes = nodes.filter(node => !node.parentId);
  for (const node of rootNodes) {
    await nodeRepository.deleteWithChildren(node.id);
  }

  // プロジェクトを削除
  await projectRepository.delete(params.id);

  return formatSuccessResponse({ message: 'Project deleted successfully' });
};