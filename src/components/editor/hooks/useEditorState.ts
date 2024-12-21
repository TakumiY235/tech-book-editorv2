import { useEditorStateManagement } from '../../../hooks/core/useStateManagement';
import { EditorStateInitialProps } from '../core/types/editor-types';

export function useEditorState({ content, fontSize = 'normal' }: EditorStateInitialProps) {
  return useEditorStateManagement({ content, fontSize });
}