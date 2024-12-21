import { ApiError } from '../errors/ApiError';
import { getRepositories } from '../../../../services/prisma/repositories';
import { AIEditorService } from '../../../../services/ai/AIGeneration';
import { Node } from '@prisma/client';

// NodeWithParent型の定義を追加
export interface NodeWithParent extends Node {
  parent?: Node | null;
}

export interface ValidatedNodeContext {
  projectId: string;
  nodeId?: string;
  project: any;
  node?: NodeWithParent;  // 型を NodeWithParent に変更
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
export const validateParams = async (params: any): Promise<{ projectId: string; nodeId?: string }> => {
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
  const { projectRepository, nodeRepository } = getRepositories();
  const editorService = validateAIServiceConfig();

  // プロジェクトの存在確認
  const project = await projectRepository.findById(projectId);
  if (!project) {
    throw ApiError.notFound('Project not found');
  }

  // ノードIDが指定されている場合、ノードの存在とプロジェクトへの所属を確認
  let node: NodeWithParent | undefined;
  if (nodeId) {
    const foundNode = await nodeRepository.findByIdWithParent(nodeId);
    if (!foundNode) {
      throw ApiError.notFound('Node not found');
    }
    if (foundNode.projectId !== projectId) {
      throw ApiError.badRequest('Node does not belong to this project');
    }
    node = foundNode;
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
export const validateProjectMetadata = (project: any) => {
  const metadata = project.metadata && typeof project.metadata === 'object'
    ? project.metadata
    : {};

  return {
    targetAudience: typeof metadata === 'object' && 'targetAudience' in metadata && typeof metadata.targetAudience === 'string'
      ? metadata.targetAudience
      : 'general',
    overview: metadata?.overview || '',
    pageCount: metadata?.pageCount || 200
  };
};