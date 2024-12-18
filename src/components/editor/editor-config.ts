import { Editor, EditorOptions } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { ImprovedLstListingBlock, ImprovedLatexMath } from './latex-improved-extensions';

export async function saveEditorContent(
  content: string,
  projectId: string,
  nodeId: string
): Promise<boolean> {
  try {
    const response = await fetch(`/api/projects/${projectId}/nodes/${nodeId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content }),
    });

    if (!response.ok) {
      throw new Error('Failed to save content');
    }

    return true;
  } catch (error) {
    console.error('Error saving editor content:', error);
    return false;
  }
}

export function createEditorConfig(
  initialContent: string,
  onUpdate: EditorOptions['onUpdate'],
  callbacks?: {
    onCreate?: EditorOptions['onCreate'];
    onDestroy?: EditorOptions['onDestroy'];
  }
): Partial<EditorOptions> {
  return {
    extensions: [
      StarterKit.configure({
        codeBlock: false, // カスタムのLaTeXコードブロックを使用
        hardBreak: {}
      }),
      ImprovedLstListingBlock,
      ImprovedLatexMath,
    ],
    content: initialContent,
    editorProps: {
      attributes: {
        class: 'prose max-w-none latex-editor',
      },
      handlePaste: (view, event) => {
        const text = event.clipboardData?.getData('text/plain');
        if (text) {
          // LaTeX記法を検出して適切に処理
          if (text.includes('\\begin{lstlisting}') ||
              text.includes('\\documentclass') ||
              text.includes('\\[')) {
            
            const tr = view.state.tr;
            tr.insertText(text);
            view.dispatch(tr);
            return true;
          }
        }
        return false;
      }
    },
    onUpdate,
    ...(callbacks || {})
  };
}