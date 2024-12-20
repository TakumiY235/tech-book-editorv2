import { Editor } from '@tiptap/react';
import { BookNode } from '../../hooks/types';

export interface NodeEditorHandle {
  getContent: () => string;
}

export interface NodeEditorProps {
  node?: BookNode;
  initialContent: string;
  projectId: string;
  nodeId: string;
  onSave?: () => void;
  bookTitle?: string;
  targetAudience?: string;
  onGenerateContent?: ((nodeId: string, bookTitle: string, targetAudience: string) => Promise<boolean>) | undefined;
}

export interface EditorState {
  isSaving: boolean;
  isGenerating: boolean;
  autoSaveStatus: string;
  editor: Editor | null;
}