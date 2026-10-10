# tech-book-editorv2

AI 支援付きの技術書エディタ（Web アプリ）。Next.js 15 + TypeScript 製。
章立ての生成・本文の下書き生成を Anthropic API に任せつつ、リッチテキストエディタで加筆するという構想のプロジェクト。

> **ステータス: 開発中断（アーカイブ）**
> 2024-12-16 に着手し、2024-12-23 の 11 コミットで更新を停止しています。
> 下記「未完成な点」のとおり**現状のままでは起動しません**。保守・対応の予定はありません。
> 先行版は [TechBookEditor](https://github.com/TakumiY235/TechBookEditor)（35 ファイル、4 コミット）で、本リポジトリはその作り直しです。

## 構想していた機能

- **プロジェクト / ノード管理** — 書籍を `section` / `subsection` のツリーとして保持し、並び替え・メタデータ編集を行う
- **AI 生成** — 以下の 3 系統の API ルートを用意
  - `generate-structure` — 書籍全体の章構成を生成
  - `generate-subsections` — 任意のノード配下の小見出しを生成
  - `generate-content` — ノードの本文を生成
- **エディタ** — TipTap ベース。コードブロックのシンタックスハイライト、KaTeX による数式
- **Markdown インポート** — 既存原稿の取り込み（`api/projects/[id]/import`）

## 技術スタック

| 領域 | 採用 |
|---|---|
| フレームワーク | Next.js 15（App Router）/ React 18 / TypeScript 5 |
| エディタ | TipTap 2（starter-kit, lowlight, highlight, link, placeholder, typography） |
| Markdown / 数式 | remark, rehype, markdown-it, marked, turndown, KaTeX, Shiki, Prism |
| UI | Tailwind CSS, shadcn/ui, Radix UI, lucide-react |
| 状態管理 | Zustand, TanStack Query |
| AI | `@anthropic-ai/sdk` |
| DB | Prisma + PostgreSQL（**スキーマ未コミット**。下記参照） |
| テスト | Jest + ts-jest（**テストファイルは 0 件**） |

## 設計ドキュメント

コードより先に YAML で設計を書き出していたため、意図を追うにはこちらが手がかりになります。

- `architecture.yml` — フロント / バックのレイヤ構成
- `data-structure.yaml` — `Project` / `Node` のフィールド定義（Prisma スキーマの下書きに相当）
- `implementation-flow.yml` — 実装順序の計画
- `mock-book-structure.yaml` — 動作確認用のサンプル書籍構成

## 未完成な点（中断時点の状態）

このリポジトリを再利用・参考にする場合、以下を把握しておく必要があります。

1. **`prisma/schema.prisma` が存在しない。** `src/services/prisma/` 以下に `@prisma/client` を前提としたクライアントコード（`projectClient` / `nodeClient` / `userClient`）があるにもかかわらず、スキーマ本体が未コミットです。`prisma generate` が通らないため、**ビルド・起動はできません。** 復活させるなら `data-structure.yaml` からスキーマを書き起こす必要があります。
2. **テストが 1 件もない。** `jest.config.js` と `npm test` スクリプトは整備済みですが、`*.test.ts` / `*.spec.ts` は存在しません。
3. **`next-auth` が依存に入っているが未使用。** `src/` 内に参照箇所がなく、認証は未実装です。
4. **`.env.example` の `OPENAI_API_KEY` は未使用。** 実装されている AI クライアントは `AnthropicClient` のみです。
5. **モデル ID がハードコードされている。** `src/services/ai/AIGeneration.ts` に `claude-3-5-sonnet-20241022`（着手当時のモデル）が直接書かれています。動かす際は現行モデルへの差し替えが必要です。
6. **依存が 2024 年 12 月時点のまま。** `npm install` した場合は脆弱性・互換性の確認を推奨します。

## セットアップ（参考・現状は未完了）

```bash
pnpm install
cp .env.example .env    # DATABASE_URL と ANTHROPIC_API_KEY を設定
# prisma/schema.prisma を用意したうえで:
pnpm prisma generate && pnpm prisma migrate dev
pnpm dev
```

## ライセンス

`package.json` 上は ISC ですが、ライセンスファイルは未同梱です。
