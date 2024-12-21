'use client';

import React, { useCallback, useEffect, useRef, forwardRef, useImperativeHandle, ForwardedRef, useState } from 'react';
import { useEditor, EditorContent, Editor } from '@tiptap/react';
import { EditorToolbar } from './ui/toolbar/editor-toolbar';
import { createEditorConfig } from './core/config/editor-config';
import { NodeEditorProps, EditorState, NodeEditorHandle, FontSize, ExtendedNodeEditorProps } from './core/types/editor-types';
import { useEditorState } from './hooks/useEditorState';
import { useContentGeneration } from './hooks/useContentGeneration';
import { useAutoSave } from './hooks/useAutoSave';
import { NodeMetadataForm } from '../projects/node-management/forms/node-metadata-form';
import { Button } from '../ui/button';
import { useNodeMetadata } from '../../hooks/useNodeMetadata';

export const NodeEditor = forwardRef<NodeEditorHandle, ExtendedNodeEditorProps>(
  (props: ExtendedNodeEditorProps, ref: ForwardedRef<NodeEditorHandle>) => {
    const {
      initialContent,
      projectId,
      nodeId,
      onSave,
      bookTitle,
      targetAudience,
      onGenerateContent,
      selectedNode,
      bookMetadata,
      isEditing: isEditingProp = true
    } = props;

    // State
    const [isEditing, setIsEditing] = useState(isEditingProp);
    const { state, setState, contentRef } = useEditorState({
      content: initialContent,
      fontSize: 'normal'
    });

    // Hooks
    const currentNodeId = selectedNode?.id;
    const { updateNodeMetadata, updateNodeContent } = useNodeMetadata(projectId, currentNodeId ?? null);
    const { handleGenerateContent } = useContentGeneration({
      nodeId: currentNodeId,
      bookTitle,
      targetAudience,
      onGenerateContent
    });
    const { handleSave, scheduleAutoSave } = useAutoSave(
      state.editor,
      projectId,
      currentNodeId ?? '',
      onSave
    );

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

    const handleModeToggle = async () => {
      if (isEditing) {
        const currentContent = editor?.getHTML();
        if (currentContent) {
          await updateNodeContent(currentContent);
        }
      }
      if (editor) {
        editor.setEditable(!isEditing);
      }
      setIsEditing(!isEditing);
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
    if (!selectedNode) {
      return (
        <div className="h-full flex items-center justify-center text-gray-500">
          Select a section to edit or create a new one
        </div>
      );
    }

    // Render
    return (
      <div className="h-full space-y-6">
        {/* Mode Toggle Button */}
        <div className="flex justify-end mb-4">
          <Button
            onClick={handleModeToggle}
            variant="outline"
            size="sm"
          >
            {isEditing ? 'Preview' : 'Edit'}
          </Button>
        </div>

        {/* Header */}
        {isEditing && (
          <header className="flex items-center">
            <h3 className="text-lg font-semibold">{selectedNode.title}</h3>
          </header>
        )}

        {/* Metadata Form */}
        {isEditing && (
          <NodeMetadataForm
            node={selectedNode}
            nodeType={selectedNode.type}
            nodeStatus={selectedNode.status}
            onTypeChange={(type) => {
              setTimeout(() => updateNodeMetadata(type, selectedNode.status), 0);
            }}
            onStatusChange={(status) => {
              setTimeout(() => updateNodeMetadata(selectedNode.type, status), 0);
            }}
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
                bookTitle={bookTitle}
                targetAudience={targetAudience}
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
  }
);

NodeEditor.displayName = 'NodeEditor';