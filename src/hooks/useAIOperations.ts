import { useState } from 'react';
import { Project, BookNode, BookMetadata } from './types';

export function useAIOperations(
  project: Project,
  setProject: (project: Project) => void,
  onSuccess: () => void
) {
  console.log('useAIOperations: Initializing with project:', {
    id: project.id,
    name: project.name,
    hasMetadata: !!project.metadata,
    nodeCount: project.nodes?.length ?? 0
  });

  const [isGenerating, setIsGenerating] = useState(false);

  const generateContent = async (nodeId: string, bookTitle: string, targetAudience: string): Promise<boolean> => {
    console.log('generateContent called with:', { nodeId, bookTitle, targetAudience });

    const nodes = project.nodes ?? [];
    const targetNode = nodes.find(n => n.id === nodeId);
    console.log('Target node for content generation:', targetNode);

    if (!targetNode) {
      console.error('Target node not found:', nodeId);
      throw new Error('Target node not found');
    }

    setIsGenerating(true);
    try {
      const url = `/api/projects/${project.id}/nodes/${nodeId}/generate-content`;
      console.log('Sending API request...', {
        url,
        method: 'POST',
        body: { bookTitle, targetAudience }
      });

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookTitle,
          targetAudience,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMessage = data.error || 'Failed to generate content';
        throw new Error(errorMessage);
      }

      if (!data.id || !data.content) {
        throw new Error('Invalid response format from server');
      }

      const nodes = project.nodes ?? [];
      const updatedNodes = nodes.map((n) =>
        n.id === data.id ? data : n
      );

      setProject({ ...project, nodes: updatedNodes });
      return true;
    } catch (error) {
      console.error('Error generating content:', error);
      const message = error instanceof Error ? error.message : 'An unknown error occurred';
      throw new Error(`Content generation failed: ${message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const generateStructureWithAI = async (metadata: BookMetadata) => {
    try {
      setIsGenerating(true);
      const response = await fetch('/api/generate-structure', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId: project.id,
          ...metadata,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate structure');
      }

      const nodes = await response.json();
      setProject({ ...project, nodes });
      onSuccess();
    } catch (error) {
      console.error('Error generating structure:', error);
      throw error;
    } finally {
      setIsGenerating(false);
    }
  };

  const generateSubsectionStructure = async (nodeId: string): Promise<boolean> => {
    console.log('generateSubsectionStructure called with:', { nodeId });

    setIsGenerating(true);
    try {
      // 生成中のステータスを設定
      const currentNodes = project.nodes ?? [];
      const nodesWithGenerating = currentNodes.map(node =>
        node.id === nodeId
          ? { ...node, status: 'generating' } as BookNode
          : node
      );
      setProject({ ...project, nodes: nodesWithGenerating });

      const response = await fetch(`/api/projects/${project.id}/nodes/${nodeId}/generate-subsections`, {
        method: 'POST',
      });

      if (!response.ok) {
        const data = await response.json();
        // エラー時は元のステータスに戻す
        const nodes = project.nodes ?? [];
        const revertNodes = nodes.map(node =>
          node.id === nodeId
            ? { ...node, status: 'in_progress' } as BookNode
            : node
        );
        setProject({ ...project, nodes: revertNodes });
        throw new Error(data.error || 'Failed to generate subsections');
      }

      const { subsections } = await response.json();
      // 生成完了後、親ノードのステータスを更新
      const existingNodes = project.nodes ?? [];
      const completedNodes = existingNodes.map(node =>
        node.id === nodeId
          ? { ...node, status: 'completed' } as BookNode
          : node
      );
      const finalNodes = [...completedNodes, ...subsections];
      setProject({ ...project, nodes: finalNodes });
      onSuccess();
      return true;
    } catch (error) {
      console.error('Error generating subsections:', error);
      throw error;
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    generateContent,
    generateStructureWithAI,
    generateSubsectionStructure,
    isGenerating,
  };
}