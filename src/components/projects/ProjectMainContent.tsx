'use client';

import React from 'react';
import { NodeEditor } from '../editor/Editor';
import { Project, BookMetadata } from '../../types/project';
import { Node } from '../editor/core/types/node-types';

interface ProjectMainContentProps {
  project: Project;
  selectedNode: Node | null | undefined;
  onGenerateContent?: (nodeId: string, metadata: BookMetadata) => Promise<boolean>;
}

export function ProjectMainContent({
  project,
  selectedNode,
  onGenerateContent
}: ProjectMainContentProps) {
  const handleGenerateContent = async (nodeId: string, metadata: BookMetadata) => {
    if (onGenerateContent) {
      return onGenerateContent(nodeId, metadata);
    }
    return false;
  };

  return (
    <main className="w-2/3 p-4 overflow-y-auto h-full">
      <NodeEditor
        projectId={project.id}
        nodeId={selectedNode?.id}
        initialContent={selectedNode?.content || ''}
        selectedNode={selectedNode || null}
        onGenerateContent={handleGenerateContent}
        bookMetadata={{
          title: project.name,
          targetAudience: project.metadata?.targetAudience || '',
          overview: project.metadata?.overview || '',
          pageCount: project.metadata?.pageCount || 0
        }}
      />
    </main>
  );
}