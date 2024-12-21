'use client';

import { DropResult } from 'react-beautiful-dnd';
import { Project } from '../types/project';
import { useAPI } from './core/useAPI';
import { handleNodeOperationsError } from './core/useErrorHandling';

export function useNodeOperations(
  project: Project,
  setProject: (project: Project | ((prev: Project) => Project)) => void,
  handleNodeCreated: () => Promise<void>
) {
  const api = useAPI();

  const handleDeleteNode = async (nodeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.deleteNode(project.id, nodeId);
      handleNodeCreated();
    } catch (error) {
      handleNodeOperationsError.handleDeleteError(error);
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
  };
}