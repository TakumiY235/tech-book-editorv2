import { ApiError } from '../errors/ApiError';
import { AIEditorService } from '../../../../services/ai/AIGeneration';
import { Node, Project } from '@prisma/client';
import { db } from '../../../../services/prisma/clients';

// NodeWithParent型の定義を追加
export interface NodeWithParent extends Node {
  parent: Node | null;
}

export interface ValidatedNodeContext {
  projectId: string;
  nodeId?: string;
  project: Project;
  node?: NodeWithParent;
  editorService: AIEditorService;
}

/**
 * AIサービスの設定を検証し、初期化する
 */
export const validateAIServiceConfig = () => {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw ApiError.internal('AI service configuration is missing');
  }
  return new AIEditorService(apiKey);
};

/**
 * プロジェクトIDとノードIDのパラメータを検証する
 */
export const validateParams = async (params: { id: string; nodeId?: string }): Promise<{ projectId: string; nodeId?: string }> => {
  const projectId = params.id;
  const nodeId = params.nodeId;

  if (!projectId) {
    throw ApiError.badRequest('Missing project ID');
  }

  return { projectId, nodeId };
};

/**
 * プロジェクトとノードの存在を検証し、必要なコンテキストを返す
 */
export const validateNodeContext = async (projectId: string, nodeId?: string): Promise<ValidatedNodeContext> => {
  const editorService = validateAIServiceConfig();

  // プロジェクトの存在確認
  const project = await db.project.findById(projectId);
  if (!project) {
    throw ApiError.notFound('Project not found');
  }

  // ノードIDが指定されている場合、ノードの存在とプロジェクトへの所属を確認
  let node: NodeWithParent | undefined;
  if (nodeId) {
    const foundNode = await db.node.findByIdWithParent(nodeId);
    if (!foundNode) {
      throw ApiError.notFound('Node not found');
    }
    if (foundNode.projectId !== projectId) {
      throw ApiError.badRequest('Node does not belong to this project');
    }
    node = foundNode as NodeWithParent;
  }

  return {
    projectId,
    nodeId,
    project,
    node,
    editorService
  };
};

/**
 * プロジェクトのメタデータを検証し、デフォルト値を設定する
 */
export const validateProjectMetadata = (project: Project) => {
  const metadata = project.metadata && typeof project.metadata === 'object'
    ? project.metadata as Record<string, unknown>
    : {};

  return {
    title: project.name || 'Untitled Project',
    targetAudience: typeof metadata.targetAudience === 'string'
      ? metadata.targetAudience
      : 'general',
    overview: typeof metadata.overview === 'string'
      ? metadata.overview
      : '',
    pageCount: typeof metadata.pageCount === 'number'
      ? metadata.pageCount
      : 200
  };
};