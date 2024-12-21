import { useEditor, EditorContent, Editor } from '@tiptap/react';
import { useCallback, useEffect, useRef, forwardRef, useImperativeHandle, ForwardedRef } from 'react';
import { EditorToolbar } from '@/components/editor/ui/toolbar/editor-toolbar';
import { createEditorConfig } from '@/components/editor/core/config/editor-config';
import { NodeEditorProps, EditorState, NodeEditorHandle } from '@/components/editor/core/types/editor-types';
import { useEditorState } from '@/hooks/useEditorState';
import { useContentGeneration } from '@/hooks/useContentGeneration';
import { useAutoSave } from '@/hooks/useAutoSave';

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
      getContent: () => {
        if (editor) {
          return editor.getHTML();
        }
        return contentRef.current;
      }
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
          onCreate: ({ editor }) => {
            const content = editor.getHTML();
            contentRef.current = content;
            setState((prev: EditorState) => ({
              ...prev,
              editor,
              content
            }));
          },
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
        {props.isEditing && (
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
        )}
        <div className={`prose dark:prose-invert max-w-none ${!props.isEditing ? 'hidden' : ''}`}>
         <EditorContent editor={editor} />
       </div>
      </div>
    );
  }
);

NodeEditor.displayName = 'NodeEditor';