import { useCallback, useEffect, useRef } from 'react';
import { Editor } from '@tiptap/react';
import { saveEditorContent } from '../core/config/editor-config';

export function useAutoSave(
  editor: Editor | null,
  projectId: string,
  nodeId?: string,
  onSave?: () => void
) {
  const saveTimeoutRef = useRef<NodeJS.Timeout>();

  const handleSave = useCallback(async () => {
    if (!editor || !nodeId) return false;
    
    try {
      const content = editor.getHTML();
      const success = await saveEditorContent(content, projectId, nodeId);
      if (!success) throw new Error('Failed to save content');
      
      onSave?.();
      return true;
    } catch (error) {
      return false;
    }
  }, [editor, projectId, nodeId, onSave]);

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  const scheduleAutoSave = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = setTimeout(() => {
      handleSave();
    }, 2000);
  }, [handleSave]);

  return { handleSave, scheduleAutoSave };
}