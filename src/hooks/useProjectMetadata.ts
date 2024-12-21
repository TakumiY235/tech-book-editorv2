'use client';

import { Project } from '../types/project';
import { useAPI } from './core/useAPI';
import { handleProjectMetadataError } from './core/useErrorHandling';

export function useProjectMetadata(
  project: Project,
  setProject: (project: Project | ((prev: Project) => Project)) => void
) {
  const api = useAPI();

  const handleUpdateProjectMetadata = async (updates: {
    name?: string;
    targetAudience?: string;
    metadata?: {
      overview?: string;
      pageCount?: number;
    };
  }) => {
    try {
      const updatedProject = await api.updateProjectMetadata(project.id, updates);
      setProject(updatedProject);
    } catch (error) {
      handleProjectMetadataError.handleUpdateError(error);
    }
  };

  return {
    handleUpdateProjectMetadata,
  };
}