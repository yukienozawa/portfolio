---
name: Phase 1 Setup and Architecture
about: フロント・バック・Prisma・docsの空構造配置およびLinter/Formatter設定適用タスク
title: '[Doc] Phase 1: 初期環境構築・基本ディレクトリの自動展開'
labels: 'scope: docs, type: setup'
assignees: ''
---

# Phase概要
Phase 1は、フロントエンド（Next.js）とバックエンド（Express）の全コードベースが、AIによる自律実装時に一切迷子にならないよう、共通のフォルダ構成ツリーをトップダウンで自動展開するフェーズです。同時に、strict TypeScript（`strict: true`）およびAirbnb規約に準拠したLinter/Formatter設定を環境へ強制適用します。

# MVP対象
- プロジェクトルート直下への `front`・`api`・`docs` の厳格な空構造配置
- 各実行環境（`front` / `api`）における `tsconfig.json` の厳格モード化
- Airbnb JavaScript Style Guideに準拠した静的解析ツール（ESLint / Prettier）の設定適用

---

# Issue一覧

## [ISSUE-01] 全体ディレクトリ構造のトップダウン自動展開

### 目的
今後の実装フェーズにおいて、AI（CursorやClaude）がファイルの配置場所を自己判断で誤り、不適切なフォルダを乱立させるリスクを根絶するため。

### 実装内容
- [x] プロジェクトルート直下に `front`、`api`、`docs` のフォルダツリーを生成する。
- [x] 各ディレクトリ配下に、ドキュメントに示された中核モジュール（controllers, middlewares, layouts等）配置用のプレースホルダーおよび空ファイルを機械配置する。

### 編集ファイル
- 新規生成されたプロジェクト構造内のすべての空フォルダ・空ファイル群

### 完了条件
- [x] ルート `README.md` に定義されたフォルダ構造が、大文字小文字の差異なく完全にローカル環境に再現されていること。

### テスト内容
- ディレクトリ構造および配置空ファイルの存在チェック（合格）。

### 注意点
- フォルダ名は、環境変数や設定ファイルとの整合性を取るため、古い設計書にあった `frontend` / `backend` ではなく、必ず一律小文字の **`front`**、**`api`** を使用してください。

### 依存Issue
なし