import { Editor } from '@tiptap/react';
import { Node } from '../../../../types/project';

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

import { BookMetadata } from '../../../../types/project';

export interface LegacyNodeEditorProps {
  projectId: string;
  nodeId?: string;
  initialContent: string;
  selectedNode: Node | null;
  onGenerateContent?: (nodeId: string, metadata: BookMetadata) => Promise<boolean>;
  bookMetadata?: BookMetadata;
  isEditing?: boolean;
}