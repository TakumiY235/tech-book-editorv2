import { Node } from '@tiptap/core';

export const LatexSection = Node.create({
  name: 'latexSection',
  group: 'block',
  content: 'inline*',
  defining: true,

  addAttributes() {
    return {
      level: {
        default: 1,
      },
      title: {
        default: '',
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'h1[data-type="section"]',
        getAttrs: (node) => {
          const element = node as HTMLElement;
          return {
            level: 1,
            title: element.getAttribute('data-title') || '',
          };
        },
      },
      {
        tag: 'h2[data-type="section"]',
        getAttrs: (node) => {
          const element = node as HTMLElement;
          return {
            level: 2,
            title: element.getAttribute('data-title') || '',
          };
        },
      },
      {
        tag: 'h3[data-type="section"]',
        getAttrs: (node) => {
          const element = node as HTMLElement;
          return {
            level: 3,
            title: element.getAttribute('data-title') || '',
          };
        },
      },
      {
        tag: 'div',
        getAttrs: (node) => {
          const element = node as HTMLElement;
          const content = element.textContent || '';
          
          const sectionMatch = content.match(/\\section{([^}]+)}/);
          if (sectionMatch) {
            return {
              level: 1,
              title: sectionMatch[1],
            };
          }
          
          const subsectionMatch = content.match(/\\subsection{([^}]+)}/);
          if (subsectionMatch) {
            return {
              level: 2,
              title: subsectionMatch[1],
            };
          }
          
          const subsubsectionMatch = content.match(/\\subsubsection{([^}]+)}/);
          if (subsubsectionMatch) {
            return {
              level: 3,
              title: subsubsectionMatch[1],
            };
          }
          
          return null;
        },
      },
    ];
  },

  renderHTML({ node }) {
    const tag = `h${node.attrs.level}`;
    const level = node.attrs.level;
    const title = node.attrs.title;
    let latexCommand = '';
    
    switch (level) {
      case 1:
        latexCommand = `\\section{${title}}`;
        break;
      case 2:
        latexCommand = `\\subsection{${title}}`;
        break;
      case 3:
        latexCommand = `\\subsubsection{${title}}`;
        break;
    }

    return [tag, {
      'data-type': 'section',
      'data-title': title,
      'data-latex': latexCommand,
      'class': 'latex-section'
    }, title];
  },
});