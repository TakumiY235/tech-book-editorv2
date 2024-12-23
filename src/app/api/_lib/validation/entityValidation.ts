import { Project, Node } from '@prisma/client';
import { ApiError } from '../errors/ApiError';
import { db } from '../../../../services/prisma/clients';

export async function validateProjectExists(projectId: string): Promise<Project> {
  const project = await db.project.findById(projectId);
  
  if (!project) {
    throw ApiError.notFound('Project not found');
  }

  return project;
}

export async function validateNodeExists(nodeId: string, projectId: string): Promise<Node> {
  const node = await db.node.findById(nodeId);
  
  if (!node || node.projectId !== projectId) {
    throw ApiError.notFound('Node not found');
  }

  return node;
}

export async function validateParentNodeExists(parentId: string, projectId: string): Promise<Node> {
  const parentNode = await db.node.findById(parentId);
  
  if (!parentNode || parentNode.projectId !== projectId) {
    throw ApiError.notFound('Parent node not found');
  }

  return parentNode;
}