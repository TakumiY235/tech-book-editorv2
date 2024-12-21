'use client';

import { useEffect } from 'react';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-python';

export function initializePrism() {
  if (typeof window !== 'undefined') {
    Prism.manual = true;
    return Prism;
  }
  return null;
}

export function highlightCode(code: string, language: string): string {
  const prism = initializePrism();
  if (!prism) return code;

  try {
    const grammar = prism.languages[language] || prism.languages.plain;
    return prism.highlight(code, grammar, language);
  } catch (error) {
    console.error('Code highlighting error:', error);
    return code;
  }
}

export default function CodeHighlighter() {
  useEffect(() => {
    initializePrism();
  }, []);

  return null;
}