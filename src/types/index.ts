export interface Node {
  id: string;
  type: 'chapter' | 'section' | 'subsection';
  title: string;
  content: string;
  order: number;
  metadata: {
    summary: string;
    keywords: string[];
    status: 'draft' | 'writing' | 'review' | 'complete';
  };
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface ChatContext {
  nodeId: string;
  previousMessages: ChatMessage[];
  projectMetadata: Record<string, any>;
}