import { Editor } from '@tiptap/react';
import { EditorNode } from './node-types';

export interface NodeEditorHandle {
  getContent: () => string;
}

export type FontSize = 'normal' | 'large' | 'x-large';

export interface EditorState {
  isSaving: boolean;
  isGenerating: boolean;
  autoSaveStatus: string;
  editor: Editor | null;
  content: string;
  isPreview: boolean;
  fontSize: FontSize;
}

export interface EditorStateInitialProps {
  content: string;
  fontSize?: FontSize;
}

export interface BookMetadata {
  title: string;
  targetAudience: string;
}

// Legacy interfaces for backward compatibility
export interface LegacyNodeEditorProps {
  projectId: string;
  nodeId?: string;
  initialContent: string;
  selectedNode: EditorNode | null;
  bookTitle?: string;
  targetAudience?: string;
  onGenerateContent?: (nodeId: string, bookTitle: string, targetAudience: string) => Promise<boolean>;
  bookMetadata?: BookMetadata;
  isEditing?: boolean;
}