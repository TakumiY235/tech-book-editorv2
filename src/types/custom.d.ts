declare module 'turndown' {
  export default class TurndownService {
    constructor(options?: any);
    turndown(html: string): string;
    use(plugin: any): void;
    addRule(key: string, rule: any): void;
  }
}

declare module 'turndown-plugin-gfm' {
  export const gfm: any;
}

declare module '@tiptap/extension-code-block-lowlight' {
  import { Node } from '@tiptap/core';
  export interface CodeBlockLowlightOptions {
    lowlight: any;
    defaultLanguage: string | null | undefined;
    HTMLAttributes: Record<string, any>;
    languageClassPrefix: string;
  }
  declare const CodeBlockLowlight: Node<CodeBlockLowlightOptions>;
  export default CodeBlockLowlight;
}