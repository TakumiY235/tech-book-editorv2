import { Node, mergeAttributes, NodeConfig } from '@tiptap/core';
import { LatexNodeAttributes } from './latex-types';

export const EnumerateList = Node.create<NodeConfig & { attrs: LatexNodeAttributes }>({
  name: 'enumerate',
  group: 'block',
  content: 'listItem+',

  addAttributes() {
    return {
      content: {
        default: '',
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'ol[data-type="enumerate"]',
        getAttrs: (node: HTMLElement) => ({
          content: node.getAttribute('data-content') || '',
        }),
      },
      {
        tag: 'div',
        getAttrs: (node: HTMLElement) => {
          const content = node.textContent || '';
          const match = content.match(/\\begin{enumerate}([\s\S]*?)\\end{enumerate}/);
          if (match) {
            return { content };
          }
          return null;
        },
      },
    ];
  },

  renderHTML({ node }) {
    return ['ol', mergeAttributes(
      { 'data-type': 'enumerate', class: 'latex-enumerate' },
      { 'data-content': node.attrs.content }
    ), 0];
  },
});

export const ItemizeList = Node.create<NodeConfig & { attrs: LatexNodeAttributes }>({
  name: 'itemize',
  group: 'block',
  content: 'listItem+',

  addAttributes() {
    return {
      content: {
        default: '',
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'ul[data-type="itemize"]',
        getAttrs: (node: HTMLElement) => ({
          content: node.getAttribute('data-content') || '',
        }),
      },
      {
        tag: 'div',
        getAttrs: (node: HTMLElement) => {
          const content = node.textContent || '';
          const match = content.match(/\\begin{itemize}([\s\S]*?)\\end{itemize}/);
          if (match) {
            return { content };
          }
          return null;
        },
      },
    ];
  },

  renderHTML({ node }) {
    return ['ul', mergeAttributes(
      { 'data-type': 'itemize', class: 'latex-itemize' },
      { 'data-content': node.attrs.content }
    ), 0];
  },
});

export const ListItem = Node.create<NodeConfig & { attrs: LatexNodeAttributes }>({
  name: 'listItem',
  group: 'block',
  content: 'inline*',
  defining: true,

  addAttributes() {
    return {
      content: {
        default: '',
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'li',
        getAttrs: (node: HTMLElement) => ({
          content: node.getAttribute('data-content') || '',
        }),
      },
      {
        tag: 'div',
        getAttrs: (node: HTMLElement) => {
          const content = node.textContent || '';
          if (content.startsWith('\\item')) {
            return { content };
          }
          return null;
        },
      },
    ];
  },

  renderHTML({ node }) {
    const content = node.attrs.content || '';
    const itemContent = content.replace(/^\\item\s*/, '');
    return ['li', mergeAttributes(
      { class: 'latex-item' },
      { 'data-content': content }
    ), itemContent];
  },
});