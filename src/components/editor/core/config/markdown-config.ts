import { EditorOptions } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import * as lowlight from 'lowlight'
import Highlight from '@tiptap/extension-highlight'
import Typography from '@tiptap/extension-typography'
import Placeholder from '@tiptap/extension-placeholder'
import Link from '@tiptap/extension-link'
import TurndownService from 'turndown'
import { gfm } from 'turndown-plugin-gfm'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import remarkRehype from 'remark-rehype'
import rehypeKatex from 'rehype-katex'
import rehypeHighlight from 'rehype-highlight'
import rehypeStringify from 'rehype-stringify'
import remarkStringify from 'remark-stringify'
import { Editor } from '@tiptap/core'
import { Node as ProsemirrorNode, Slice } from 'prosemirror-model'
import { EditorView } from 'prosemirror-view'

// 型定義
interface CodeNode extends HTMLElement {
  className: string;
}

interface TurndownRule {
  filter: string | ((node: HTMLElement) => boolean);
  replacement: (content: string, node: HTMLElement) => string;
}

// Turndownサービスの設定
const turndownService = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
  emDelimiter: '*',
  bulletListMarker: '-',
  strongDelimiter: '**',
})

// GFMプラグインを使用
turndownService.use(gfm)

// カスタムルールの追加
const lineBreaksRule: TurndownRule = {
  filter: 'br',
  replacement: (): string => '\n'
}

const codeBlocksRule: TurndownRule = {
  filter: (node: HTMLElement): boolean => {
    return (
      node.nodeName === 'PRE' &&
      node.firstChild !== null &&
      node.firstChild.nodeName === 'CODE'
    )
  },
  replacement: (content: string, node: HTMLElement): string => {
    const code = node.firstChild as CodeNode
    const language = code.className.replace('language-', '')
    return '\n```' + language + '\n' + content + '\n```\n'
  }
}

turndownService.addRule('lineBreaks', lineBreaksRule)
turndownService.addRule('codeBlocks', codeBlocksRule)

// Markdownのパース関数
export const parseMarkdown = async (content: string): Promise<string> => {
  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkMath)
    .use(remarkRehype)
    .use(rehypeKatex)
    .use(rehypeHighlight)
    .use(rehypeStringify)
    .process(content)
  
  return String(file)
}

// Markdownテキストからの変換関数
export const markdownToHtml = async (markdown: string): Promise<string> => {
  return parseMarkdown(markdown)
}

// HTMLからMarkdownへの変換関数
export const htmlToMarkdown = (html: string): string => {
  return turndownService.turndown(html)
}

// プレビューモードでのMarkdownレンダリング
export const renderMarkdownPreview = async (content: string): Promise<string> => {
  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkMath)
    .use(remarkRehype)
    .use(rehypeKatex)
    .use(rehypeStringify)
    .process(content)
  
  return String(file)
}

// エディタの設定を作成
export const createMarkdownEditorConfig = (
  initialContent: string,
  onUpdate: EditorOptions['onUpdate'],
  callbacks?: {
    onCreate?: EditorOptions['onCreate']
    onDestroy?: EditorOptions['onDestroy']
  }
): Partial<EditorOptions> => {
  return {
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3]
        },
        bulletList: {
          HTMLAttributes: {
            class: 'bullet-list'
          }
        },
        orderedList: {
          HTMLAttributes: {
            class: 'ordered-list'
          }
        },
        listItem: {
          HTMLAttributes: {
            class: 'list-item'
          }
        },
        code: {
          HTMLAttributes: {
            class: 'inline-code'
          }
        },
        hardBreak: {}
      }),
      CodeBlockLowlight.configure({
        lowlight,
        HTMLAttributes: {
          class: 'markdown-code-block',
          spellcheck: 'false'
        },
        languageClassPrefix: 'language-'
      }),
      Highlight.configure({
        multicolor: true,
        HTMLAttributes: {
          class: 'highlighted-text'
        }
      }),
      Typography,
      Placeholder.configure({
        placeholder: 'Write your content here...',
        showOnlyWhenEditable: true
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'markdown-link',
          rel: 'noopener noreferrer'
        }
      })
    ],
    content: initialContent as string,
    editorProps: {
      attributes: {
        class: 'prose max-w-none markdown-editor',
        spellcheck: 'true'
      },
      handlePaste: (view: EditorView, event: ClipboardEvent, _slice: Slice): boolean => {
        const text = event.clipboardData?.getData('text/plain')
        if (text) {
          const { state } = view
          const { schema } = state
          const textNode = schema.text(text)
          const transaction = state.tr.replaceSelectionWith(textNode)
          view.dispatch(transaction)
          return true
        }
        return false
      },
      handleDrop: (_view: Editor['view'], event: DragEvent): boolean => {
        if (event.dataTransfer?.files.length === 1) {
          return true
        }
        return false
      }
    },
    onUpdate,
    ...(callbacks || {})
  }
}

// コンテンツの保存関数
export async function saveMarkdownContent(
  content: string,
  projectId: string,
  nodeId: string
): Promise<boolean> {
  try {
    const markdownContent = htmlToMarkdown(content)
    
    const response = await fetch(`/api/projects/${projectId}/nodes/${nodeId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ content: markdownContent })
    })

    if (!response.ok) {
      throw new Error('Failed to save content')
    }

    return true
  } catch (error) {
    console.error('Error saving editor content:', error)
    return false
  }
}