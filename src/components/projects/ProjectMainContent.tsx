'use client';

import React from 'react';
import { NodeEditor } from '../editor/Editor';
import { Project } from '../../types/project';
import { EditorNode } from '../editor/core/types/node-types';

interface ProjectMainContentProps {
  project: Project;
  selectedNode: EditorNode | null | undefined;
  onGenerateContent?: (nodeId: string, bookTitle: string, targetAudience: string) => Promise<boolean>;
}

export function ProjectMainContent({
  project,
  selectedNode,
  onGenerateContent
}: ProjectMainContentProps) {
  return (
    <main className="w-2/3 p-4 overflow-y-auto h-full">
      <NodeEditor
        projectId={project.id}
        nodeId={selectedNode?.id}
        initialContent={selectedNode?.content || ''}
        selectedNode={selectedNode || null}
        bookTitle={project.name}
        targetAudience={project.metadata?.targetAudience || ''}
        onGenerateContent={onGenerateContent}
        bookMetadata={{
          title: project.name,
          targetAudience: project.metadata?.targetAudience || ''
        }}
      />
    </main>
  );
}