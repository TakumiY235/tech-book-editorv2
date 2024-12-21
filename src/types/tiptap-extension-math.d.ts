declare module '@tiptap/extension-math' {
  import { Node } from '@tiptap/core';

  interface MathOptions {
    HTMLAttributes?: Record<string, any>;
    renderLabel?: (props: { node: { textContent: string } }) => string;
    katexOptions?: {
      throwOnError?: boolean;
      displayMode?: boolean;
      [key: string]: any;
    };
  }

  const Math: Node<MathOptions>;
  export default Math;
}