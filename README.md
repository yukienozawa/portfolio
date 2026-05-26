---
name: Root README Setup
about: プロジェクトのルートに配置し、概要、セットアップ、開発・テスト手順、規約を網羅する総合ガイド
title: 'Setup: ルートREADME.mdの初期バージョン作成'
labels: documentation, setup
assignees: ''
---

# ポートフォリオ開発プロジェクト (Fullstack Portfolio)

本プロジェクトは、Next.js（フロントエンド）とExpress（バックエンド）をサーバー間通信で連携させ、Prisma/MySQLでデータ管理を行う、管理画面付きフルスタック・ポートフォリオアプリケーションです。

---

## 概要

開発・運用において「コード品質の自動統一」と「セマンティックな設計」を重視し、堅牢かつ運用のしやすいポートフォリオ基盤を目指します。
ルート配下の `docs/` ディレクトリに格納された設計書（`overview.md`, `api.md`, `db.md`, `rules.md`, `test.md`, `screens.md`）を唯一の信頼できるソース（真実のソース）とし、コードの成長とともに段階的にドキュメントをアップデートしていく方針（Docs as Code）を採用しています。

---

## MVP (Minimum Viable Product)

「最小限の労力でアイデアを検証する」という原則に基づき、初回のゴールを以下に限定します。

* **公開側**: プロフィールおよび実績一覧をデータベースから動的に取得・表示できること。
* **管理側**: Firebase Authenticationによるログイン後、実績のテキスト情報を登録・更新（CRUD）できること。
* **品質**: strict TypeScript、Airbnb規約、MDN準拠のセマンティックな命名、基本単体テストの合格。

---

## 技術構成

`package.json` および基本設計に準拠した主要な技術スタックです。

* **フロントエンド**: Next.js (App Router) / TypeScript (`strict: true`)
* **バックエンド**: Express / TypeScript
* **データベース / ORM**: MySQL / Prisma
* **認証・認可**: Firebase Authentication (Firebase Admin SDK)
* **静的解析・整形**: ESLint (Airbnb JavaScript Style Guide) / Prettier
* **テスト**: Vitest (Unit / API), Cypress (E2E)
* **インフラ（Advanced）**: AWS (HTTPS環境), Redis（※MVP完成後に導入判断）

---

## セットアップ

リポジトリをクローンした後、初心者の方でも以下の手順で環境構築から起動までを行えるように設計されています。

### 1. 依存関係のインストール
プロジェクトのルート、および各サブディレクトリ（`/frontend`, `/backend`）にてパッケージをインストールします。
```bash
# 各モジュール配下で実行
npm install
```
### 2. データベースの起動・初期化
ローカル環境のMySQLが起動していることを確認し、Prismaを使用してスキーマを反映・型定義の生成を行います。
```Bash
# prismaディレクトリが存在する場所、またはルートから実行
npx prisma db push
```

### 3. 環境変数
ローカル開発を開始する前に、以下の環境変数ファイルをそれぞれの配置先に作成。

#### バックエンド環境変数 (/backend/.env)
```
# データベース接続文字列 (MySQL)
DATABASE_URL="mysql://root:password@localhost:3306/portfolio_db"

# Firebase Admin SDK 設定 (JSONキーへのパス)
FIREBASE_CONFIG_PATH="./firebase-adminsdk-key.json"

# Webhook通知 (Slack等)
NOTIFICATION_WEBHOOK_URL="https://hooks.slack.com/services/..."
```

#### フロントエンド環境変数 (/frontend/.env.local)
```
# バックエンドAPIの基本URL
NEXT_PUBLIC_API_BASE_URL="http://localhost:5000"

# Firebase クライアントサイドSDK設定
NEXT_PUBLIC_FIREBASE_API_KEY="AIzaSy..."
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your-app.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-app"
```

### 4.  実行方法
ローカル開発サーバーを起動する手順です。

バックエンド (Express) の起動
```bash
cd backend
npm run dev
```
デフォルトでは http://localhost:5000 でAPIが起動。

フロントエンド (Next.js) の起動
```bash
cd frontend
npm run dev
```
ブラウザで http://localhost:3000 にアクセスします。

#### テスト方法
本プロジェクトは「テスト込み実装」を大前提としています。成果物には必ずテストコードを同梱してください。

#### 単体・APIテストの実行 (Vitest)
```bash
# バックエンドまたはフロントエンドのテストスクリプトを実行
npm run test
```

