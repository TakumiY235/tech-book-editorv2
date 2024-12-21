'use client';

import React from 'react';
import { CreateNodeForm } from '@/components/projects/node-management/forms/create-node-form';
import { NodeList } from '@/components/projects/node-management/display/node-list';
import { ProjectMetadataEditor } from '@/components/projects/project-management/forms/project-metadata-editor';
import { YAMLImport } from '@/components/projects/import/yaml-import';
import { AIStructureGenerator } from '@/components/projects/ai-generation/AIStructureGenerator';
import { Project, OrganizedNode } from '@/types/project';
import { containerStyles } from '@/lib/utils/styles';
import { DropResult } from 'react-beautiful-dnd';

interface ProjectSidebarProps {
  project: Project;
  selectedNodeId: string | null;
  organizedNodes: OrganizedNode[];
  onNodeCreated: () => void;
  onDragEnd: (result: DropResult) => void;
  onSelectNode: (nodeId: string) => void;
  onDeleteNode: (nodeId: string, e: React.MouseEvent) => void;
  onUpdateNodeTitle: (nodeId: string, title: string) => void;
  onCreateSubsection: (parentId: string) => void;
  onUpdateProjectMetadata: (updates: { 
    name?: string;
    targetAudience?: string;
    metadata?: {
      overview?: string;
      pageCount?: number;
    };
  }) => void;
  onGenerateStructure: (metadata: any) => Promise<void>;
  onRefineStructure: () => Promise<void>;
  onGenerateSubsections: (nodeId: string) => Promise<boolean>;
}

export function ProjectSidebar({
  project,
  selectedNodeId,
  organizedNodes,
  onNodeCreated,
  onDragEnd,
  onSelectNode,
  onDeleteNode,
  onUpdateNodeTitle,
  onCreateSubsection,
  onUpdateProjectMetadata,
  onGenerateStructure,
  onRefineStructure,
  onGenerateSubsections,
}: ProjectSidebarProps) {
  const hasNodes = project.nodes && project.nodes.length > 0;

  return (
    <aside className="w-1/3 border-r border-gray-200 p-4 bg-gray-50 flex flex-col h-full">
      {/* Project Metadata Section */}
      <div className={containerStyles.section}>
        <ProjectMetadataEditor
          project={project}
          onUpdateMetadata={onUpdateProjectMetadata}
        />
        
        {/* AI Structure Generation */}
        <div className="flex gap-2 mb-4">
          <AIStructureGenerator
            projectMetadata={{
              title: project.name,
              overview: project.metadata?.overview || '',
              targetAudience: project.metadata?.targetAudience || '',
              pageCount: project.metadata?.pageCount || 0
            }}
            onGenerate={onGenerateStructure}
            onRefine={onRefineStructure}
            hasExistingStructure={Boolean(hasNodes)}
          />
        </div>
        
        {/* Node Creation Tools */}
        <div className="flex gap-2 mb-4">
          <CreateNodeForm
            projectId={project.id}
            nodes={project.nodes || []}
            onSuccess={onNodeCreated}
            initialTitle="New section"
            skipModal={true}
          />
          <YAMLImport
            projectId={project.id}
            onSuccess={onNodeCreated}
          />
        </div>
      </div>

      {/* Node Tree */}
      <NodeList
        organizedNodes={organizedNodes}
        selectedNodeId={selectedNodeId}
        onDragEnd={onDragEnd}
        onSelect={onSelectNode}
        onDelete={onDeleteNode}
        onUpdateTitle={onUpdateNodeTitle}
        onCreateSubsection={onCreateSubsection}
        onGenerateSubsections={onGenerateSubsections}
      />
    </aside>
  );
}