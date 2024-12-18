export type NodeType = 'section' | 'subsection';

export interface BookMetadata {
  title: string;
  overview: string;
  targetAudience: string;
  pageCount: number;
}

export interface ChapterStructure {
  id: string;
  type: NodeType;
  title: string;
  description: string;
  purpose: string;
  order: number;
  parentId: string | null;
  n_pages: number;
  should_split: boolean;
}