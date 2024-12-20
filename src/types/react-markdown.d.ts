declare module 'react-markdown' {
  import { ComponentType, ReactNode } from 'react';
  interface ReactMarkdownProps {
    children: string;
    className?: string;
  }
  const ReactMarkdown: ComponentType<ReactMarkdownProps>;
  export default ReactMarkdown;
} 