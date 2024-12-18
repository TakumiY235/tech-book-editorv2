import { useEditor, EditorContent } from '@tiptap/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { EditorToolbar } from '../editor/editor-toolbar';
import { createEditorConfig, saveEditorContent } from '../editor/editor-config';
import { NodeEditorProps, EditorState } from '../editor/editor-types';

export function NodeEditor({
  initialContent,
  projectId,
  nodeId,
  onSave,
  bookTitle,
  targetAudience,
  onGenerateContent
}: NodeEditorProps) {
  const [state, setState] = useState<EditorState>({
    isSaving: false,
    isGenerating: false,
    autoSaveStatus: '',
    editor: null
  });
  const saveTimeoutRef = useRef<NodeJS.Timeout>();
  const contentRef = useRef(initialContent);

  const handleSave = useCallback(async () => {
    if (!state.editor || state.isSaving) return;
    
    setState(prev => ({ ...prev, isSaving: true, autoSaveStatus: 'Saving...' }));

    try {
      const success = await saveEditorContent(contentRef.current, projectId, nodeId);
      if (!success) {
        throw new Error('Failed to save content');
      }

      setState(prev => ({ ...prev, autoSaveStatus: 'Saved' }));
      onSave?.();
    } catch (error) {
      console.error('Error saving content:', error);
      setState(prev => ({ ...prev, autoSaveStatus: 'Save failed' }));
    } finally {
      setState(prev => ({ ...prev, isSaving: false }));
    }
  }, [state.editor, projectId, nodeId, onSave]);

  const handleGenerateContent = async () => {
    if (!bookTitle || !targetAudience || !onGenerateContent || state.isGenerating) return;

    setState(prev => ({ ...prev, isGenerating: true }));
    try {
      await onGenerateContent(nodeId, bookTitle, targetAudience);
      setState(prev => ({ ...prev, autoSaveStatus: 'Content generated' }));
    } catch (error) {
      console.error('Error generating content:', error);
      setState(prev => ({ ...prev, autoSaveStatus: 'Generation failed' }));
    } finally {
      setState(prev => ({ ...prev, isGenerating: false }));
    }
  };

  const editor = useEditor(
    createEditorConfig(
      initialContent,
      ({ editor }) => {
        if (editor) {
          const content = editor.getHTML();
          const prevContent = contentRef.current;

          if (content !== prevContent) {
            contentRef.current = content;

            if (saveTimeoutRef.current) {
              clearTimeout(saveTimeoutRef.current);
            }
            saveTimeoutRef.current = setTimeout(() => {
              handleSave();
            }, 2000);
          }
        }
      },
      {
        onCreate: ({ editor }) => setState(prev => ({ ...prev, editor })),
        onDestroy: () => setState(prev => ({ ...prev, editor: null }))
      }
    )
  );

  useEffect(() => {
    if (editor && initialContent !== editor.getHTML()) {
      editor.commands.setContent(initialContent);
      contentRef.current = initialContent;
    }
  }, [editor, initialContent]);

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  if (!editor) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <EditorToolbar
          editor={editor}
          isGenerating={state.isGenerating}
          onGenerateContent={handleGenerateContent}
          bookTitle={bookTitle}
          targetAudience={targetAudience}
        />
        <span className="text-sm text-gray-500">
          {state.isGenerating ? 'Generating content...' : state.autoSaveStatus}
        </span>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
