import type { BookMetadata } from '../types';

export function generateBookStructurePrompt(metadata: BookMetadata): string {
  return `以下の詳細に基づいて技術書の章立て構造を作成してください：

タイトル: ${metadata.title}
概要: ${metadata.overview}
対象読者: ${metadata.targetAudience}
総ページ数: ${metadata.pageCount}

以下のYAML形式で回答してください。各ノードは必ず以下のフィールドを全て含める必要があります：

nodes:
  - id: ch1                              # 章を識別する一意のID
    type: section                        # 'section'（章）または'subsection'（節）
    title: "はじめに"                     # 章のタイトル
    description: "章の詳細な説明文"        # 章の内容に関する詳細な説明
    purpose: "この章で読者が学ぶこと"      # 章の学習目標を明確に記述
    order: 1                             # 章の順序
    parentId: null                       # メインの章の場合はnull、節の場合は親章のID
    n_pages: 30                          # この章の予想ページ数
    should_split: true                   # この章を節に分割するかどうか

要件：
1. 上記のフィールドは全て必須です - どのフィールドも省略しないでください
2. description（説明）とpurpose（目的）は具体的で意味のある内容を記述してください - 仮の文章は避けてください
3. 全てのテキストは日本語で記述してください
4. 全ての章のn_pages（ページ数）の合計は${metadata.pageCount}ページと正確に一致させてください
5. descriptionには各章で扱う具体的な内容を説明してください
6. purposeには読者が何を学べるのかを明確に記述してください
7. should_splitでは章の内容の意味的凝集性の観点から、分節することが適切かを判断し、trueまたはfalseを返してください。
8. 分節はまだしないでください。

YAMLコンテンツのみを適切なインデントで記述してください。`;

}