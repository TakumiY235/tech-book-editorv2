'use client';

import { useState } from 'react';
import { DropResult } from 'react-beautiful-dnd';
import * as yaml from 'js-yaml';
import { ChapterStructure } from '../services/ai/types';

interface Node {
  id: string;
  title: string;
  content: string;
  description: string;
  purpose: string;
  type: 'section' | 'subsection';
  status: 'draft' | 'in_progress' | 'review' | 'completed';
  order: number;
  parentId: string | null;
  n_pages: number;
  should_split: boolean;
}

interface Project {
  id: string;
  name: string;
  nodes: Node[];
  metadata?: {
    targetAudience?: string;
  };
}

interface BookMetadata {
  title: string;
  overview: string;
  targetAudience: string;
  pageCount: number;
}

export function useProjectEditor(initialProject: Project) {
  const [project, setProject] = useState<Project>(initialProject);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const handleUpdateProjectMetadata = async (updates: { name?: string; targetAudience?: string }) => {
    try {
      const response = await fetch(`/api/projects/${project.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: updates.name,
          metadata: updates.targetAudience ? {
            targetAudience: updates.targetAudience
          } : undefined
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update project metadata');
      }

      const updatedProject = await response.json();
      setProject(updatedProject);
    } catch (error) {
      console.error('Error updating project metadata:', error);
    }
  };

  const handleNodeCreated = async () => {
    const response = await fetch(`/api/projects/${project.id}`);
    if (response.ok) {
      const updatedProject = await response.json();
      setProject(updatedProject);
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
        nodes: prev.nodes.map(n =>
          n.id === nodeId ? { ...n, title: newTitle } : n
        )
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

  const generateStructureWithAI = async (metadata: BookMetadata) => {
    try {
      const response = await fetch('/api/generate-structure', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(metadata),
      });

      if (!response.ok) {
        throw new Error('Failed to generate structure');
      }

      const nodes = await response.json() as ChapterStructure[];

      // 生成されたノードをプロジェクトに追加（親ノードから順に処理）
      const parentNodes = nodes.filter((node: ChapterStructure) => !node.parentId);
      for (const parentNode of parentNodes as ChapterStructure[]) {
        // 親ノードを追加
        const parentResponse = await fetch(`/api/projects/${project.id}/nodes`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: parentNode.title,
            type: parentNode.type,
            status: 'draft',
            content: '',
            parentId: null,
            order: parentNode.order,
            description: parentNode.description,
            purpose: parentNode.purpose,
            n_pages: parentNode.n_pages,
            should_split: parentNode.should_split,
            metadata: {
              targetAudience: metadata.targetAudience
            }
          }),
        });

        if (!parentResponse.ok) {
          throw new Error('Failed to create parent node');
        }

        const createdParentNode = await parentResponse.json();

        // 子ノードを追加
        const childNodes = nodes.filter((node: ChapterStructure) => node.parentId === parentNode.id);
        for (const childNode of childNodes as ChapterStructure[]) {
          await fetch(`/api/projects/${project.id}/nodes`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              title: childNode.title,
              type: childNode.type,
              status: 'draft',
              content: '',
              parentId: createdParentNode.id,
              order: childNode.order,
              description: childNode.description,
              purpose: childNode.purpose,
              n_pages: childNode.n_pages,
              should_split: false
            }),
          });
        }
      }
      // プロジェクトのメタデータを更新
      const metadataResponse = await fetch(`/api/projects/${project.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          metadata: {
            targetAudience: metadata.targetAudience
          }
        }),
      });

      if (!metadataResponse.ok) {
        throw new Error('Failed to update project metadata');
      }

      await handleNodeCreated();
      return true;
    } catch (error) {
      console.error('Error generating structure:', error);
      throw error;
    }
  };

  interface OrganizedNode extends Node {
    children: OrganizedNode[];
  }

  const organizeNodesRecursively = (parentId: string | null): OrganizedNode[] => {
    return project.nodes
      .filter(node => node.parentId === parentId)
      .sort((a, b) => a.order - b.order)
      .map(node => ({
        ...node,
        children: organizeNodesRecursively(node.id)
      }));
  };

  const organizedNodes = organizeNodesRecursively(null);

  const selectedNode = project.nodes.find(node => node.id === selectedNodeId);

  const importFromYaml = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`/api/projects/${project.id}/nodes/import`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to import YAML');
      }

      handleNodeCreated();
    } catch (error) {
      console.error('Error importing YAML:', error);
      throw error;
    }
  };

  const generateContent = async (nodeId: string, bookTitle: string, targetAudience: string) => {
    try {
      const response = await fetch(`/api/projects/${project.id}/nodes/${nodeId}/generate-content`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookTitle,
          targetAudience,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate content');
      }

      const updatedNode = await response.json();
      console.log('Generated content received:', updatedNode.content);
      
      setProject(prev => {
        const newProject = {
          ...prev,
          nodes: prev.nodes.map(n =>
            n.id === nodeId ? { ...n, content: updatedNode.content, status: updatedNode.status } : n
          ),
        };
        console.log('Updated project state:', newProject);
        return newProject;
      });

      return true;
    } catch (error) {
      console.error('Error generating content:', error);
      throw error;
    }
  };

  return {
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
    importFromYaml,
    generateStructureWithAI,
    generateContent,
    handleUpdateProjectMetadata,
  };
}

interface OrganizedNode extends Node {
  children: OrganizedNode[];
}

export type { Node, Project, OrganizedNode, BookMetadata };