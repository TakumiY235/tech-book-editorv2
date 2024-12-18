import { Editor } from '@tiptap/react';

export interface NodeEditorProps {
  initialContent: string;
  projectId: string;
  nodeId: string;
  onSave?: () => void;
  bookTitle?: string;
  targetAudience?: string;
  onGenerateContent?: (nodeId: string, bookTitle: string, targetAudience: string) => Promise<boolean>;
}

export interface EditorState {
  isSaving: boolean;
  isGenerating: boolean;
  autoSaveStatus: string;
  editor: Editor | null;
}