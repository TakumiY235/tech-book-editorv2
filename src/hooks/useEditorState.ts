import { useEditorStateManagement } from './core/useStateManagement';

export function useEditorState(initialContent: string) {
  return useEditorStateManagement(initialContent);
}