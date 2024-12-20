import { Node, mergeAttributes } from '@tiptap/core';

export const ImprovedLstListingBlock = Node.create({
  name: 'lstlisting',
  group: 'block',
  content: 'text*',
  marks: '',
  defining: true,

  addAttributes() {
    return {
      language: {
        default: 'text',
        parseHTML: element => element.getAttribute('data-language'),
        renderHTML: attributes => {
          return {
            'data-language': attributes.language,
          };
        },
      },
      content: {
        default: '',
        parseHTML: element => element.textContent,
        renderHTML: attributes => {
          return {
            'data-content': attributes.content,
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'pre[data-type="lstlisting"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['pre', mergeAttributes(HTMLAttributes, { 'data-type': 'lstlisting' }), ['code', {}, 0]];
  },
});

export const LatexSection = Node.create({
  name: 'latexSection',
  group: 'block',
  content: 'inline*',
  defining: true,

  addAttributes() {
    return {
      level: {
        default: 1,
        parseHTML: element => parseInt(element.getAttribute('data-level') || '1'),
        renderHTML: attributes => {
          return {
            'data-level': attributes.level,
          };
        },
      },
      title: {
        default: '',
        parseHTML: element => element.getAttribute('data-title'),
        renderHTML: attributes => {
          return {
            'data-title': attributes.title,
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      { tag: 'h1[data-type="latex-section"]', attrs: { level: 1 } },
      { tag: 'h2[data-type="latex-section"]', attrs: { level: 2 } },
      { tag: 'h3[data-type="latex-section"]', attrs: { level: 3 } },
    ];
  },

  renderHTML({ node, HTMLAttributes }) {
    const level = node.attrs.level;
    return [`h${level}`, mergeAttributes(HTMLAttributes, { 'data-type': 'latex-section' }), 0];
  },
});

export const ImprovedLatexMath = Node.create({
  name: 'latexMath',
  group: 'block',
  content: 'text*',
  marks: '',
  defining: true,

  addAttributes() {
    return {
      content: {
        default: '',
        parseHTML: element => element.getAttribute('data-content'),
        renderHTML: attributes => {
          return {
            'data-content': attributes.content,
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="latex-math"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'latex-math' }), 0];
  },
});

export const ItemizeList = Node.create({
  name: 'itemize',
  group: 'block',
  content: 'listItem+',
  defining: true,

  parseHTML() {
    return [
      {
        tag: 'ul[data-type="latex-itemize"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['ul', mergeAttributes(HTMLAttributes, { 'data-type': 'latex-itemize' }), 0];
  },
});

export const ListItem = Node.create({
  name: 'listItem',
  group: 'block',
  content: 'text*',
  defining: true,

  parseHTML() {
    return [
      {
        tag: 'li[data-type="latex-item"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['li', mergeAttributes(HTMLAttributes, { 'data-type': 'latex-item' }), 0];
  },
});