'use client';

import React, { useCallback, useEffect, useRef, forwardRef, useImperativeHandle, ForwardedRef } from 'react';
import { useEditor, EditorContent, Editor } from '@tiptap/react';
import { EditorToolbar } from './ui/toolbar/editor-toolbar';
import { createEditorConfig } from './core/config/editor-config';
import { EditorState, NodeEditorHandle, FontSize, LegacyNodeEditorProps } from './core/types/editor-types';
import { EditorNode, NodeType, NodeStatus } from './core/types/node-types';
import { useEditorState } from './hooks/useEditorState';
import { useContentGeneration } from './hooks/useContentGeneration';
import { useAutoSave } from './hooks/useAutoSave';
import { useEditorMetadata } from './hooks/useEditorMetadata';
import { useEditorMode } from './hooks/useEditorMode';
import { EditorMetadataForm } from './ui/metadata/editor-metadata-form';
import { EditorModeToggle } from './ui/mode/editor-mode-toggle';

interface EditorProps {
  initialContent: string;
  node: EditorNode;
  onSave?: (content: string) => void;
  onMetadataChange?: (type: NodeType, status: NodeStatus) => void;
  onGenerateContent?: () => Promise<{ success: boolean }>;
  isEditing?: boolean;
}

export const TechBookEditor = forwardRef<NodeEditorHandle, EditorProps>((props, ref) => {
  const {
    initialContent,
    node,
    onSave,
    onMetadataChange,
    onGenerateContent,
    isEditing: isEditingProp = true
  } = props;

  // State
  const { state, setState, contentRef } = useEditorState({
    content: initialContent,
    fontSize: 'normal'
  });

  // Hooks
  const { type, status, updateType, updateStatus } = useEditorMetadata({
    initialType: node.type,
    initialStatus: node.status || 'draft',
    onMetadataChange
  });

  const { handleGenerateContent } = useContentGeneration({
    onGenerateContent
  });

  const { handleSave, scheduleAutoSave } = useAutoSave({
    editor: state.editor,
    onSave
  });

  // Handlers
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

  const handleFontSizeChange = (size: FontSize) => {
    setState(prev => ({ ...prev, fontSize: size }));
  };

  // Editor Configuration
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

  // Editor Mode
  const { isEditing, toggleMode } = useEditorMode({
    editor,
    initialMode: isEditingProp,
    onSave: handleSave
  });

  const handleGenerateContentWithState = async (): Promise<{ success: boolean }> => {
    if (state.isGenerating) return { success: false };

    setState((prev: EditorState) => ({ ...prev, isGenerating: true, autoSaveStatus: 'Generating...' }));
    const result = await handleGenerateContent();
    setState((prev: EditorState) => ({
      ...prev,
      isGenerating: false,
      autoSaveStatus: result.success ? 'Content generated' : 'Generation failed'
    }));
    return result;
  };

  // Imperative Handle
  useImperativeHandle(ref, () => ({
    getContent: () => {
      if (editor) {
        return editor.getHTML();
      }
      return contentRef.current;
    }
  }));

  // Effects
  useEffect(() => {
    if (editor && initialContent !== editor.getHTML()) {
      const scrollPos = editor.view.dom.scrollTop;
      
      editor.commands.setContent(initialContent);
      contentRef.current = initialContent;
      setState((prev: EditorState) => ({ ...prev, content: initialContent }));
      
      requestAnimationFrame(() => {
        if (editor && editor.view) {
          editor.view.dom.scrollTop = scrollPos;
        }
      });
    }
  }, [editor, initialContent, setState, contentRef]);

  // Early returns
  if (!editor) return null;

  // Render
  return (
    <div className="h-full space-y-6">
      {/* Mode Toggle Button */}
      <EditorModeToggle isEditing={isEditing} onToggle={toggleMode} />

      {/* Metadata Form */}
      {isEditing && (
        <EditorMetadataForm
          node={node}
          nodeType={type}
          nodeStatus={status}
          onTypeChange={updateType}
          onStatusChange={updateStatus}
        />
      )}

      {/* Editor/Preview */}
      <div className="space-y-4">
        {isEditing && (
          <div className="flex items-center justify-between">
            <EditorToolbar
              editor={editor}
              isGenerating={state.isGenerating}
              onGenerateContent={handleGenerateContentWithState}
              fontSize={state.fontSize}
              onFontSizeChange={handleFontSizeChange}
            />
            <span className="text-sm text-gray-500">
              {state.isGenerating ? 'Generating content...' : state.autoSaveStatus}
            </span>
          </div>
        )}
        <div className="markdown-editor">
          <div className={`prose prose-slate dark:prose-invert max-w-none min-h-[200px] ${state.fontSize === 'large' ? 'text-lg' : state.fontSize === 'x-large' ? 'text-xl' : 'text-base'}`}>
            <EditorContent editor={editor} />
          </div>
        </div>
      </div>
    </div>
  );
});

// Legacy wrapper component for backward compatibility
export const NodeEditor = forwardRef<NodeEditorHandle, LegacyNodeEditorProps>((props, ref) => {
  const {
    initialContent,
    selectedNode,
    onGenerateContent,
    nodeId,
    bookTitle,
    targetAudience,
    ...restProps
  } = props;

  if (!selectedNode) return null;

  const handleGenerateContent = async () => {
    if (onGenerateContent && nodeId && bookTitle && targetAudience) {
      const success = await onGenerateContent(nodeId, bookTitle, targetAudience);
      return { success };
    }
    return { success: false };
  };

  return (
    <TechBookEditor
      ref={ref}
      initialContent={initialContent}
      node={selectedNode}
      onGenerateContent={handleGenerateContent}
      {...restProps}
    />
  );
});

TechBookEditor.displayName = 'TechBookEditor';
NodeEditor.displayName = 'NodeEditor';