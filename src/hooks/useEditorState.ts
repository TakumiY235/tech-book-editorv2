import { useRef, useState, useCallback } from 'react';
import { Editor } from '@tiptap/react';
import { EditorState } from '../components/editor/editor-types';

export function useEditorState(initialContent: string) {
  const contentRef = useRef<string>(initialContent);
  const [state, setState] = useState<EditorState>({
    isSaving: false,
    isGenerating: false,
    autoSaveStatus: 'Ready',
    editor: null
  });

  return {
    state,
    setState,
    contentRef
  };
}