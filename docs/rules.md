---
name: Development and Coding Standards
about: TypeScript, ESLint, Prisma, Git運用およびAIへの制約ルールの定義
title: '[Doc] 開発規約・AI実装禁止事項の策定'
labels: 'scope: docs, type: setup'
assignees: ''
---

## 1. コーディング・型規約
コードの品質自動統一のため、以下のルールを厳格に適用します。

### Strict TypeScript
- `tsconfig.json` で `strict: true` を必須とします。
- **`any` 禁止令**: `any` 型の使用は全面的に禁止します。型定義が困難な場合は、適切なジェネリクス、ユニオン型、または `unknown` 型を用いた型ガードを実装してください。

### ESLint & Prettier
- **Airbnb JavaScript Style Guide** を基盤としたESLintルールを適用します。
- 保存時の自動整形、およびコミット前のLintチェックを設定します。

### 命名規則（重要）
- 機械的な文字数制限（12文字以内など）ではなく、**MDN公式ガイドライン**に準拠します。
- **「3〜10文字程度を目安としつつ、略称を避けて人間が理解できる具体的な名前（セマンティックな命名）」**を徹底してください。
  * ❌ 悪い例: `acvTitle` (略しすぎ), `aT` (意味不明), `achievementTitleName` (冗長)
  * ⭕ 良い例: `achievementTitle`, `senderName`, `senderEmail`, `skillLevel`

---

## 2. Prisma 運用ルール
- スキーマ変更時は、必ず **`api/prisma/schema.prisma`** を修正した上でマイグレーションを生成、または `npx prisma db push` を実行してください。
- 自動生成されるPrismaクライアントの型をフロントエンド（`front`）とバックエンド（`api`）で正しく共有し、二重定義を避けてください。

---

## 3. Git運用戦略
迅速な開発と秩序の両立のため、以下のブランチで運用します。
- **`develop`**: 統合用ブランチ。日常の開発・ステージング・動作確認の基準。デフォルトブランチ。
- **`feature/機能名`**: 作業用ブランチ。必ず `develop` から切り出し、完了後は `develop` へプルリクエスト（PR）を作成します。
- **`main`**: リリース済み・デプロイ対象のブランチ。Vercelの Production Branch はこのブランチを参照する。日常的な開発では触らず、デプロイのタイミングで `develop` → `main` のPRを作成してマージする。デプロイ前チェックリスト（`デプロイsetup.md` 4章）で `develop` との乖離がないことを必ず確認する。

リポジトリは `github.com/yukienozawa/portfolio`（private、動作確認完了後にpublicへ切り替え予定）で管理する。

---

## 4. AI実装時禁止事項・最小変更原則
AI（CursorやGemini等）が自律実装、またはコード生成を行う際、以下の行為を厳格に禁止します。
1. **「一度に広範囲のファイルを書き換える行為」の禁止**: 必ずIssueまたはタスク（タスク1, 2, 3...）の単位に細分化して実装をコミットしてください。
2. **未定義の外部依存関係の勝手な追加**: 新しいパッケージをインストールする場合は、必ず事前に確認を得るか、`package.json` の想定範囲内に収めてください。
3. **プレースホルダーコードの禁止**: `// TODO: あとで実装する` や `// ...既存のコード...` などの省略・未実装コードを含んだ状態でのタスク完了報告を禁止します。