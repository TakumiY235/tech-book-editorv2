'use client';

import { ChangeEvent } from 'react';
import { CreateNodeForm } from '../forms/create-node-form';
import { BookNode } from '../../../types/project';

interface ProjectToolbarProps {
  projectId: string;
  nodes: BookNode[];
  isGenerating: boolean;
  onGenerateStructure: () => Promise<void>;
  onNodeCreated: () => void;
  onImportSuccess: () => void;
}

export function ProjectToolbar({
  projectId,
  nodes,
  isGenerating,
  onGenerateStructure,
  onNodeCreated,
  onImportSuccess,
}: ProjectToolbarProps) {
  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button
          onClick={onGenerateStructure}
          disabled={isGenerating}
          className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-md font-semibold text-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGenerating ? 'AI編集者が章立てを考えています...' : 'AIで章立てを生成'}
        </button>
      </div>
      <div className="flex gap-2">
        <CreateNodeForm
          projectId={projectId}
          nodes={nodes}
          onSuccess={onNodeCreated}
          initialTitle="New section"
          skipModal={true}
        />
        <input
          type="file"
          accept=".yaml,.yml"
          onChange={async (e: ChangeEvent<HTMLInputElement>) => {
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
                onImportSuccess();
              } catch (error) {
                console.error('Error importing YAML:', error);
                alert('Failed to import YAML file');
              }
            }
          }}
          className="hidden"
          id="yaml-import"
        />
        <label
          htmlFor="yaml-import"
          className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md font-semibold text-xs text-gray-700 uppercase tracking-widest shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-25 transition ease-in-out duration-150 cursor-pointer"
        >
          Import YAML
        </label>
      </div>
    </div>
  );
}