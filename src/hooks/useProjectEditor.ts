'use client';

import { useState } from 'react';
import { Project, BookNode } from '@/hooks/types';
import { useNodeOperations } from './useNodeOperations';
import { useProjectMetadata } from './useProjectMetadata';
import { useAIOperations } from './useAIOperations';
import { useProjectImport } from './useProjectImport';
import { useNodeOrganizer } from './useNodeOrganizer';

export function useProjectEditor(initialProject: Project) {
  const [project, setProject] = useState<Project>(initialProject);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const handleNodeCreated = async () => {
    const response = await fetch(`/api/projects/${project.id}`);
    if (response.ok) {
      const updatedProject = await response.json();
      setProject(updatedProject);
    }
  };

  const nodeOperations = useNodeOperations(project, setProject, handleNodeCreated);
  const projectMetadata = useProjectMetadata(project, setProject);
  console.log('useProjectEditor: Initializing with project:', {
    id: project.id,
    name: project.name,
    hasMetadata: !!project.metadata
  });

  const aiOperations = useAIOperations(project, setProject, handleNodeCreated);
  console.log('useProjectEditor: AI operations initialized:', {
    hasGenerateContent: !!aiOperations.generateContent,
    hasGenerateStructureWithAI: !!aiOperations.generateStructureWithAI
  });
  const projectImport = useProjectImport(project, handleNodeCreated);
  const nodeOrganizer = useNodeOrganizer(project);

  const selectedNode = project.nodes?.find(node => node.id === selectedNodeId);

  return {
    project,
    selectedNode,
    selectedNodeId,
    setSelectedNodeId,
    handleNodeCreated,
    organizedNodes: nodeOrganizer.organizedNodes,
    ...nodeOperations,
    ...projectMetadata,
    ...aiOperations,
    ...projectImport,
  };
}

export type { BookNode, Project };