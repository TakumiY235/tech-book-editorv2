export type NodeType = 'section' | 'subsection';
export type NodeStatus = 'draft' | 'in_progress' | 'review' | 'completed';

export interface EditorNode {
  id: string;
  title: string;
  content?: string;
  type: NodeType;
  status?: NodeStatus;
}

export interface NodeMetadata {
  type: NodeType;
  status: NodeStatus;
}