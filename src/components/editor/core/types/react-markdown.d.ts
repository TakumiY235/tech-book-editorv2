declare module 'react-markdown' {
  import { ComponentType, ReactNode } from 'react';
  import { Plugin } from 'unified';
  
  interface ReactMarkdownProps {
    children: string;
    className?: string;
    remarkPlugins?: Plugin[];
    rehypePlugins?: Plugin[];
  }
  
  const ReactMarkdown: ComponentType<ReactMarkdownProps>;
  export default ReactMarkdown;
}