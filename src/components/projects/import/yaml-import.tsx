'use client';

import { ChangeEvent } from 'react';
import { useToast } from '../../../components/ui/toast';
import { Project } from '@/types/project';
import { useAPI } from '@hooks/core/useAPI';
import { handleProjectImportError } from '@hooks/core/useErrorHandling';


interface YAMLImportProps {
  projectId: string;
  onSuccess: () => void;
}

export function YAMLImport({ projectId, onSuccess }: YAMLImportProps) {
  const { toast } = useToast();

  const handleFileImport = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const text = await file.text();
        const response = await fetch(`/api/projects/${projectId}/import`, {
          method: 'POST',
          body: text,
        });
        if (!response.ok) {
          throw new Error('Failed to import YAML');
        }
        onSuccess();
        toast({
          title: '成功',
          description: 'YAMLファイルのインポートが完了しました。',
          variant: 'default'
        });
      } catch (error) {
        console.error('Error importing YAML:', error);
        toast({
          title: 'エラー',
          description: 'YAMLファイルのインポートに失敗しました。',
          variant: 'destructive'
        });
      }
    }
  };

  return (
    <>
      <input
        type="file"
        accept=".yaml,.yml"
        onChange={handleFileImport}
        className="hidden"
        id="yaml-import"
      />
      <label
        htmlFor="yaml-import"
        className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md font-semibold text-xs text-gray-700 uppercase tracking-widest shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-25 transition ease-in-out duration-150 cursor-pointer"
      >
        Import YAML
      </label>
    </>
  );
}





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