#### E2Eテストの実行 (Cypress)
```bash
# フロントエンド側で実行（開発サーバーが起動している必要があります）
npm run test:e2e
```
### 5. ディレクトリ構成
```
/
├── /frontend (Next.js)
│   └── /src
│       ├── /app
│       │   └── /admin/       # 認可に守られた管理画面エリア
│       └── middleware.ts     # Next.js用のルーティング保護ミドルウェア
│
├── /backend (Express)
│   └── /src
│       ├── /controllers/     # 3〜10文字目安の命名を徹底するコントローラー層
│       └── /middlewares/     # Firebase Admin SDKによる認可ミドルウェア層
│
├── /prisma
│   └── schema.prisma         # MySQLのDB構造・モデル定義
├── /docs                     # 解析対象の各詳細設計ドキュメント群
└── README.md                 # 本ファイル
```

### 6. API概要
詳細な仕様は docs/api.md を参照してください。

GET /api/achievements - 実績一覧の取得（公開用・認証不要）

POST /api/admin/achievements - 実績の新規登録（Admin専用）

POST /api/contact - 問い合わせ送信（DB蓄積と同時に、Slack等のWebhook通知をリアルタイムトリガー）

🚨 最重要セキュリティ仕様: 未認証または権限のないユーザーが /admin 関連APIや画面にアクセスした場合、リダイレクトではなく、`HTTP 404 (Not Found)` を返却し、存在自体を隠蔽します。

### 7.  ミドルウェアの役割とアクセス制御
セキュリティ（管理画面の存在隠蔽）要件を満たすため、以下の2箇所にミドルウェアを配置してアクセス制御を行います。未認証・権限不足の場合はリダイレクトせず、すべて HTTP 404 (Not Found) を応答します。

1. フロントエンド (frontend/src/middleware.ts)
/admin 配下のページへのアクセスを検知。未認証であればフロント側で直接 404（NotFound） を描画し、管理画面の存在自体を隠蔽します。

2. バックエンド (backend/src/middlewares/authMiddleware.ts)
POST /api/admin/achievements などのAdmin専用APIの直前で、FirebaseのIDトークンを検証。権限がなければ HTTP 404 を即座に応答してエンドポイントを隠匿します。

### 8. DB概要
詳細なモデル定義は docs/db.md を参照してください。 Prisma を通じて以下の構造がMySQL上にマッピングされます。

- User: 管理者ユーザー（Firebase UIDとのマッピング、UserRole Enumによる権限制御）
- Achievement: 実績情報（画像は LongText もしくは Blob としてBase64/バイナリ保持。命名は achievementTitle のように記述的かつ簡潔に定義）
- kill: 技術スタックとスキルレベル（skillName, skillLevel）
- Inquiry: 問い合わせ内容（senderName, senderEmail, messageContent をテキスト保持）

### 9. 開発ルール
詳細な規約は docs/rules.md に記載されています。開発時は以下を必ず遵守してください。
- Strict TypeScript & any禁止: tsconfig.json の strict: true を前提とし、any の使用は全面的に禁止します。
- MDN準拠の命名規則: 変数・関数名は、機械的な文字数制限ではなく、「3〜10文字程度を目安としつつ、略称を避けて人間が理解できる具体的な名前（セマンティックな命名）」（例: × acvTitle -> ○ achievementTitle）を徹底してください。
- 最小変更原則: AIアシスタント（Claude Code等）を用いて実装する際は、一度に広範囲のファイルを書き換えず、細分化したタスク単位で実装・コミットしてください。

### 10. Issue / PR運用
Git運用は、迅速性と秩序を両立させるため 2種類のブランチのみ で運用します。
- develop: 統合用ブランチ。常に動作可能（ステージング基準）な状態を維持します。
- feature/機能名: 作業用ブランチ。必ず develop から切り出します。
- マージ条件: ESLint（Airbnb規約）エラーがないこと、および該当機能のテストコードが記述され、すべて合格していること。

### 11. 今後の改善候補（未確定・TODO）
MVP完成後、パフォーマンスや要件に応じて以下のフェーズへ移行します。詳細なリスク要因やタイミングは `@docs/overview.md` に集約されています。

 [ ] 画像保存の効率化: 現在はMySQL（Blob/Base64）保存ですが、将来的な容量肥大化対策として外部ストレージ（AWS S3等）への移行を検討します。

 [ ] Redisによるキャッシュレイヤーの導入: パフォーマンス課題が明確になった段階で、APIのレスポンス高速化のために導入を判断します。

 [ ] Firebase Emulatorの統合: テスト自動化において、エミュレート環境を完全にCI/CDへ組み込むかどうかの詳細（可否含む）を確定させます。