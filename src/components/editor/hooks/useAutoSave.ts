import { useCallback, useRef } from 'react';
import { Editor } from '@tiptap/react';

interface UseAutoSaveProps {
  editor: Editor | null;
  onSave?: (content: string) => void;
}

export function useAutoSave({ editor, onSave }: UseAutoSaveProps) {
  const timeoutRef = useRef<NodeJS.Timeout>();

  const handleSave = useCallback(async () => {
    if (!editor || !onSave) return;
    
    const content = editor.getHTML();
    onSave(content);
  }, [editor, onSave]);

  const scheduleAutoSave = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      handleSave();
    }, 1000);
  }, [handleSave]);

  return {
    handleSave,
    scheduleAutoSave
  };
}