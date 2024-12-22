'use client';

import { useState, useRef, Dispatch, SetStateAction } from 'react';
import { Project, BookNode, Node, OrganizedNode } from '../../types/project';
import { EditorState, FontSize } from '../../components/editor/core/types/editor-types';

import { BookMetadata } from '../../types/project';

// Types
type ProjectMetadataUpdates = {
  name?: string;
  metadata?: Partial<BookMetadata>;
};

type NodeStatus = 'generating' | 'completed';

// Editor State Management
interface InitialEditorState {
  content: string;
  fontSize?: FontSize;
}

export function useEditorStateManagement({ content, fontSize = 'normal' }: InitialEditorState) {
  const contentRef = useRef<string>(content);
  const [state, setState] = useState<EditorState>({
    isSaving: false,
    isGenerating: false,
    autoSaveStatus: 'Ready',
    editor: null,
    content: content,
    isPreview: false,
    fontSize
  });

  return {
    state,
    setState,
    contentRef
  };
}

// Project State Management
export function useProjectStateManagement(initialProject: Project) {
  // Core State
  const [project, setProject] = useState<Project>(initialProject);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Project Update Functions
  const updateProject = (updatedProject: Project | ((prev: Project) => Project)) => {
    setProject(updatedProject);
  };

  // Metadata Management
  const updateProjectMetadata = (updates: ProjectMetadataUpdates) => {
    setProject(prev => {
      const currentMetadata = prev.metadata || {} as BookMetadata;
      return {
        ...prev,
        name: updates.name || prev.name,
        metadata: updates.metadata ? {
          ...currentMetadata,
          ...updates.metadata
        } : currentMetadata
      };
    });
  };

  // Node Management Functions
  const nodeManagement = {
    updateTitle: (nodeId: string, newTitle: string) => {
      setProject((prev: Project) => ({
        ...prev,
        nodes: prev.nodes?.map((n: Node) =>
          n.id === nodeId ? { ...n, title: newTitle } : n
        ) || []
      }));
    },

    updateContent: (nodeId: string, updatedNode: BookNode) => {
      setProject(prev => ({
        ...prev,
        nodes: prev.nodes?.map(n =>
          n.id === nodeId ? updatedNode : n
        ) || []
      }));
    },

    updateOrder: (updatedNodes: BookNode[]) => {
      setProject(prev => ({
        ...prev,
        nodes: updatedNodes
      }));
    },

    setGeneratingStatus: (nodeId: string, status: NodeStatus) => {
      setProject(prev => ({
        ...prev,
        nodes: prev.nodes?.map(node =>
          node.id === nodeId
            ? { ...node, status } as BookNode
            : node
        ) || []
      }));
    },

    addSubsections: (parentNodeId: string, subsections: BookNode[]) => {
      setProject(prev => {
        const existingNodes = prev.nodes ?? [];
        const updatedNodes = existingNodes.map(node =>
          node.id === parentNodeId
            ? { ...node, status: 'completed' } as BookNode
            : node
        );
        return {
          ...prev,
          nodes: [...updatedNodes, ...subsections]
        };
      });
    }
  };

  // Node Organization
  const organizeNodes = (nodes?: BookNode[] | null): OrganizedNode[] => {
    if (!nodes || !nodes.length) return [];

    // Initialize node map
    const nodeMap = new Map<string, OrganizedNode>();
    nodes.forEach(node => {
      nodeMap.set(node.id, { ...node, children: [] });
    });

    // Build node hierarchy
    const rootNodes: OrganizedNode[] = [];
    nodes.forEach(node => {
      const organizedNode = nodeMap.get(node.id)!;
      
      if (node.parentId && nodeMap.has(node.parentId)) {
        // Add as child to parent node
        const parentNode = nodeMap.get(node.parentId)!;
        parentNode.children.push(organizedNode);
      } else {
        // Add to root nodes if no parent or parent not found
        rootNodes.push(organizedNode);
      }
    });

    // Sort nodes
    const sortByOrder = (a: BookNode, b: BookNode) => a.order - b.order;
    nodeMap.forEach(node => node.children.sort(sortByOrder));
    rootNodes.sort(sortByOrder);

    return rootNodes;
  };

  return {
    // Core State
    project,
    selectedNodeId,
    isGenerating,
    setProject: updateProject,
    setSelectedNodeId,
    setIsGenerating,

    // Project Management
    updateProjectMetadata,

    // Node Management
    ...nodeManagement,

    // Node Organization
    organizedNodes: organizeNodes(project.nodes)
  };
}