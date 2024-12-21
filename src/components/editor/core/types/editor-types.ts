import { Editor } from '@tiptap/react';
import { BookNode } from '../../../../types/project';

export interface NodeEditorHandle {
  getContent: () => string;
}

export interface NodeEditorProps {
  initialContent: string;
  projectId: string;
  nodeId?: string;
  onSave?: () => void;
  bookTitle?: string;
  targetAudience?: string;
  onGenerateContent?: ((nodeId: string, bookTitle: string, targetAudience: string) => Promise<boolean>) | undefined;
  isEditing?: boolean;
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

export interface ContentGenerationProps {
  nodeId?: string;
  bookTitle?: string;
  targetAudience?: string;
  onGenerateContent?: (nodeId: string, bookTitle: string, targetAudience: string) => Promise<boolean>;
}

export interface GenerationResult {
  success: boolean;
  reason?: {
    hasNodeId: boolean;
    hasBookTitle: boolean;
    hasTargetAudience: boolean;
    hasOnGenerateContent: boolean;
  };
  error?: string;
}

export interface EditorStateInitialProps {
  content: string;
  fontSize?: FontSize;
}

export interface BookMetadata {
  title: string;
  targetAudience: string;
}

export interface ExtendedNodeEditorProps extends NodeEditorProps {
  selectedNode?: BookNode | null;
  bookMetadata?: BookMetadata;
}