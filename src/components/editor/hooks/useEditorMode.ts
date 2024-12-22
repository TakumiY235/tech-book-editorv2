import { useState, useCallback } from 'react';
import { Editor } from '@tiptap/react';

interface UseEditorModeProps {
  editor: Editor | null;
  initialMode?: boolean;
  onSave?: () => Promise<void>;
}

export function useEditorMode({ 
  editor, 
  initialMode = true,
  onSave 
}: UseEditorModeProps) {
  const [isEditing, setIsEditing] = useState(initialMode);

  const toggleMode = useCallback(async () => {
    if (isEditing && onSave) {
      await onSave();
    }
    
    if (editor) {
      editor.setEditable(!isEditing);
    }
    
    setIsEditing(!isEditing);
  }, [editor, isEditing, onSave]);

  return {
    isEditing,
    toggleMode
  };
}