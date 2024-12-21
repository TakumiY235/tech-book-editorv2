export interface Node {
  id: string;
  title: string;
  content: string;
  description: string;
  purpose: string;
  type: 'section' | 'subsection';
  status: 'draft' | 'in_progress' | 'review' | 'completed' | 'generating';
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

// Aliases for backward compatibility
export type BookNode = Node;

export type NodeType = 'section' | 'subsection';

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