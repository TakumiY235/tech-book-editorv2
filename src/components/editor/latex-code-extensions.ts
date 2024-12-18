import { Node, mergeAttributes, NodeConfig } from '@tiptap/core';
import { LstListingAttributes, renderCode } from './latex-types';

export const LstListingBlock = Node.create<NodeConfig & { attrs: LstListingAttributes }>({
  name: 'lstlisting',
  group: 'block',
  content: 'text*',

  addAttributes() {
    return {
      language: {
        default: 'plain',
      },
      content: {
        default: '',
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="lstlisting"]',
        getAttrs: (node: HTMLElement) => ({
          content: node.getAttribute('data-content') || '',
          language: node.getAttribute('data-language') || 'plain',
        }),
      },
      {
        tag: 'div',
        getAttrs: (node: HTMLElement) => {
          const content = node.textContent || '';
          const match = content.match(/\\begin{lstlisting}\[language=([^\]]+)\]([\s\S]*?)\\end{lstlisting}/);
          if (match) {
            return {
              content,
              language: match[1],
            };
          }
          return false;
        },
      },
    ];
  },

  renderHTML({ node }) {
    const content = node.attrs.content || '';
    const language = node.attrs.language || 'plain';
    const codeContent = content.match(/\\begin{lstlisting}\[language=[^\]]+\]([\s\S]*?)\\end{lstlisting}/)?.[1] || content;
    const highlightedCode = renderCode(codeContent.trim(), language);
    
    return ['div', mergeAttributes(
      { 'data-type': 'lstlisting', class: 'latex-lstlisting' },
      { 'data-content': content, 'data-language': language }
    ), ['pre', { class: `language-${language}` }, ['code', { innerHTML: highlightedCode }]]];
  },
});