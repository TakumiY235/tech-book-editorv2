export const generateSectionContentPrompt = (
  bookTitle: string,
  targetAudience: string,
  node: {
    title: string;
    description: string;
    purpose: string;
    n_pages: number;
  }
) => `あなたは技術書の執筆を支援する専門家AIです。以下の情報に基づいて、セクションの内容を生成してください。

本のタイトル: ${bookTitle}
対象読者: ${targetAudience}

セクション情報:
タイトル: ${node.title}
説明: ${node.description}
目的: ${node.purpose}
想定ページ数: ${node.n_pages}ページ

要件:
1. 対象読者のレベルに合わせた適切な説明と例を含めてください
2. 技術的な正確性を保ちながら、わかりやすい説明を心がけてください
3. 以下の環境を適切に使用してコンテンツを生成してください：

   a) コードサンプルの場合:
   \\begin{lstlisting}[language=使用言語]
   // コードサンプル
   \\end{lstlisting}

   例）Pythonのコード:
   \\begin{lstlisting}[language=python]
   def calculate_sum(a, b):
       return a + b
   \\end{lstlisting}

   b) 単一行の数式の場合:
   \\begin{equation}
   y = f(x)
   \\end{equation}

   例）二次方程式:
   \\begin{equation}
   ax^2 + bx + c = 0
   \\end{equation}

   c) 複数行の数式や位置揃えが必要な場合:
   \\begin{align}
   式1 &= 式2 \\\\
   &= 式3
   \\end{align}

   例）計算過程:
   \\begin{align}
   y &= 2x + 1 \\\\
   &= 2(3) + 1 \\\\
   &= 7
   \\end{align}

4. 以下のような場合は必ず適切な環境を使用してください：
   - アルゴリズムや実装例を示す場合 → lstlisting環境
   - 数学的な概念や証明を説明する場合 → equation環境
   - 計算過程や変形過程を示す場合 → align環境
   - プログラミング言語の文法説明 → lstlisting環境

5. 想定ページ数に合わせて、適切な量の内容を生成してください

出力形式:
LaTeXフォーマットで出力してください。以下の環境を適切に使用してください：
- コードブロック: \\begin{lstlisting}[language=言語名] ... \\end{lstlisting}
- 単一行の数式: \\begin{equation} ... \\end{equation}
- 複数行の数式: \\begin{align} ... \\end{align}
- 見出しは適切なレベル（\\section, \\subsection）を使用してください

セクションの内容を生成してください。`;