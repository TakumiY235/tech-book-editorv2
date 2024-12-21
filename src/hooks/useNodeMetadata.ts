import { useCallback } from 'react';
import { useAPI } from './core/useAPI';
import { NodeType, NodeStatus } from '@prisma/client';

export function useNodeMetadata(projectId: string, nodeId: string | null) {
  const api = useAPI();

  const updateNodeMetadata = useCallback(async (type: NodeType, status: NodeStatus): Promise<boolean> => {
    if (!nodeId) return false;
    try {
      return await api.updateNodeMetadata(projectId, nodeId, type, status);
    } catch (error) {
      console.error('Error updating node metadata:', error);
      return false;
    }
  }, [projectId, nodeId, api]);

  const updateNodeContent = useCallback(async (content: string): Promise<boolean> => {
    if (!nodeId) return false;
    try {
      return await api.updateNodeContent(projectId, nodeId, content);
    } catch (error) {
      console.error('Error saving content:', error);
      return false;
    }
  }, [projectId, nodeId, api]);

  return {
    updateNodeMetadata,
    updateNodeContent,
  };
}