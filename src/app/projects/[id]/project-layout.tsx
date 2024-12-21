'use client';

import React from 'react';
import { useProjectEditor } from '@/hooks/useProjectEditor';
import { Project } from '@/types/project';
import { ProjectSidebar } from '../../../components/projects/ProjectSidebar';
import { ProjectMainContent } from '../../../components/projects/ProjectMainContent';

interface ProjectLayoutProps {
  initialProject: Project;
}

export function ProjectLayout({ initialProject }: ProjectLayoutProps) {
  const {
    project,
    selectedNode,
    selectedNodeId,
    organizedNodes,
    setSelectedNodeId,
    handleNodeCreated,
    onDragEnd,
    handleDeleteNode,
    handleUpdateNodeTitle,
    handleCreateSubsection,
    generateContent,
    handleUpdateProjectMetadata,
    generateStructureWithAI,
    refineStructureWithAI,
    generateSubsectionStructure,
  } = useProjectEditor(initialProject);

  return (
    <div className="h-full flex overflow-hidden">
      <ProjectSidebar
        project={project}
        selectedNodeId={selectedNodeId}
        organizedNodes={organizedNodes}
        onNodeCreated={handleNodeCreated}
        onDragEnd={onDragEnd}
        onSelectNode={setSelectedNodeId}
        onDeleteNode={handleDeleteNode}
        onUpdateNodeTitle={handleUpdateNodeTitle}
        onCreateSubsection={handleCreateSubsection}
        onUpdateProjectMetadata={handleUpdateProjectMetadata}
        onGenerateStructure={generateStructureWithAI}
        onRefineStructure={refineStructureWithAI}
        onGenerateSubsections={generateSubsectionStructure}
      />
      <ProjectMainContent
        project={project}
        selectedNode={selectedNode}
        onGenerateContent={async (nodeId: string, bookTitle: string, targetAudience: string) => {
          const result = await generateContent(nodeId, bookTitle, targetAudience);
          return result;
        }}
      />
    </div>
  );
}