import { Editor, EditorOptions } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { EditorView } from 'prosemirror-view';
import { Slice } from 'prosemirror-model';
import { Math, InlineMath } from '../extensions/math';
import 'katex/dist/katex.min.css';

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
        bulletList: {},
        orderedList: {},
        listItem: {},
        bold: {},
        italic: {},
        hardBreak: {}
      }),
      StarterKit.configure({
        history: false,
        codeBlock: {
          HTMLAttributes: {
            class: 'math-block'
          }
        }
      }),
      Math.configure({
        HTMLAttributes: {
          class: 'math-node'
        }
      }),
      InlineMath.configure({
        HTMLAttributes: {
          class: 'math-node inline'
        }
      })
    ],
    editable: true,
    parseOptions: {
      preserveWhitespace: 'full'
    },
    content: initialContent,
    editorProps: {
      attributes: {
        class: 'prose-editor-content',
        spellcheck: 'false',
      },
      handlePaste: (view: EditorView, event: ClipboardEvent, slice: Slice) => {
        const text = event.clipboardData?.getData('text/plain');
        if (!text) return false;

        const tr = view.state.tr;
        tr.insertText(text);
        view.dispatch(tr);
        return true;
      }
    },
    onUpdate,
    ...(callbacks || {})
  };
}