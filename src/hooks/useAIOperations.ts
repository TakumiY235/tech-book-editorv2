'use client';

import { Project, BookNode, BookMetadata } from '@/types/project';
import { useAPI } from './core/useAPI';
import { handleAIOperationsError } from './core/useErrorHandling';

export function useAIOperations(
  project: Project,
  setProject: (project: Project | ((prev: Project) => Project)) => void,
  onSuccess: () => void
) {
  const api = useAPI();

  const generateContent = async (nodeId: string, bookTitle: string, targetAudience: string): Promise<boolean> => {
    console.log('generateContent called with:', { nodeId, bookTitle, targetAudience });

    const nodes = project.nodes ?? [];
    const targetNode = nodes.find((n: BookNode) => n.id === nodeId);
    console.log('Target node for content generation:', targetNode);

    if (!targetNode) {
      console.error('Target node not found:', nodeId);
      throw new Error('Target node not found');
    }

    try {
      const updatedNode = await api.generateContent(project.id, nodeId, bookTitle, targetAudience);
      
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
    if (!project.nodes || project.nodes.length === 0) {
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
    console.log('generateSubsectionStructure called with:', { nodeId });

    try {
      // 生成中のステータスを設定
      setProject(prev => ({
        ...prev,
        nodes: prev.nodes?.map((node: BookNode) =>
          node.id === nodeId
            ? { ...node, status: 'generating' } as BookNode
            : node
        ) || []
      }));

      const { subsections } = await api.generateSubsections(project.id, nodeId);

      // 生成完了後、親ノードのステータスを更新
      setProject(prev => {
        const existingNodes = prev.nodes ?? [];
        const completedNodes = existingNodes.map((node: BookNode) =>
          node.id === nodeId
            ? { ...node, status: 'completed' } as BookNode
            : node
        );
        return {
          ...prev,
          nodes: [...completedNodes, ...subsections]
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
    generateContent,
    generateStructureWithAI,
    refineStructureWithAI,
    generateSubsectionStructure,
  };
}