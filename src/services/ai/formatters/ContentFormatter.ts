import MarkdownIt from 'markdown-it';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';

export class ContentFormatter {
  private md: MarkdownIt;
  
  constructor() {
    this.md = new MarkdownIt({
      html: true,           // HTML タグを許可
      breaks: true,         // 改行を <br> に変換
      linkify: true,        // URLをリンクに変換
      typographer: true,    // 引用符や省略記号の変換
    })
    .enable('table')        // テーブルのサポート
    .enable('strikethrough');// 取り消し線のサポート

    // タスクリストの手動実装
    this.md.use((md) => {
      md.inline.ruler.after('emphasis', 'task-list', function taskList(state) {
        const regex = /^\[([ xX])\] /;
        const match = regex.exec(state.src.slice(state.pos));
        if (!match) return false;

        const checked = match[1].toLowerCase() === 'x';
        const token = state.push('task-list', 'input', 0);
        token.attrs = [
          ['type', 'checkbox'],
          ['disabled', 'disabled']
        ];
        if (checked) {
          token.attrs.push(['checked', 'checked']);
        }

        state.pos += match[0].length;
        return true;
      });
    });
  }

  async formatContent(content: string): Promise<string> {
    if (!content?.trim() || content.trim().length < 10) {
      throw new Error('Generated content is too short or invalid');
    }

    // thinking タグを削除
    content = this.removeThinkingTags(content);

    try {
      // unified パイプラインを使用して高度な変換を行う
      const processedContent = await unified()
        .use(remarkParse)           // Markdownをパース
        .use(remarkGfm)             // GitHub Flavored Markdownのサポート
        .use(remarkRehype)          // MarkdownをHTMLに変換
        .use(rehypeHighlight)       // コードブロックのシンタックスハイライト
        .use(rehypeStringify)       // HTMLを文字列に変換
        .process(content);

      // markdown-it で追加の処理
      let html = this.md.render(processedContent.toString());

      // 数式のサポート（必要な場合）
      html = this.processMathExpressions(html);

      return html;
    } catch (error) {
      console.error('Error formatting content:', error);
      // フォールバック: 基本的なMarkdown処理のみ
      return this.md.render(content);
    }
  }

  private removeThinkingTags(content: string): string {
    return content.replace(/<thinking>[\s\S]*?<\/thinking>/g, '').trim();
  }

  private processMathExpressions(html: string): string {
    // インライン数式の処理: $...$ -> <span class="math-inline">...</span>
    html = html.replace(/\$([^$\n]+?)\$/g, '<span class="math-inline">$1</span>');
    
    // ブロック数式の処理: $$...$$　-> <div class="math-block">...</div>
    html = html.replace(/\$\$([^$]+?)\$\$/g, '<div class="math-block">$1</div>');
    
    return html;
  }

  async formatNodes(nodes: any[]): Promise<any[]> {
    return Promise.all(nodes.map(async node => {
      const formattedNode = { ...node };
      
      if (node.content) {
        formattedNode.content = await this.formatContent(node.content);
      }
      
      if (node.children && Array.isArray(node.children)) {
        formattedNode.children = await this.formatNodes(node.children);
      }
      
      return formattedNode;
    }));
  }
}