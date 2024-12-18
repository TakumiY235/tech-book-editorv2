import { Editor } from '@tiptap/react';
import { Button } from '../ui/button';

interface EditorToolbarProps {
  editor: Editor;
  isGenerating?: boolean;
  onGenerateContent?: () => void;
  bookTitle?: string;
  targetAudience?: string;
}

export function EditorToolbar({
  editor,
  isGenerating,
  onGenerateContent,
  bookTitle,
  targetAudience
}: EditorToolbarProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex space-x-2">
        <Button
          onClick={() => {
            const title = prompt('セクションタイトルを入力:', '新しいセクション');
            if (title) {
              editor.chain().focus().insertContent({
                type: 'latexSection',
                attrs: { level: 1, title },
                content: [{ type: 'text', text: `\\section{${title}}` }]
              }).run();
            }
          }}
          className={editor.isActive('latexSection', { level: 1 }) ? 'bg-gray-200' : ''}
          size="sm"
        >
          Section
        </Button>
        <Button
          onClick={() => {
            const title = prompt('サブセクションタイトルを入力:', '新しいサブセクション');
            if (title) {
              editor.chain().focus().insertContent({
                type: 'latexSection',
                attrs: { level: 2, title },
                content: [{ type: 'text', text: `\\subsection{${title}}` }]
              }).run();
            }
          }}
          className={editor.isActive('latexSection', { level: 2 }) ? 'bg-gray-200' : ''}
          size="sm"
        >
          Subsection
        </Button>
        <Button
          onClick={() => {
            const title = prompt('サブサブセクションタイトルを入力:', '新しいサブサブセクション');
            if (title) {
              editor.chain().focus().insertContent({
                type: 'latexSection',
                attrs: { level: 3, title },
                content: [{ type: 'text', text: `\\subsubsection{${title}}` }]
              }).run();
            }
          }}
          className={editor.isActive('latexSection', { level: 3 }) ? 'bg-gray-200' : ''}
          size="sm"
        >
          Subsubsection
        </Button>
        <div className="border-l mx-2 h-6" />
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
        <Button
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={editor.isActive('codeBlock') ? 'bg-gray-200' : ''}
          size="sm"
        >
          Code Block
        </Button>
        <div className="border-l mx-2 h-6" />
        <Button
          onClick={() => {
            editor.chain().focus().insertContent({
              type: 'equation',
              attrs: { content: '\\begin{equation}\n  y = mx + b\n\\end{equation}' },
              content: [{ type: 'text', text: '\\begin{equation}\n  y = mx + b\n\\end{equation}' }]
            }).run();
          }}
          className={editor.isActive('equation') ? 'bg-gray-200' : ''}
          size="sm"
        >
          Equation
        </Button>
        <Button
          onClick={() => {
            editor.chain().focus().insertContent({
              type: 'align',
              attrs: { content: '\\begin{align}\n  y &= mx + b \\\\\n  &= 2x + 1\n\\end{align}' },
              content: [{ type: 'text', text: '\\begin{align}\n  y &= mx + b \\\\\n  &= 2x + 1\n\\end{align}' }]
            }).run();
          }}
          className={editor.isActive('align') ? 'bg-gray-200' : ''}
          size="sm"
        >
          Align
        </Button>
        <Button
          onClick={() => {
            const language = prompt('プログラミング言語を入力:', 'python');
            if (language) {
              editor.chain().focus().insertContent({
                type: 'lstlisting',
                attrs: { 
                  language,
                  content: `\\begin{lstlisting}[language=${language}]\n  # Your code here\n\\end{lstlisting}`
                },
                content: [{ type: 'text', text: `\\begin{lstlisting}[language=${language}]\n  # Your code here\n\\end{lstlisting}` }]
              }).run();
            }
          }}
          className={editor.isActive('lstlisting') ? 'bg-gray-200' : ''}
          size="sm"
        >
          Code
        </Button>
        {onGenerateContent && bookTitle && targetAudience && (
          <div className="flex items-center ml-4">
            <Button
              onClick={onGenerateContent}
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
        )}
      </div>
    </div>
  );
}