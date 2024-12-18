import { Node, mergeAttributes, NodeConfig } from '@tiptap/core';
import { LatexNodeAttributes, renderLatexToString } from './latex-types';

export const EquationBlock = Node.create<NodeConfig & { attrs: LatexNodeAttributes }>({
  name: 'equation',
  group: 'block',
  content: 'text*',

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
        tag: 'div[data-type="equation"]',
        getAttrs: (node: HTMLElement) => ({
          content: node.getAttribute('data-content') || '',
        }),
      },
      {
        tag: 'div',
        getAttrs: (node: HTMLElement) => {
          const content = node.textContent || '';
          const match = content.match(/\\begin{equation}([\s\S]*?)\\end{equation}/);
          if (match) {
            return { content };
          }
          return false;
        },
      },
    ];
  },

  renderHTML({ node }) {
    const content = node.attrs.content || '';
    const equationContent = content.match(/\\begin{equation}([\s\S]*?)\\end{equation}/)?.[1] || content;
    const renderedEquation = renderLatexToString(equationContent);
    
    return ['div', mergeAttributes(
      { 'data-type': 'equation', class: 'latex-equation' },
      { 'data-content': content }
    ), ['div', { class: 'equation-content', innerHTML: renderedEquation }]];
  },
});

export const AlignBlock = Node.create<NodeConfig & { attrs: LatexNodeAttributes }>({
  name: 'align',
  group: 'block',
  content: 'text*',

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
        tag: 'div[data-type="align"]',
        getAttrs: (node: HTMLElement) => ({
          content: node.getAttribute('data-content') || '',
        }),
      },
      {
        tag: 'div',
        getAttrs: (node: HTMLElement) => {
          const content = node.textContent || '';
          const match = content.match(/\\begin{align}([\s\S]*?)\\end{align}/);
          if (match) {
            return { content };
          }
          return false;
        },
      },
    ];
  },

  renderHTML({ node }) {
    const content = node.attrs.content || '';
    const alignContent = content.match(/\\begin{align}([\s\S]*?)\\end{align}/)?.[1] || content;
    const renderedAlign = renderLatexToString(alignContent);
    
    return ['div', mergeAttributes(
      { 'data-type': 'align', class: 'latex-align' },
      { 'data-content': content }
    ), ['div', { class: 'align-content', innerHTML: renderedAlign }]];
  },
});