'use client';

export interface BookNode {
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
  nodes: BookNode[];
  metadata?: {
    targetAudience?: string;
    overview?: string;
    pageCount?: number;
  };
}

export interface BookMetadata {
  title: string;
  overview: string;
  targetAudience: string;
  pageCount: number;
}

export interface OrganizedNode extends BookNode {
  children: OrganizedNode[];
}