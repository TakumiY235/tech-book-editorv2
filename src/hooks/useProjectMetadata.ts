'use client';

import { Project } from './types';

export function useProjectMetadata(
  project: Project,
  setProject: (project: Project) => void
) {
  const handleUpdateProjectMetadata = async (updates: {
    name?: string;
    targetAudience?: string;
    metadata?: {
      overview?: string;
      pageCount?: number;
    };
  }) => {
    try {
      const response = await fetch(`/api/projects/${project.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: updates.name,
          metadata: {
            ...(updates.targetAudience && { targetAudience: updates.targetAudience }),
            ...(updates.metadata?.overview && { overview: updates.metadata.overview }),
            ...(updates.metadata?.pageCount && { pageCount: updates.metadata.pageCount })
          }
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update project metadata');
      }

      const updatedProject = await response.json();
      setProject(updatedProject);
    } catch (error) {
      console.error('Error updating project metadata:', error);
    }
  };

  return {
    handleUpdateProjectMetadata,
  };
}