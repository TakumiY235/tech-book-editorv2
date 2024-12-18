import type { ChapterStructure } from '../types';

export function generateSubsectionStructurePrompt(node: ChapterStructure): string {
  return `以下の章を適切な節に分節化してください：

タイトル: ${node.title}
説明: ${node.description}
目的: ${node.purpose}
ページ数: ${node.n_pages}

以下のYAML形式で回答してください。各節は必ず以下のフィールドを全て含める必要があります：
nodes:
  - id: ${node.id}_sub1                    # 必ず「親ID_subN」の形式
    type: subsection                       # 必ず'subsection'
    title: "第1節のタイトル"               # 節のタイトル
    description: "節の詳細な説明文"         # 節の内容に関する詳細な説明
    purpose: "この節で読者が学ぶこと"       # 節の学習目標を明確に記述
    order: 1                              # 節の順序
    parentId: ${node.id}                  # 必ず現在のノードのID
    n_pages: 5                            # この節のページ数
    should_split: false                   # falseを指定
  - id: ${node.id}_sub2                    # 2番目の節の例
    type: subsection
    title: "第2節のタイトル"
    description: "節の詳細な説明文"
    purpose: "この節で読者が学ぶこと"
    order: 2
    parentId: ${node.id}
    n_pages: 4
    should_split: true or false
  # 必要な数だけ節を追加してください

要件：
1. 上記のフィールドは全て必須です - どのフィールドも省略しないでください
2. description（説明）とpurpose（目的）は具体的で意味のある内容を記述してください
3. 全てのテキストは日本語で記述してください
4. n_pages（ページ数）は${node.n_pages}を節全体で超えないよう適切な値を設定してください
5. descriptionには各節で扱う具体的な内容を説明してください
6. purposeには読者が何を学べるのかを明確に記述してください
7. これ以上の分節は行わないのでshould_splitはfalseを返してください
8. 親の内容を意味的に適切な大きさの節に分割してください
9. IDの生成規則（重要）：
   - 各節のIDは必ず「${node.id}_subN」の形式にしてください（Nは連番）
   - 例：「${node.id}_sub1」「${node.id}_sub2」「${node.id}_sub3」

10. parentIdの設定規則（重要）：
    - 全ての節のparentIdは「${node.id}」を指定してください

11. 分節化の要件（重要）：
    - 章の内容を網羅的にカバーするように、必要な数の節を全て出力してください
    - 出力を1つや2つの節に限定せず、内容を適切にカバーするために必要な数の節を全て含めてください

YAMLコンテンツのみを適切なインデントで記述してください。`;
}