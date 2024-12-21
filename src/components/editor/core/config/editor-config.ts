import { Editor, EditorOptions } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { EditorView } from 'prosemirror-view';
import { Slice } from 'prosemirror-model';
import {
  ImprovedLstListingBlock,
  LatexSection,
  ImprovedLatexMath,
  ItemizeList,
  ListItem
} from '../extensions/latex-extensions';

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
        codeBlock: false,
        heading: false, // カスタムのLatexSectionを使用するため無効化
        bulletList: false, // カスタムのItemizeListを使用するため無効化
        listItem: false, // カスタムのListItemを使用するため無効化
        hardBreak: {}
      }),
      // コードブロックを最優先で登録
      ImprovedLstListingBlock.configure({
        HTMLAttributes: {
          class: 'latex-lstlisting',
          priority: "1000" // 高い優先度を設定
        }
      }),
      // 他の拡張機能は通常の優先度で登録
      LatexSection.configure({
        HTMLAttributes: {
          class: 'latex-section'
        },
        levels: [1, 2, 3]
      }),
      ImprovedLatexMath.configure({
        HTMLAttributes: {
          class: 'latex-math'
        }
      }),
      ItemizeList.configure({
        HTMLAttributes: {
          class: 'latex-itemize'
        }
      }),
      ListItem.configure({
        HTMLAttributes: {
          class: 'latex-item'
        }
      }),
    ],
    content: initialContent,
    editorProps: {
      attributes: {
        class: 'prose max-w-none latex-editor',
      },
      handlePaste: (view: EditorView, event: ClipboardEvent, slice: Slice) => {
        const text = event.clipboardData?.getData('text/plain');
        if (!text) return false;

        // LaTeX記法のパターン
        const patterns = {
          section: /\\(sub)*section\{([^}]+)\}/g,
          math: /\\\[([\s\S]*?)\\\]/g,
          lstlisting: /\\begin\{lstlisting\}\[language=([^\]]+)\]([\s\S]*?)\\end\{lstlisting\}/g,
          itemize: /\\begin\{itemize\}([\s\S]*?)\\end\{itemize\}/g,
          item: /\\item\s+([^\n\\]+)/g
        };

        let matched = false;
        const tr = view.state.tr;
        const pos = view.state.selection.from;

        // セクション
        const sectionMatches = Array.from(text.matchAll(patterns.section));
        if (sectionMatches.length > 0) {
          matched = true;
          sectionMatches.forEach((match) => {
            const level = ((match[1]?.length || 0) + 1) as 1 | 2 | 3;
            const title = match[2].trim();
            const node = view.state.schema.nodes.latexSection.create({
              level,
              title
            });
            tr.replaceWith(pos, pos, node);
          });
        }

        // 数式
        const mathMatches = Array.from(text.matchAll(patterns.math));
        if (mathMatches.length > 0) {
          matched = true;
          mathMatches.forEach((match) => {
            const node = view.state.schema.nodes.latexMath.create({
              content: match[1].trim()
            });
            tr.replaceWith(pos, pos, node);
          });
        }

        // コードブロック
        const codeMatches = Array.from(text.matchAll(patterns.lstlisting));
        if (codeMatches.length > 0) {
          matched = true;
          codeMatches.forEach((match) => {
            const node = view.state.schema.nodes.lstlisting.create({
              language: match[1],
              content: `\\begin{lstlisting}[language=${match[1]}]${match[2]}\\end{lstlisting}`
            });
            tr.replaceWith(pos, pos, node);
          });
        }

        // itemize環境
        const itemizeMatches = Array.from(text.matchAll(patterns.itemize));
        if (itemizeMatches.length > 0) {
          matched = true;
          itemizeMatches.forEach((match) => {
            const itemMatches = Array.from(match[1].matchAll(patterns.item));
            const items = itemMatches.map((itemMatch) =>
              view.state.schema.nodes.listItem.create(
                null,
                view.state.schema.text(itemMatch[1])
              )
            );

            const itemList = view.state.schema.nodes.itemize.create(null, items);
            tr.replaceWith(pos, pos, itemList);
          });
        }

        if (!matched) {
          tr.insertText(text);
        }

        view.dispatch(tr);
        return true;
      }
    },
    onUpdate,
    ...(callbacks || {})
  };
}