import katex from 'katex';
import { highlightCode } from './code-highlighter';

export interface LatexNodeAttributes {
  content: string;
}

export interface LstListingAttributes extends LatexNodeAttributes {
  language: string;
}

export function renderLatexToString(latex: string): string {
  try {
    return katex.renderToString(latex, {
      throwOnError: false,
      displayMode: true,
      strict: false
    });
  } catch (error) {
    console.error('LaTeX rendering error:', error);
    return latex;
  }
}

export function renderCode(code: string, language: string): string {
  return highlightCode(code, language);
}