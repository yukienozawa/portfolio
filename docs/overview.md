---
name: Project Overview and Architecture Setup
about: ポートフォリオ全体像、技術スタック、開発フローおよびAIへの制約事項の定義
title: '[Doc] ポートフォリオ概要・技術構成の策定'
labels: 'scope: docs, type: setup'
assignees: ''
---

## 1. プロジェクト概要
本プロジェクトは、Next.js（フロントエンド）とExpress（バックエンド）をサーバー間通信で連携させ、Prisma/MySQLでデータ管理を行う、管理画面付きのフルスタック・ポートフォリオアプリケーションです。

### MVP（Minimum Viable Product）定義
「最小限の労力でアイデアを検証する」という原則に基づき、初回のゴールを以下に限定します。
- **公開側**: プロフィールおよび実績一覧をデータベースから動的に取得・表示できること。
- **管理側**: Firebase Authenticationによるログイン後、実績のテキスト情報を登録・更新（CRUD）できること。
- **品質基準**: strict TypeScriptの遵守、Airbnb規約、MDN準拠の命名、基本単体テスト（テスト込み実装）の合格。

---

## 2. 技術構成
提供されたコンテキストおよび想定される構成に基づき、以下のスタックを採用します。

| レイヤー | 技術スタック | 補足・制約 |
| :--- | :--- | :--- |
| **Frontend** | Next.js (App Router), TypeScript | `strict: true` / 認可Middleware配置 |
| **Backend** | Express, TypeScript | サーバー間通信、型安全の担保 |
| **ORM** | Prisma | スキーマ駆動開発 |
| **Database** | MySQL | 開発時はローカルまたはコンテナ、本番はAWS（RDS） |
| **Auth** | Firebase Authentication | Admin SDKを用いたバックエンド/Middleware認可 |
| **Linter/Formatter**| ESLint (Airbnb), Prettier | 代码品質の自動統一 |
| **Cache** | Redis | ※Advanced要件（MVP完成後に導入判断） |

---

## 3. 開発方針
- **テスト込み実装の徹底**: すべての機能成果物は「テストコードが同梱されていること」をマージ条件とします。
- **セキュリティ（存在の隠蔽）**: 未認証またはAdmin権限のないユーザーが `/admin` 関連のリソースにアクセスした場合、リダイレクトではなく **HTTP 404（Not Found）** を応答し、管理画面の存在自体を隠蔽します。

---

## 4. 開発フロー図解
以下に、MVPから拡張要件にいたる実装手順をフェーズごとに一本道で表現したフロー図を示します。

```mermaid
graph TD
    %% フェーズごとのスタイル定義
    classDef phase1 fill:#f9f,stroke:#333,stroke-width:2px;
    classDef phase2 fill:#bbf,stroke:#333,stroke-width:2px;
    classDef phase3 fill:#bfb,stroke:#333,stroke-width:2px;
    classDef phase4 fill:#fbb,stroke:#333,stroke-width:2px;
    classDef phase5 fill:#ffb,stroke:#333,stroke-width:2px;

    %% Phase 1: 基盤構築（★完了！）
    P1_1[タスク1: プロジェクト初期化] --> P1_2[ESLint Airbnb / Prettier設定]
    P1_2 --> P2_1[タスク2: Prisma Schema定義 User/Achievement/Skill]
    class P1_1,P1_2 phase1;

    %% Phase 2: データ・認証基盤（★現在地）
    P2_1 --> P2_2[MySQLテーブル作成 npx prisma db push]
    P2_2 --> P3_1[タスク3: Firebase Admin SDK導入]
    P3_1 --> P3_2[認可Middleware実装 未認証時404応答]
    class P2_1,P2_2,P3_1,P3_2 phase2;

    %% Phase 3: バックエンドAPI開発
    P3_2 --> P4_1[API: GET /api/achievements 実績取得]
    P4_1 --> P4_2[API: POST /api/admin/achievements 実績登録]
    P4_2 --> P4_3[API: POST /api/contact 問い合わせ]
    class P4_1,P4_2,P4_3 phase3;

    %% Phase 4: フロントエンド実装
    P4_3 --> P5_1[Next.js App Router: 公開ページ群]
    P5_1 --> P5_2[Next.js App Router: 管理画面 /admin]
    class P5_1,P5_2 phase4;

    %% Phase 5: 機能拡張・最適化
    P5_2 --> P6_1[機能拡張: 画像保存処理の実装 Blob/Base64]
    P6_1 --> P6_2[機能拡張: Webhook通知の追加 Slack等]
    P6_2 --> P7_1[最適化: Redisキャッシュ導入検討]
    P7_1 --> P7_2[デプロイ: AWS環境への構築 HTTPS化]
    class P6_1,P6_2,P7_1,P7_2 phase5;