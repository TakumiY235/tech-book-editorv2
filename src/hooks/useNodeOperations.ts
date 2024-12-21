'use client';

import { DropResult } from 'react-beautiful-dnd';
import { Project, BookNode, OrganizedNode } from '../types/project';
import { useAPI } from './core/useAPI';
import { handleNodeOperationsError } from './core/useErrorHandling';
import { useProjectStateManagement } from './core/useStateManagement';

export function useNodeOperations(
  project: Project,
  setProject: (project: Project | ((prev: Project) => Project)) => void,
  handleNodeCreated: () => Promise<void>
) {
  const api = useAPI();
  const { organizedNodes } = useProjectStateManagement(project);

  const handleDeleteNode = async (nodeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.deleteNode(project.id, nodeId);
      // Only call handleNodeCreated if deletion was successful
      await handleNodeCreated();
    } catch (error) {
      // Check if it's a 404 error, which means the node was already deleted
      if (error instanceof Error && error.message.includes('404')) {
        // Node was already deleted, so we should still refresh the UI
        await handleNodeCreated();
      } else {
        handleNodeOperationsError.handleDeleteError(error as Error);
      }
    }
  };

  const handleUpdateNodeTitle = async (nodeId: string, newTitle: string) => {
    try {
      await api.updateNodeTitle(project.id, nodeId, newTitle);
      setProject((prev: Project) => ({
        ...prev,
        nodes: prev.nodes?.map((n) =>
          n.id === nodeId ? { ...n, title: newTitle } : n
        ) || []
      }));
    } catch (error) {
      handleNodeOperationsError.handleUpdateTitleError(error);
    }
  };

  const handleCreateSubsection = async (parentId: string) => {
    try {
      await api.createSubsection(project.id, parentId);
      handleNodeCreated();
    } catch (error) {
      handleNodeOperationsError.handleCreateSubsectionError(error);
    }
  };

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) {
      return;
    }

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const destParentId = destination.droppableId === 'root' ? null : destination.droppableId;

    try {
      const updatedNodes = await api.reorderNodes(
        project.id,
        draggableId,
        destination.index,
        destParentId
      );
      setProject((prev: Project) => ({ ...prev, nodes: updatedNodes }));
    } catch (error) {
      handleNodeOperationsError.handleReorderError(error);
    }
  };

  return {
    handleDeleteNode,
    handleUpdateNodeTitle,
    handleCreateSubsection,
    onDragEnd,
    organizedNodes,
  };
}