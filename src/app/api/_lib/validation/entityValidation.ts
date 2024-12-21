import { getRepositories } from '../../../../services/prisma/repositories';
import { ApiError } from '../errors/ApiError';

export async function validateProjectExists(projectId: string) {
  const { projectRepository } = getRepositories();
  const project = await projectRepository.findById(projectId);
  
  if (!project) {
    throw ApiError.notFound('Project not found');
  }

  return project;
}

export async function validateNodeExists(nodeId: string, projectId: string) {
  const { nodeRepository } = getRepositories();
  const node = await nodeRepository.findById(nodeId);
  
  if (!node || node.projectId !== projectId) {
    throw ApiError.notFound('Node not found');
  }

  return node;
}

export async function validateParentNodeExists(parentId: string, projectId: string) {
  const { nodeRepository } = getRepositories();
  const parentNode = await nodeRepository.findById(parentId);
  
  if (!parentNode || parentNode.projectId !== projectId) {
    throw ApiError.notFound('Parent node not found');
  }

  return parentNode;
}