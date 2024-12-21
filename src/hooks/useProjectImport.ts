'use client';

import { Project } from '../types/project';
import { useAPI } from './core/useAPI';
import { handleProjectImportError } from './core/useErrorHandling';

export function useProjectImport(
  project: Project,
  handleNodeCreated: () => Promise<void>
) {
  const api = useAPI();

  const importFromYaml = async (file: File) => {
    try {
      await api.importFromYaml(project.id, file);
      handleNodeCreated();
    } catch (error) {
      handleProjectImportError.handleYamlImportError(error);
    }
  };

  return {
    importFromYaml,
  };
}