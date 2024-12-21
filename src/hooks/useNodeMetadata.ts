import { useCallback } from 'react';
import { BookNode } from '../types/project';

type NodeType = BookNode['type'];
type NodeStatus = BookNode['status'];

export function useNodeMetadata(projectId: string, nodeId: string | null) {
  const updateNodeMetadata = useCallback(async (type: NodeType, status: NodeStatus): Promise<boolean> => {
    if (!nodeId) return false;

    try {
      const response = await fetch(`/api/projects/${projectId}/nodes/${nodeId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type,
          status,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update node metadata');
      }

      return true;
    } catch (error) {
      console.error('Error updating node metadata:', error);
      return false;
    }
  }, [projectId, nodeId]);

  const updateNodeContent = useCallback(async (content: string): Promise<boolean> => {
    if (!nodeId) return false;

    try {
      const response = await fetch(`/api/projects/${projectId}/nodes/${nodeId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save content');
      }

      return true;
    } catch (error) {
      console.error('Error saving content:', error);
      return false;
    }
  }, [projectId, nodeId]);

  return {
    updateNodeMetadata,
    updateNodeContent,
  };
}