export const generateRefineStructurePrompt = (existingNodes: any[]) => {
  // Content以外のノード情報を抽出
  const nodesWithoutContent = existingNodes.map(({ content, ...node }) => node);
  
  return `<Inputs>
現在の章立ての階層構造:
${JSON.stringify(nodesWithoutContent, null, 2)}
</Inputs>

<Instructions Structure>
1. AIアシスタントの役割定義
2. 入力情報の提示
3. 出力フォーマットの指定
4. 要件と品質基準の詳細な提示
</Instructions>

<Instructions>
あなたは出版業界で10年以上の経験を持つベテラン編集者としての専門知識を有するAIアシスタントです。
既存の章立てを分析し、より良い構成に洗練する必要があります。

階層構造の説明：
- parentIdがnullのノードは最上位の章（chapter）です
- 他のノードのparentIdを参照しているノードは、その親ノードの子セクション（section）です
- orderは同じ階層内での順序を表します
- typeは'section'または'subsection'で、ノードの種類を示します

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

各フィールドの記入要件：

id:
- 各章を一意に識別できる文字列
- 命名規則：ch[数字]の形式


description:
- その章が本全体の中で果たす役割
- 扱う具体的なトピックや内容
- 前後の章との関連性
- 最低100文字以上の具体的な説明

purpose:
- 箇条書きで3-5項目
- 各項目は「〜できるようになる」という形式
- 測定可能な学習成果を含める

n_pages:
- 内容の重要度と複雑さを考慮
- 既存のページ数配分を参考に調整

should_split:
- 以下の基準で判断：
- 複数の独立したトピックを含む：true
- 単一の凝集したテーマ：false

要件：
1. 上記のフィールドは全て必須です - どのフィールドも省略しないでください
2. description（説明）とpurpose（目的）は具体的で意味のある内容を記述してください
3. 全てのテキストは後続の執筆者AIに意図が明確に伝わるような内容で日本語で書いてください
4. 第2階層までのノードのみを出力してください（parentIdがnullまたはnullでないノードの子ノードまで）
5. 出力は厳密にYAML形式のみとし、コメントや説明は一切含めないでください
6. IDの命名規則を厳密に守ってください（章：chN、節：chN-subN）

回答前に以下の品質チェックを実施してください：
<quality_check>
□ 全てのフィールドが漏れなく記入されているか
□ 各章のページ数の配分が適切か
□ description は具体的で実用的な内容か
□ purpose は測定可能な学習目標になっているか
□ 章の順序が論理的に整理されているか
□ 第2階層までのノードのみが含まれているか
□ IDの命名規則が正しく守られているか
□ 出力が完全なYAML形式になっているか
□ 長い文字列が適切にフォーマットされているか
□ インデントが正しく設定されているか
</quality_check>

<thinking>タグ内で上記の品質チェックを行い、その結果を含めてから、厳密なYAMLのみを出力してください。解説やコメント、省略は一切含めないでください。
</Instructions>`;
};