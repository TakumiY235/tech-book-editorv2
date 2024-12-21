import type { ChapterStructure } from '@/types/project';

export function generateSubsectionStructurePrompt(
  node: ChapterStructure,
  parentNodes: ChapterStructure[],
  siblingNodes: ChapterStructure[]
): string {
  // 親階層のコンテキストを構築（存在する場合のみ）
  const parentContext = parentNodes.length > 0
    ? parentNodes
        .map((parent, index) => `
${index + 1}. ${parent.title}
   説明: ${parent.description}
   目的: ${parent.purpose}`)
        .join('\n')
    : '親階層のノードはありません';

  // 同じ階層のノードのコンテキストを構築（存在する場合のみ）
  const siblingContext = siblingNodes.length > 0
    ? siblingNodes
        .map((sibling, index) => `
${index + 1}. ${sibling.title}
   説明: ${sibling.description}
   目的: ${sibling.purpose}
   ページ数: ${sibling.n_pages}`)
        .join('\n')
    : '同階層の他のノードはありません';

  return `<Inputs>
親階層のコンテキスト:
${parentContext}

同階層の他のノード情報:
${siblingContext}

分節化する章の情報:
${node.title} - タイトル
${node.description} - 章の説明
${node.purpose} - 章の目的
${node.n_pages} - 章のページ数
${node.id} - 章のID
</Inputs>
<Instructions>
あなたは出版業界で10年以上の経験を持つベテラン編集者としての専門知識を有するAIアシスタントです。以下の章を適切な粒度の節に分割します：

コンテキスト情報：

親階層のコンテキスト：
${parentContext}

同階層の他のノード：
${siblingContext}

分節化対象の章：
タイトル: ${node.title}
説明: ${node.description || '説明なし'}
目的: ${node.purpose || '目的なし'}
ページ数: ${node.n_pages || '未設定'}

注意：
- 親階層や同階層のノードが存在しない場合でも、章の内容に基づいて適切な分節化を行ってください
- コンテキストが不足している場合は、章のタイトル、説明、目的から最適な分節化を判断してください

以下のYAMLフォーマットで各節を記述してください。各節は必ず以下のフィールドを全て含める必要があります：
nodes:
  - id: [${node.id}_subNの形式]
    type: subsection
    title: [節のタイトル]
    description: [節の説明]
    purpose: [節の学習目標]
    order: [節の順序番号]
    parentId: ${node.id}
    n_pages: [予想ページ数]
    should_split: false

要件：
1. 上記のフィールドは全て必須です - どのフィールドも省略しないでください
2. description（説明）とpurpose（目的）は具体的で意味のある内容を記述してください
3. 全てのテキストは後続の執筆者AIに意図が明確に伝わるような内容で日本語で書いてください
4. n_pages（ページ数）は${node.n_pages}を節全体で超えないよう適切な値を設定してください
5. descriptionにはコンテキストを考慮したこの節の役割、ならびに節で扱う具体的な内容を説明してください
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


各フィールドの記入要件：
id:

必ず「${node.id}_subN」形式（Nは連番）
例：「${node.id}_sub1」「${node.id}_sub2」
欠番がないように連番を付与


description:

コンテキストにおける節の位置づけ
具体的な学習内容とトピック
他の節との関連性
最低80文字以上で具体的に記述


purpose:

2-3個の具体的な学習目標
「〜できるようになる」形式
親の目的との整合性を維持


n_pages:

${node.n_pages}ページを適切に配分
内容の重要度に応じて割り当て
全節の合計が親のページ数を超えない


分節化の原則：

1つのトピックを1つの節に
論理的な順序で配置
内容の依存関係を考慮
均等なページ配分を心がける



品質チェック項目：
<quality_check>
□ 全フィールドの完全な記入
□ IDとparentIDの形式チェック
□ ページ数合計の確認
□ 親章の内容の網羅性
□ 節間の論理的つながり
□ 学習目標の具体性と測定可能性
□ 説明文の具体性と十分な長さ
</quality_check>
<thinking>タグ内で以下を確認してください：

親章の内容を論理的な単位で分割できているか
各節の関係性が明確か
学習の順序として適切か
ページ配分は適切か
全ての品質チェック項目をパスしているか

確認後、YAMLフォーマットで回答を提供してください。YAMLコンテンツのみを適切なインデントで記述し、追加の説明は含めないでください。</Instructions>
`;
}