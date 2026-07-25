# ポートフォリオ開発プロジェクト (Fullstack Portfolio)

Next.js と Express を連携し、Prisma / MySQL でデータ管理を行う管理画面付きフルスタックアプリケーションです。

リポジトリ: [github.com/yukienozawa/portfolio](https://github.com/yukienozawa/portfolio)

---

## 概要

開発・運用において「コード品質の自動統一」と「セマンティックな設計」を重視し、堅牢かつ保守しやすいポートフォリオ基盤を目指します。

ルート配下の `docs/` ディレクトリに格納された設計書を唯一の信頼できる情報源（Single Source of Truth）とし、コードの成長とともに段階的にドキュメントを更新していく「Docs as Code」の考え方を採用しています。

---

## MVP (Minimum Viable Product)

### 公開側

- プロフィール情報の表示
- 実績一覧の動的取得・表示
- お問い合わせフォーム（DB保存、ON/OFF切り替え機能付き）

### 管理側

- Firebase Authentication によるログイン認証（実装済）
- セッションCookieのFirebase Admin SDKによる検証（実装済）
- 実績情報の登録・更新・削除（CRUD）（実装済）

### 品質

- TypeScript（strict mode）
- ESLint / Prettier
- セマンティックな命名規則
- テストカバレッジ計測環境（実装済）

---

## 採用技術

### フロントエンド

- Next.js 16（App Router）
- React 19
- TypeScript（strict mode）
- Tailwind CSS
- Firebase Authentication（Firebase SDK）

### バックエンド

- Express
- TypeScript
- Prisma ORM
- MySQL
- Firebase Admin SDK

### テスト

- Vitest（Unit Test / API Test）
- Supertest
- Cypress（導入予定）

### コード品質管理

- ESLint
- Prettier

### 開発支援ツール

- ts-node-dev
- dotenv

### インフラ（デプロイ構成）

- **ホスティング**: Vercel（Hobbyプラン）— フロントエンド・バックエンドを1プロジェクトに統合
- **データベース**: Aiven for MySQL（Free Plan）
- **認証**: Firebase Authentication
- **メール送信**: Gmail SMTP + Nodemailer

詳細は [`docs/デプロイsetup.md`](docs/デプロイsetup.md) を参照してください。

---

## ディレクトリ構成

```text
root
├── front/      # Next.js
├── api/        # Express API
├── docs/       # 設計ドキュメント
└── README.md
```

---

## セットアップ

### 1. リポジトリのクローン

```bash
git clone https://github.com/yukienozawa/portfolio.git
cd portfolio
```

---

### 2. 依存関係のインストール

#### フロントエンド

```bash
cd front
npm install
```

#### バックエンド

```bash
cd ../api
npm install
```

---

### 3. 環境変数の設定

#### フロントエンド

以下のファイルを作成します。

```text
front/.env.local
```

#### バックエンド

以下のファイルを作成します。

```text
api/.env
```

必要な環境変数は、それぞれの `.env.example` を参考に設定してください。

---

### 4. データベースセットアップ

Prisma のマイグレーションを実行します。

```bash
cd api
npx prisma migrate dev --name init
```

---

### 5. 開発サーバー起動

#### フロントエンド

```bash
cd front
npm run dev
```

#### バックエンド

```bash
cd api
npm run dev
```

---

## テスト

### Unit Test / API Test

各ディレクトリで実行します。

```bash
npm run test
```

### カバレッジ確認

```bash
npm run test:coverage
```

---

## E2E テスト

現在未実装（Cypress 導入予定）

---

## デプロイ

Vercel（フロント・バックエンド統合構成）+ Aiven for MySQLによる完全無料構成でデプロイしています。手順・セキュリティ対策・運用ルールは [`docs/デプロイsetup.md`](docs/デプロイsetup.md) にまとめています。

---

## ドキュメント

設計・開発ルールは `docs/` 配下で管理します。

```text
docs/
├── overview.md
├── api.md
├── db.md
├── rules.md
├── test.md
├── screens.md
└── デプロイsetup.md
```

### ドキュメント一覧

| ファイル | 内容 |
|----------|------|
| overview.md | システム概要・技術構成・開発フロー |
| api.md | API設計 |
| db.md | データベース設計 |
| rules.md | コーディング規約・Git運用ルール |
| test.md | テスト戦略 |
| screens.md | 画面設計 |
| デプロイsetup.md | デプロイ手順・セキュリティ対策・運用ルール |

---

## 開発方針

- Docs as Code を採用
- 設計書を先行し、実装と同期して更新する
- TypeScript strict mode を維持する
- ESLint / Prettier によるコード品質の統一を行う
- セマンティックで可読性の高い命名を徹底する
- 小さく作り、継続的に改善する

---

## Git運用

- `develop` を基準に開発を進め、`feature/機能名` ブランチで作業する
- `main` はリリース済み・デプロイ対象のブランチとして運用する（Vercel Production Branchは`main`を参照）
- デプロイ前は必ず `develop` → `main` のマージと差分確認を行う

詳細は [`docs/rules.md`](docs/rules.md) を参照してください。

---

## 今後の実装予定

- 管理画面機能の拡充
- Cypress による E2E テスト導入
- Redis を利用したキャッシュ機構の導入検討
- リポジトリのPublic公開

---

## ライセンス

個人ポートフォリオ開発プロジェクト