'use client';

import React from 'react';
import { CreateNodeForm } from '@/components/projects/forms/create-node-form';
import { NodeEditorPanel } from './node-editor-panel';
import { NodeList } from '@/components/projects/display/node-list';
import { useProjectEditor } from '@/hooks/useProjectEditor';
import { Project } from '@/types/project';
import { ProjectMetadataEditor } from '@/components/projects/forms/project-metadata-editor';
import { YAMLImport } from '@/components/projects/import/yaml-import';
import { StructureGenerator } from '@/components/projects/ai/structure-generator';
import { containerStyles } from '@/lib/utils/styles';

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
      {/* Left Sidebar */}
      <aside className="w-1/3 border-r border-gray-200 p-4 bg-gray-50 flex flex-col h-full">
        {/* Project Metadata Section */}
        <div className={containerStyles.section}>
          <ProjectMetadataEditor
            project={project}
            onUpdateMetadata={handleUpdateProjectMetadata}
          />
          
          {/* AI Structure Generation */}
          <div className="flex gap-2 mb-4">
            <StructureGenerator
              projectMetadata={{
                title: project.name,
                overview: project.metadata?.overview || '',
                targetAudience: project.metadata?.targetAudience || '',
                pageCount: project.metadata?.pageCount || 0
              }}
              onGenerate={generateStructureWithAI}
              onRefine={refineStructureWithAI}
              hasExistingStructure={project.nodes && project.nodes.length > 0}
            />
          </div>
          
          {/* Node Creation Tools */}
          <div className="flex gap-2 mb-4">
            <CreateNodeForm
              projectId={project.id}
              nodes={project.nodes}
              onSuccess={handleNodeCreated}
              initialTitle="New section"
              skipModal={true}
            />
            <YAMLImport
              projectId={project.id}
              onSuccess={handleNodeCreated}
            />
          </div>
        </div>

        {/* Node Tree */}
        <NodeList
          organizedNodes={organizedNodes}
          selectedNodeId={selectedNodeId}
          onDragEnd={onDragEnd}
          onSelect={setSelectedNodeId}
          onDelete={handleDeleteNode}
          onUpdateTitle={handleUpdateNodeTitle}
          onCreateSubsection={handleCreateSubsection}
          onGenerateSubsections={generateSubsectionStructure}
        />
      </aside>

      {/* Main Content Area */}
      <main className="w-2/3 p-4 overflow-y-auto h-full">
        <NodeEditorPanel
          projectId={project.id}
          selectedNode={selectedNode || null}
          onGenerateContent={generateContent}
          bookMetadata={{
            title: project.name,
            targetAudience: project.metadata?.targetAudience || ''
          }}
        />
      </main>
    </div>
  );
}