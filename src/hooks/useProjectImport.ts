'use client';

import { Project } from './types';

export function useProjectImport(
  project: Project,
  handleNodeCreated: () => Promise<void>
) {
  const importFromYaml = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`/api/projects/${project.id}/nodes/import`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to import YAML');
      }

      handleNodeCreated();
    } catch (error) {
      console.error('Error importing YAML:', error);
      throw error;
    }
  };

  return {
    importFromYaml,
  };
}