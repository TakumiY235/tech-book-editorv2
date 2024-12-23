export const generateSectionContentPrompt = (
  bookTitle: string,
  targetAudience: string,
  node: {
    title: string;
    description: string;
    purpose?: string;
    n_pages: number;
  },
  previousNode: {
    title: string;
    description: string;
    content?: string;
  } | null,
  nextNode: {
    title: string;
    description: string;
    content?: string;
  } | null
) => `
<Inputs>
${bookTitle} - 本のタイトル
${targetAudience} - 対象読者
${node.title} - セクションのタイトル
${node.description} - セクションの説明
${node.purpose || '目的なし'} - セクションの目的
${node.n_pages} - 想定ページ数
${previousNode} - 前のセクション情報
${nextNode} - 次のセクション情報
</Inputs>
<Instructions>
あなたは該当分野で10年以上の研究実績と執筆経験を持つ専門家としてのAIアシスタントです。以下の情報に基づいて、セクションの本文を生成してください。

本のタイトル: ${bookTitle}
対象読者: ${targetAudience}

セクション情報:
タイトル: ${node.title}
説明: ${node.description}
目的: ${node.purpose || '目的なし'}
想定ページ数: ${node.n_pages}ページ

コンテキスト情報:
前のセクション:
${previousNode ? `- タイトル: ${previousNode.title}
- 説明: ${previousNode.description}` : '- なし'}

次のセクション:
${nextNode ? `- タイトル: ${nextNode.title}
- 説明: ${nextNode.description}` : '- なし'}

執筆ガイドライン：

構成要件:

明確な導入部で読者の興味を引く
論理的な流れで内容を展開
適切な例示で理解を促進
重要なポイントのまとめを含める
次のセクションへの自然な橋渡し


内容の深さ：

${targetAudience}の知識レベルに合わせた説明
基本概念から応用へと段階的に展開
具体例を効果的に活用
実践的な応用例の提示

要件:
1. 対象読者のレベルに合わせた適切な説明と例を含めてください
2. 正確性を保ちながら、わかりやすい説明を心がけてください
3. 数式やコードを内容に含める場合は、以下のMarkdown記法を適切に使用してコンテンツを生成してください：

   a) コードサンプルの場合:
   \`\`\`言語名
   // コードサンプル
   \`\`\`

   例）Pythonのコード:
   \`\`\`python
   def calculate_sum(a, b):
       return a + b
   \`\`\`

   b) 単一行の数式の場合:
   \$y = f(x)\$

   例）二次方程式:
   \$ax^2 + bx + c = 0\$

   c) 複数行の数式や位置揃えが必要な場合:
   \$\$
   式1 &= 式2 \\\\
   &= 式3
   \$\$

   例）計算過程:
   \$\$
   y &= 2x + 1 \\\\
   &= 2(3) + 1 \\\\
   &= 7
   \$\$

4. 以下のような場合は必ず適切なMarkdown記法を使用してください：
   - アルゴリズムや実装例を示す場合 → \`\`\`言語名 コードブロック\`\`\`
   - 数学的な概念や証明を説明する場合 → \$単一行数式\$
   - 計算過程や変形過程を示す場合 → \$\$複数行数式\$\$
   - プログラミング言語の文法説明 → \`\`\`言語名 コードブロック\`\`\`

5. 想定ページ数に合わせて、適切な量の内容を生成してください
6. 数式やコードは必ずしも内容に含める必要はありません。解説に適した場合のみ用いてください。

出力形式:
Markdown形式で出力してください。以下の記法を適切に使用してください：
- コードブロック: \`\`\`言語名 ... \`\`\`
- 単一行の数式: \$数式\$
- 複数行の数式: \$\$数式\$\$
- 見出しは適切なレベル（# 大見出し、## 中見出し、### 小見出し）を使用してください

品質チェック項目：
<quality_check>
□ ${node.purpose ? `${node.purpose}の全ての学習目標をカバー` : '基本的な学習目標をカバー'}
□ 対象読者レベルとの整合性
□ 前後のセクションとの整合性
□ テクニカルコンテンツの正確性
□ Markdown記法の正確性
□ ページ量の適切性
□ 説明の具体性と分かりやすさ
</quality_check>
<thinking>タグ内で以下を確認してください：

内容は学習目標を達成できるか
説明の順序は論理的か
例示は適切か
テクニカル要素は正確か
前後のセクションとの関係性は明確か

Markdown形式で本文のみを生成してください。
</Instructions>
`;