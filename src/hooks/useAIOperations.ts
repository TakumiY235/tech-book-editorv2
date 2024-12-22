'use client';

import { Project, BookNode, BookMetadata } from '../types/project';
import { useAPI } from './core/useAPI';
import { handleAIOperationsError } from './core/useErrorHandling';

/**
 * AIを使用したコンテンツ生成と構造管理のためのフック
 */
export function useAIOperations(
  project: Project,
  setProject: (project: Project | ((prev: Project) => Project)) => void,
  onSuccess: () => void
) {
  const api = useAPI();

  /**
   * ノードのステータスを更新するヘルパー関数
   */
  const updateNodeStatus = (nodeId: string, status: 'generating' | 'completed') => {
    setProject(prev => ({
      ...prev,
      nodes: prev.nodes?.map((node: BookNode) =>
        node.id === nodeId
          ? { ...node, status } as BookNode
          : node
      ) || []
    }));
  };

  /**
   * コンテンツ生成関連の操作
   */
  const generateContent = async (
    nodeId: string,
    metadata: BookMetadata
  ): Promise<boolean> => {
    const targetNode = project.nodes?.find((n: BookNode) => n.id === nodeId);
    if (!targetNode) {
      throw new Error('Target node not found');
    }

    try {
      const updatedNode = await api.generateContent(
        project.id,
        nodeId,
        metadata
      );
      
      setProject(prev => ({
        ...prev,
        nodes: prev.nodes?.map((n: BookNode) =>
          n.id === updatedNode.id ? updatedNode : n
        ) || []
      }));
      return true;
    } catch (error) {
      handleAIOperationsError.handleContentGenerationError(error);
      return false;
    }
  };

  /**
   * 構造生成関連の操作
   */
  const generateStructureWithAI = async (metadata: BookMetadata) => {
    try {
      const nodes = await api.generateStructure(project.id, metadata);
      setProject(prev => ({ ...prev, nodes }));
      onSuccess();
    } catch (error) {
      handleAIOperationsError.handleStructureGenerationError(error);
    }
  };

  const refineStructureWithAI = async () => {
    if (!project.nodes?.length) {
      throw new Error('No existing structure to refine');
    }

    try {
      const refinedNodes = await api.refineStructure(project.id);
      setProject(prev => ({ ...prev, nodes: refinedNodes }));
      onSuccess();
    } catch (error) {
      handleAIOperationsError.handleStructureGenerationError(error);
    }
  };

  const generateSubsectionStructure = async (nodeId: string): Promise<boolean> => {
    try {
      updateNodeStatus(nodeId, 'generating');
      const result = await api.generateSubsections(project.id, nodeId);

      setProject(prev => {
        const existingNodes = prev.nodes ?? [];
        const completedNodes = existingNodes.map((node: BookNode) =>
          node.id === nodeId
            ? { ...node, status: 'completed' } as BookNode
            : node
        );
        return {
          ...prev,
          nodes: [...completedNodes, ...result.subsections]
        };
      });
      onSuccess();
      return true;
    } catch (error) {
      handleAIOperationsError.handleSubsectionGenerationError(error);
      return false;
    }
  };

  return {
    // コンテンツ生成
    generateContent,
    // 構造生成と管理
    generateStructureWithAI,
    refineStructureWithAI,
    generateSubsectionStructure,
  };
}