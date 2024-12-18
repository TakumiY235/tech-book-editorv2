import { Node, mergeAttributes } from '@tiptap/core';
import katex from 'katex';
import Prism from 'prismjs';

// LaTeX数式処理用のヘルパー関数
function processLatexContent(content: string) {
  // documentclass環境の処理
  const docClassMatch = content.match(/\\documentclass{.*}([\s\S]*?)\\end{document}/m);
  if (docClassMatch) {
    content = docClassMatch[1].trim();
  }

  // 数式環境の処理
  const mathMatch = content.match(/\\\[([\s\S]*?)\\\]/m);
  if (mathMatch) {
    try {
      return katex.renderToString(mathMatch[1].trim(), {
        displayMode: true,
        throwOnError: false
      });
    } catch (error) {
      console.error('KaTeX rendering error:', error);
      return content;
    }
  }

  return content;
}

// コードブロック処理用の拡張
export const ImprovedLstListingBlock = Node.create({
  name: 'lstlisting',
  group: 'block',
  content: 'text*',
  isolating: true,

  addAttributes() {
    return {
      language: {
        default: 'plain',
      },
      content: {
        default: '',
      }
    };
  },

  parseHTML() {
    return [
      {
        tag: 'pre[data-type="lstlisting"]',
        getAttrs: (node) => {
          if (typeof node === 'string') return {};
          const element = node as HTMLElement;
          return {
            language: element.getAttribute('data-language') || 'plain',
            content: element.textContent || ''
          };
        }
      }
    ];
  },

  renderHTML({ node }) {
    const content = node.attrs.content || '';
    // LaTeXスタイルのコードブロックを検出
    const match = content.match(/\\begin{lstlisting}\[language=([^\]]+)\]([\s\S]*?)\\end{lstlisting}/);
    
    if (match) {
      const language = match[1];
      const code = match[2].trim();
      const highlighted = Prism.highlight(
        code,
        Prism.languages[language] || Prism.languages.plain,
        language
      );

      return ['pre', {
        'data-type': 'lstlisting',
        'data-language': language,
        class: `language-${language} latex-lstlisting`
      }, ['code', {
        innerHTML: highlighted
      }]];
    }

    return ['pre', {
      'data-type': 'lstlisting',
      class: 'latex-block'
    }, content];
  }
});

// LaTeX数式処理用の拡張
export const ImprovedLatexMath = Node.create({
  name: 'latexmath',
  group: 'block',
  content: 'text*',
  isolating: true,

  addAttributes() {
    return {
      content: {
        default: ''
      }
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="latexmath"]'
      }
    ];
  },

  renderHTML({ node }) {
    const content = node.attrs.content || '';
    const rendered = processLatexContent(content);

    return ['div', {
      'data-type': 'latexmath',
      class: 'latex-math',
      innerHTML: rendered
    }];
  }
});