import { useEditor, EditorContent, Editor } from '@tiptap/react';
import { useCallback, useEffect, useRef, forwardRef, useImperativeHandle, ForwardedRef } from 'react';
import { EditorToolbar } from '@/components/editor/editor-toolbar';
import { createEditorConfig, saveEditorContent } from '@/components/editor/editor-config';
import { NodeEditorProps, EditorState, NodeEditorHandle } from '@/components/editor/editor-types';
import { useEditorState } from '../../hooks/useEditorState';

interface ContentGenerationProps {
  nodeId: string;
  bookTitle?: string;
  targetAudience?: string;
  onGenerateContent?: (nodeId: string, bookTitle: string, targetAudience: string) => Promise<boolean>;
}

interface GenerationResult {
  success: boolean;
  reason?: {
    hasBookTitle: boolean;
    hasTargetAudience: boolean;
    hasOnGenerateContent: boolean;
  };
  error?: string;
}

function useContentGeneration({ nodeId, bookTitle, targetAudience, onGenerateContent }: ContentGenerationProps) {
  const handleGenerateContent = useCallback(async (): Promise<GenerationResult> => {
    if (!bookTitle || !targetAudience || !onGenerateContent) {
      return {
        success: false,
        reason: {
          hasBookTitle: !!bookTitle,
          hasTargetAudience: !!targetAudience,
          hasOnGenerateContent: !!onGenerateContent
        }
      };
    }

    try {
      await onGenerateContent(nodeId, bookTitle, targetAudience);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }, [nodeId, bookTitle, targetAudience, onGenerateContent]);

  return { handleGenerateContent };
}

function useAutoSave(
  editor: Editor | null,
  projectId: string,
  nodeId: string,
  onSave?: () => void
) {
  const saveTimeoutRef = useRef<NodeJS.Timeout>();

  const handleSave = useCallback(async () => {
    if (!editor) return false;
    
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

export const NodeEditor = forwardRef<NodeEditorHandle, NodeEditorProps>(
  (props: NodeEditorProps, ref: ForwardedRef<NodeEditorHandle>) => {
    const {
      initialContent,
      projectId,
      nodeId,
      onSave,
      bookTitle,
      targetAudience,
      onGenerateContent
    } = props;

    const { state, setState, contentRef } = useEditorState(initialContent);
    const { handleGenerateContent } = useContentGeneration({
      nodeId,
      bookTitle,
      targetAudience,
      onGenerateContent
    });
    const { handleSave, scheduleAutoSave } = useAutoSave(state.editor, projectId, nodeId, onSave);

    useImperativeHandle(ref, () => ({
      getContent: () => contentRef.current
    }));

    const handleEditorUpdate = useCallback(({ editor }: { editor: Editor }) => {
      if (editor) {
        const content = editor.getHTML();
        const prevContent = contentRef.current;

        if (content !== prevContent) {
          contentRef.current = content;
          setState((prev: EditorState) => ({ ...prev, content }));
          scheduleAutoSave();
        }
      }
    }, [contentRef, setState, scheduleAutoSave]);

    const handleGenerateContentWithState = async () => {
      if (state.isGenerating) return;

      setState((prev: EditorState) => ({ ...prev, isGenerating: true, autoSaveStatus: 'Generating...' }));
      const result = await handleGenerateContent();
      setState((prev: EditorState) => ({
        ...prev,
        isGenerating: false,
        autoSaveStatus: result.success ? 'Content generated' : 'Generation failed'
      }));
    };

    const editor = useEditor(
      createEditorConfig(
        initialContent,
        handleEditorUpdate,
        {
          onCreate: ({ editor }) => setState((prev: EditorState) => ({ ...prev, editor })),
          onDestroy: () => setState((prev: EditorState) => ({ ...prev, editor: null }))
        }
      )
    );

    useEffect(() => {
      if (editor && initialContent !== editor.getHTML()) {
        // Save current scroll position before updating editor content
        const scrollPos = editor.view.dom.scrollTop;
        
        editor.commands.setContent(initialContent);
        contentRef.current = initialContent;
        setState((prev: EditorState) => ({ ...prev, content: initialContent }));
        
        // Restore scroll position
        requestAnimationFrame(() => {
          if (editor && editor.view) {
            editor.view.dom.scrollTop = scrollPos;
          }
        });
      }
    }, [editor, initialContent, setState, contentRef]);

    if (!editor) {
      return null;
    }

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <EditorToolbar
            editor={editor}
            isGenerating={state.isGenerating}
            onGenerateContent={handleGenerateContentWithState}
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
);

NodeEditor.displayName = 'NodeEditor';
