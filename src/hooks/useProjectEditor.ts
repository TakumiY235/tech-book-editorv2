'use client';

import { Project } from '../types/project';
import { useNodeOperations } from './useNodeOperations';
import { useProjectMetadata } from './useProjectMetadata';
import { useAIOperations } from './useAIOperations';
import { useProjectImport } from './useProjectImport';
import { useProjectStateManagement } from './core/useStateManagement';
import { handleProjectEditorError } from './core/useErrorHandling';

export function useProjectEditor(initialProject: Project) {
  const {
    project,
    selectedNodeId,
    setSelectedNodeId,
    setProject,
    organizedNodes,
    ...stateManagement
  } = useProjectStateManagement(initialProject);

  const handleNodeCreated = async () => {
    const response = await fetch(`/api/projects/${project.id}`);
    const { data } = await handleProjectEditorError.handleFetchError(response, project.id);
    setProject(data);
  };

  const nodeOperations = useNodeOperations(project, setProject, handleNodeCreated);
  const projectMetadata = useProjectMetadata(project, setProject);
  const aiOperations = useAIOperations(project, setProject, handleNodeCreated);
  const projectImport = useProjectImport(project, handleNodeCreated);

  const selectedNode = project.nodes?.find(node => node.id === selectedNodeId);

  return {
    project,
    selectedNode,
    selectedNodeId,
    setSelectedNodeId,
    handleNodeCreated,
    organizedNodes,
    ...nodeOperations,
    ...projectMetadata,
    ...aiOperations,
    ...projectImport,
    ...stateManagement
  };
}

export type { BookNode, Project } from '../types/project';