import { Editor } from '@tiptap/react';
import { Button } from '../../../ui/button';

import { FontSize } from '../../core/types/editor-types';

interface EditorToolbarProps {
  editor: Editor;
  isGenerating?: boolean;
  onGenerateContent?: () => void;
  bookTitle?: string;
  targetAudience?: string;
  fontSize: FontSize;
  onFontSizeChange: (size: FontSize) => void;
}

export function EditorToolbar({
  editor,
  isGenerating,
  onGenerateContent,
  bookTitle,
  targetAudience,
  fontSize,
  onFontSizeChange
}: EditorToolbarProps) {
  console.log('EditorToolbar: Rendering with props:', {
    isGenerating,
    hasOnGenerateContent: !!onGenerateContent,
    bookTitle,
    targetAudience
  });

  return (
    <div className="flex items-center justify-between">
      <div className="flex space-x-2">
        <Button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive('bold') ? 'bg-gray-200' : ''}
          size="sm"
        >
          Bold
        </Button>
        <Button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive('italic') ? 'bg-gray-200' : ''}
          size="sm"
        >
          Italic
        </Button>
        <div className="border-l mx-2 h-6" />
        <Button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive('bulletList') ? 'bg-gray-200' : ''}
          size="sm"
        >
          • List
        </Button>
        <Button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={editor.isActive('orderedList') ? 'bg-gray-200' : ''}
          size="sm"
        >
          1. List
        </Button>
        <div className="border-l mx-2 h-6" />
        <Button
          onClick={() => {
            const formula = prompt('インライン数式を入力してください:');
            if (formula) {
              editor.chain().focus().setMath(formula).run();
            }
          }}
          size="sm"
        >
          x²
        </Button>
        <Button
          onClick={() => {
            const formula = prompt('数式ブロックを入力してください:');
            if (formula) {
              editor.chain().focus().setMath(formula).run();
            }
          }}
          size="sm"
        >
          ∑
        </Button>
        <div className="border-l mx-2 h-6" />
        <div className="flex space-x-1">
          <Button
            onClick={() => onFontSizeChange('normal')}
            className={fontSize === 'normal' ? 'bg-gray-200' : ''}
            size="sm"
          >
            A
          </Button>
          <Button
            onClick={() => onFontSizeChange('large')}
            className={fontSize === 'large' ? 'bg-gray-200' : ''}
            size="sm"
          >
            A+
          </Button>
          <Button
            onClick={() => onFontSizeChange('x-large')}
            className={fontSize === 'x-large' ? 'bg-gray-200' : ''}
            size="sm"
          >
            A++
          </Button>
        </div>
        {(() => {
          const canShowAIButton = onGenerateContent && bookTitle && targetAudience;
          console.log('EditorToolbar: AI button conditions:', {
            hasOnGenerateContent: !!onGenerateContent,
            hasBookTitle: !!bookTitle,
            hasTargetAudience: !!targetAudience,
            canShowAIButton
          });
          
          if (canShowAIButton) {
            return (
              <div className="flex items-center ml-4">
                <Button
                  onClick={() => {
                    console.log('EditorToolbar: AI生成ボタンがクリックされました');
                    onGenerateContent();
                  }}
                  disabled={isGenerating}
                  size="sm"
                  className="flex items-center gap-2"
                  variant={isGenerating ? "outline" : "default"}
                >
                  {isGenerating ? (
                    <>
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>生成中...</span>
                    </>
                  ) : (
                    <>
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      <span>AIで生成</span>
                    </>
                  )}
                </Button>
              </div>
            );
          }
          return null;
        })()}
      </div>
    </div>
  );
}