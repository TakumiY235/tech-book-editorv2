'use client';

import { useState, useRef, Dispatch, SetStateAction } from 'react';
import { Project, BookNode, Node, OrganizedNode } from '../../types/project';
import { EditorState } from '../../components/editor/core/types/editor-types';

// Types
type ProjectMetadataUpdates = {
  name?: string;
  targetAudience?: string;
  metadata?: {
    overview?: string;
    pageCount?: number;
  };
};

type NodeStatus = 'generating' | 'completed';

// Editor State Management
export function useEditorStateManagement(initialContent: string) {
  const contentRef = useRef<string>(initialContent);
  const [state, setState] = useState<EditorState>({
    isSaving: false,
    isGenerating: false,
    autoSaveStatus: 'Ready',
    editor: null,
    content: initialContent,
    isPreview: false
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
    setProject(prev => ({
      ...prev,
      ...updates,
      metadata: {
        ...prev.metadata,
        ...updates.metadata
      }
    }));
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

    // Initialize maps
    const nodeMap = new Map<string, BookNode>();
    const childrenMap = new Map<string, OrganizedNode[]>();
    nodes.forEach(node => {
      nodeMap.set(node.id, node);
      childrenMap.set(node.id, []);
    });

    // Build node hierarchy
    const rootNodes: OrganizedNode[] = [];
    nodes.forEach(node => {
      const organizedNode: OrganizedNode = {
        ...node,
        children: childrenMap.get(node.id) || []
      };

      if (node.parentId) {
        const parentChildren = childrenMap.get(node.parentId);
        if (parentChildren) {
          parentChildren.push(organizedNode);
          childrenMap.set(node.parentId, parentChildren);
        }
      } else {
        rootNodes.push(organizedNode);
      }
    });

    // Sort nodes
    const sortByOrder = (a: BookNode, b: BookNode) => a.order - b.order;
    childrenMap.forEach(children => children.sort(sortByOrder));
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