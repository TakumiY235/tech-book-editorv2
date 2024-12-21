import { useState } from 'react';
import { Node } from '../types/project';

interface NodeCreationData {
  title: string;
  type: 'section' | 'subsection';
  parentId: string | null;
  description: string;
  purpose: string;
  n_pages: number;
  should_split: boolean;
}

export function useNodeCreation(projectId: string) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const createNode = async (data: NodeCreationData): Promise<boolean> => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/projects/${projectId}/nodes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`Failed to create ${data.type}`);
      }

      return true;
    } catch (error) {
      setError(`Failed to create ${data.type}. Please try again.`);
      console.error(`Error creating ${data.type}:`, error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createNode,
    isLoading,
    error,
  };
}