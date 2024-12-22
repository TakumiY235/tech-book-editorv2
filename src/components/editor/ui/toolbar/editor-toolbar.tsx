'use client';

import { Editor } from '@tiptap/react';
import { Button } from '../common/button';
import { FontSize } from '../../core/types/editor-types';

export interface EditorToolbarProps {
  editor: Editor;
  isGenerating: boolean;
  onGenerateContent?: () => Promise<{ success: boolean }>;
  fontSize: FontSize;
  onFontSizeChange: (size: FontSize) => void;
}

export function EditorToolbar({
  editor,
  isGenerating,
  onGenerateContent,
  fontSize,
  onFontSizeChange
}: EditorToolbarProps) {
  if (!editor) {
    return null;
  }

  return (
    <div className="flex items-center space-x-2">
      <Button
        onClick={() => editor.chain().focus().toggleBold().run()}
        variant={editor.isActive('bold') ? 'default' : 'outline'}
        size="sm"
      >
        Bold
      </Button>
      <Button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        variant={editor.isActive('italic') ? 'default' : 'outline'}
        size="sm"
      >
        Italic
      </Button>
      <Button
        onClick={() => editor.chain().focus().toggleCode().run()}
        variant={editor.isActive('code') ? 'default' : 'outline'}
        size="sm"
      >
        Code
      </Button>
      <select
        value={fontSize}
        onChange={(e) => onFontSizeChange(e.target.value as FontSize)}
        className="h-8 rounded-md border-gray-300 text-xs"
      >
        <option value="normal">Normal</option>
        <option value="large">Large</option>
        <option value="x-large">X-Large</option>
      </select>
      {onGenerateContent && (
        <Button
          onClick={() => onGenerateContent()}
          disabled={isGenerating}
          variant="outline"
          size="sm"
        >
          {isGenerating ? 'Generating...' : 'Generate Content'}
        </Button>
      )}
    </div>
  );
}