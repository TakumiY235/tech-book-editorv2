import { NodeStatus, NodeType } from '@prisma/client';

export interface Node {
  id: string;
  title: string;
  content: string;
  description: string;
  purpose: string;
  type: NodeType;
  status: NodeStatus;
  order: number;
  parentId: string | null;
  n_pages: number;
  should_split: boolean;
}

export interface Project {
  id: string;
  name: string;
  nodes?: Node[] | null;
  metadata?: {
    targetAudience?: string;
    overview?: string;
    pageCount?: number;
  };
}

export interface OrganizedNode extends Node {
  children: OrganizedNode[];
}

export interface BookMetadata {
  title: string;
  overview: string;
  targetAudience: string;
  pageCount: number;
}

export interface NodeCreateInput {
  projectId: string;
  parentId?: string;
  type: NodeType;
  title: string;
  description?: string;
  purpose?: string;
  order: number;
  status?: NodeStatus;
  n_pages?: number;
  should_split?: boolean;
}

export interface GenerateStructureOptions {
  projectId: string;
  nodeId?: string;
  requestBody?: any;
}

// Aliases for backward compatibility
export type BookNode = Node;

export interface ChapterStructure {
  id: string;
  type: NodeType;
  title: string;
  description: string;
  purpose: string;
  content?: string;
  order: number;
  parentId: string | null;
  n_pages: number;
  should_split: boolean;
}