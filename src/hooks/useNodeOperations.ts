'use client';

import { useState } from 'react';
import { DropResult } from 'react-beautiful-dnd';
import { BookNode, Project } from './types';

export function useNodeOperations(
  project: Project,
  setProject: (project: Project) => void,
  handleNodeCreated: () => Promise<void>
) {
  const handleDeleteNode = async (nodeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const response = await fetch(`/api/projects/${project.id}/nodes/${nodeId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete node');
      }

      handleNodeCreated();
    } catch (error) {
      console.error('Error deleting node:', error);
    }
  };

  const handleUpdateNodeTitle = async (nodeId: string, newTitle: string) => {
    try {
      const response = await fetch(`/api/projects/${project.id}/nodes/${nodeId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: newTitle }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update title');
      }

      setProject(prev => ({
        ...prev,
        nodes: prev.nodes?.map(n =>
          n.id === nodeId ? { ...n, title: newTitle } : n
        ) || []
      }));
    } catch (error) {
      console.error('Error updating title:', error);
    }
  };

  const handleCreateSubsection = async (parentId: string) => {
    try {
      const response = await fetch(`/api/projects/${project.id}/nodes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: `New subsection`,
          type: 'subsection',
          parentId: parentId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create subsection');
      }

      handleNodeCreated();
    } catch (error) {
      console.error('Error creating subsection:', error);
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

    const sourceParentId = source.droppableId === 'root' ? null : source.droppableId;
    const destParentId = destination.droppableId === 'root' ? null : destination.droppableId;

    try {
      const response = await fetch(`/api/projects/${project.id}/nodes/reorder`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nodeId: draggableId,
          newOrder: destination.index,
          newParentId: destParentId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to reorder nodes');
      }

      const updatedNodes = await response.json();
      setProject(prev => ({ ...prev, nodes: updatedNodes }));
    } catch (error) {
      console.error('Error reordering nodes:', error);
    }
  };

  return {
    handleDeleteNode,
    handleUpdateNodeTitle,
    handleCreateSubsection,
    onDragEnd,
  };
}