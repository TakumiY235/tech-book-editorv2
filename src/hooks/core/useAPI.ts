'use client';

import { BookMetadata, BookNode, Node, Project } from '../../types/project';

// Types
type ProjectMetadataUpdates = {
  name?: string;
  targetAudience?: string;
  metadata?: {
    overview?: string;
    pageCount?: number;
  };
};

type NodeType = BookNode['type'];
type NodeStatus = BookNode['status'];

// API Endpoints
const API_ENDPOINTS = {
  project: (projectId: string) => `/api/projects/${projectId}`,
  nodes: (projectId: string) => `/api/projects/${projectId}/nodes`,
  node: (projectId: string, nodeId: string) => `/api/projects/${projectId}/nodes/${nodeId}`,
  generateContent: (projectId: string, nodeId: string) => `/api/projects/${projectId}/nodes/${nodeId}/generate-content`,
  generateSubsections: (projectId: string, nodeId: string) => `/api/projects/${projectId}/nodes/${nodeId}/generate-subsections`,
  reorderNodes: (projectId: string) => `/api/projects/${projectId}/nodes/reorder`,
  importNodes: (projectId: string) => `/api/projects/${projectId}/nodes/import`,
  generateStructure: (projectId: string) => `/api/projects/${projectId}/nodes/generate-structure`,
  refineStructure: (projectId: string) => `/api/projects/${projectId}/nodes/refine-structure`
};

export function useAPI() {
  // Utility Functions
  const fetchWithError = async <T>(
    url: string,
    options: RequestInit,
    errorMessage: string
  ): Promise<T> => {
    const response = await fetch(url, options);
    
    if (!response.ok) {
      // For non-204 responses, try to get error details from response body
      if (response.status !== 204) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || `${errorMessage} (${response.status})`);
      }
      throw new Error(`${errorMessage} (${response.status})`);
    }

    // For successful DELETE operations (204 No Content)
    if (response.status === 204 || options.method === 'DELETE') {
      return undefined as T;
    }

    // For all other successful responses, parse JSON
    const result = await response.json();
    return result.data;
  };

  // Content Generation APIs
  const contentGeneration = {
    generateContent: async (
      projectId: string,
      nodeId: string,
      bookTitle: string,
      targetAudience: string
    ): Promise<BookNode> => {
      return fetchWithError(
        API_ENDPOINTS.generateContent(projectId, nodeId),
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bookTitle, targetAudience }),
        },
        'Failed to generate content'
      );
    },

    generateStructure: async (projectId: string, metadata: BookMetadata): Promise<BookNode[]> => {
      return fetchWithError(
        API_ENDPOINTS.generateStructure(projectId),
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ projectId, ...metadata }),
        },
        'Failed to generate structure'
      );
    },

    refineStructure: async (projectId: string): Promise<BookNode[]> => {
      return fetchWithError(
        API_ENDPOINTS.refineStructure(projectId),
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        },
        'Failed to refine structure'
      );
    },

    generateSubsections: async (projectId: string, nodeId: string): Promise<{ subsections: BookNode[] }> => {
      return fetchWithError(
        API_ENDPOINTS.generateSubsections(projectId, nodeId),
        { method: 'POST' },
        'Failed to generate subsections'
      );
    }
  };

  // Node Management APIs
  const nodeManagement = {
    deleteNode: async (projectId: string, nodeId: string): Promise<void> => {
      return fetchWithError(
        API_ENDPOINTS.node(projectId, nodeId),
        { method: 'DELETE' },
        'Failed to delete node'
      );
    },

    updateNodeTitle: async (projectId: string, nodeId: string, newTitle: string): Promise<void> => {
      return fetchWithError(
        API_ENDPOINTS.node(projectId, nodeId),
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: newTitle }),
        },
        'Failed to update title'
      );
    },

    updateNodeMetadata: async (projectId: string, nodeId: string, type: NodeType, status: NodeStatus): Promise<boolean> => {
      return fetchWithError(
        API_ENDPOINTS.node(projectId, nodeId),
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type, status }),
        },
        'Failed to update node metadata'
      );
    },

    updateNodeContent: async (projectId: string, nodeId: string, content: string): Promise<boolean> => {
      return fetchWithError(
        API_ENDPOINTS.node(projectId, nodeId),
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content }),
        },
        'Failed to update node content'
      );
    },

    createSubsection: async (projectId: string, parentId: string): Promise<void> => {
      return fetchWithError(
        API_ENDPOINTS.nodes(projectId),
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: 'New subsection',
            type: 'subsection',
            parentId: parentId,
          }),
        },
        'Failed to create subsection'
      );
    },

    reorderNodes: async (
      projectId: string,
      nodeId: string,
      newOrder: number,
      newParentId: string | null
    ): Promise<Node[]> => {
      return fetchWithError(
        API_ENDPOINTS.reorderNodes(projectId),
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nodeId, newOrder, newParentId }),
        },
        'Failed to reorder nodes'
      );
    }
  };

  // Project Management APIs
  const projectManagement = {
    updateProjectMetadata: async (
      projectId: string,
      updates: ProjectMetadataUpdates
    ): Promise<Project> => {
      return fetchWithError(
        API_ENDPOINTS.project(projectId),
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: updates.name,
            metadata: {
              ...(updates.targetAudience && { targetAudience: updates.targetAudience }),
              ...(updates.metadata?.overview && { overview: updates.metadata.overview }),
              ...(updates.metadata?.pageCount && { pageCount: updates.metadata.pageCount })
            }
          }),
        },
        'Failed to update project metadata'
      );
    },

    importFromYaml: async (projectId: string, file: File): Promise<void> => {
      const formData = new FormData();
      formData.append('file', file);

      return fetchWithError(
        API_ENDPOINTS.importNodes(projectId),
        {
          method: 'POST',
          body: formData,
        },
        'Failed to import YAML'
      );
    }
  };

  return {
    ...contentGeneration,
    ...nodeManagement,
    ...projectManagement,
  };
}