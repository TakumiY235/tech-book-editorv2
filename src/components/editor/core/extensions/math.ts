import { Node, mergeAttributes } from '@tiptap/core';
import katex from 'katex';

export interface MathOptions {
  HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    math: {
      setMath: (content: string) => ReturnType;
    };
  }
}

export const Math = Node.create<MathOptions>({
  name: 'math',

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  group: 'block',

  content: 'text*',

  atom: true,

  parseHTML() {
    return [
      {
        tag: 'div[class="math-node"]',
      },
      {
        tag: 'div',
        getAttrs: (node) => {
          if (typeof node === 'string') return false;
          const element = node as HTMLElement;
          return element.textContent?.startsWith('\\begin{') ? {} : false;
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { class: 'math-node' }), 0];
  },

  addCommands() {
    return {
      setMath:
        (content: string) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            content: [{ type: 'text', text: content }],
          });
        },
    };
  },

  addNodeView() {
    return ({ node, HTMLAttributes }: {
      node: { textContent: string },
      HTMLAttributes: Record<string, any>
    }) => {
      const dom = document.createElement('div');
      const content = node.textContent;

      Object.assign(dom, HTMLAttributes);
      dom.classList.add('math-node');

      try {
        // Markdownの数式記法をKaTeX形式に変換
        let katexContent = content;
        
        // aligned環境の処理
        if (content.includes('\\begin{aligned}')) {
          // テキストを行に分割して処理
          const lines = content.split('\n');
          katexContent = lines.map(line => {
            // 行頭の\text{...}を処理
            line = line.replace(/\\text{([^}]+)}/g, (_, text) => {
              // minimize/subject toの特別処理
              if (text.includes('minimize') || text.includes('subject to')) {
                return `\\text{${text.trim()}}\\quad`;
              }
              return `\\text{${text.trim()}}`;
            });
            
            // &記号の前後に適切なスペースを追加
            line = line.replace(/\s*&\s*/g, ' & ');
            
            // 不等号と等号の前後にスペースを追加
            line = line.replace(/([<>]=?|=)/g, ' $1 ');
            
            // カンマの後にスペースを追加
            line = line.replace(/,(?!\s)/g, ', ');
            
            // 添字と制約条件の処理
            line = line
              // i = 1,...,m の形式を処理
              .replace(/(\w+)\s*=\s*(\d+),\s*\.\.\.,\s*(\w+)/g, '$1 = $2,\\ldots,$3')
              // g_i(x) ≤ 0 の形式を処理
              .replace(/([gh])_(\w+)\((.*?)\)/g, '$1_{$2}($3)')
              // i = 1,...,m の形式を処理（カンマ付き）
              .replace(/(\w+)\s*=\s*(\d+),\s*\.\.\.,\s*(\w+),/g, '$1 = $2,\\ldots,$3,')
              // quad の追加
              .replace(/(\\text{[^}]+})\s*&/, '$1\\quad &');
            
            return line;
          }).join('\n');
        }

        katex.render(katexContent, dom, {
          throwOnError: false,
          displayMode: true,
          trust: true,
          macros: {
            '\\aligned': '\\begin{aligned}',
            '\\endaligned': '\\end{aligned}',
            '\\R': '\\mathbb{R}',
            '\\N': '\\mathbb{N}',
            '\\Z': '\\mathbb{Z}',
            '\\minimize': '\\text{minimize}\\quad',
            '\\subjectto': '\\text{subject to}\\quad',
            '\\st': '\\text{subject to}\\quad',
            '\\ldots': '\\mathinner{\\mkern2mu\\cdots\\mkern2mu}'
          },
          fleqn: true,
          minRuleThickness: 0.05,
          maxSize: 20,
          strict: (context: { type: string; text: string }) => {
            if (context.type === 'mathAtom' && context.text.includes('...')) {
              return false;
            }
            return 'warn';
          },
          output: 'html',
          leqno: false,
          colorIsTextColor: true,
          errorColor: '#cc0000'
        });
      } catch (error) {
        console.error('KaTeX rendering error:', error);
        dom.textContent = content;
      }

      return {
        dom,
        contentDOM: undefined,
      };
    };
  },
});

export const InlineMath = Node.create<MathOptions>({
  name: 'inlineMath',

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  group: 'inline',

  content: 'text*',

  inline: true,

  atom: true,

  parseHTML() {
    return [
      {
        tag: 'span[class="math-node inline"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes(HTMLAttributes, { class: 'math-node inline' }), 0];
  },

  addCommands() {
    return {
      setMath:
        (content: string) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            content: [{ type: 'text', text: content }],
          });
        },
    };
  },

  addNodeView() {
    return ({ node, HTMLAttributes }: {
      node: { textContent: string },
      HTMLAttributes: Record<string, any>
    }) => {
      const dom = document.createElement('span');
      const content = node.textContent;

      Object.assign(dom, HTMLAttributes);
      dom.classList.add('math-node', 'inline');

      try {
        katex.render(content, dom, {
          throwOnError: false,
          displayMode: false,
          trust: true,
          output: 'html',
          strict: (context: { type: string; text: string }) => {
            if (context.type === 'mathAtom' && context.text.includes('...')) {
              return false;
            }
            return 'warn';
          }
        });
      } catch (error) {
        console.error('KaTeX rendering error:', error);
        dom.textContent = content;
      }

      return {
        dom,
        contentDOM: undefined,
      };
    };
  },
});