'use client';

import { CreateNodeForm } from '../../node-management/forms/create-node-form';
import { BookNode, BookMetadata } from '../../../../types/project';
import { YAMLImport } from '../../import/yaml-import';
import { AIStructureGenerator } from '../../ai-generation/AIStructureGenerator';

interface ProjectToolbarProps {
  projectId: string;
  nodes: BookNode[];
  projectMetadata: BookMetadata;
  onGenerateStructure: (metadata: {
    title: string;
    overview: string;
    targetAudience: string;
    pageCount: number;
  }) => Promise<void>;
  onNodeCreated: () => void;
  onImportSuccess: () => void;
  onRefineStructure?: () => Promise<void>;
}

export function ProjectToolbar({
  projectId,
  nodes,
  projectMetadata,
  onGenerateStructure,
  onNodeCreated,
  onImportSuccess,
  onRefineStructure,
}: ProjectToolbarProps) {
  return (
    <div className="space-y-4">
      <AIStructureGenerator
        projectMetadata={projectMetadata}
        onGenerate={onGenerateStructure}
        onRefine={onRefineStructure}
        hasExistingStructure={nodes.length > 0}
      />
      <div className="flex gap-2">
        <CreateNodeForm
          projectId={projectId}
          nodes={nodes}
          onSuccess={onNodeCreated}
          initialTitle="New section"
          skipModal={true}
        />
        <YAMLImport projectId={projectId} onSuccess={onImportSuccess} />
      </div>
    </div>
  );
}