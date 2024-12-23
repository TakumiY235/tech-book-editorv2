import { NodeStatus, NodeType } from '@prisma/client';

export interface Node {
  id: string;
  title: string;
  content?: string;
  description?: string;
  purpose?: string;
  type: NodeType;
  status: NodeStatus;
  order: number;
  n_pages: number;
  should_split: boolean;
  
  // Relationships
  projectId: string;
  parentId: string | null;
  children?: Node[];
  
  // Metadata
  metadata: Record<string, unknown>;
  
  // Audit information
  createdBy?: string;
  lastEditedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Project {
  id: string;
  name: string;
  nodes?: Node[] | null;
  metadata?: BookMetadata;
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
  id?: string;
  projectId: string;
  parentId?: string;
  type: NodeType;
  title: string;
  description?: string;
  purpose?: string;
  content?: string;
  status?: NodeStatus;
  order: number;
  n_pages?: number;
  should_split?: boolean;
  metadata?: Record<string, unknown>;
  createdBy?: string;
  lastEditedBy?: string;
}

export interface GenerateStructureOptions {
  projectId: string;
  nodeId?: string;
  requestBody?: any;
}

// Aliases for backward compatibility
export type BookNode = Node;

// ChapterStructure型はNode型に統合されました