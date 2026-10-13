# ポートフォリオ開発プロジェクト (Fullstack Portfolio)

Next.js と Express を連携し、Prisma / MySQL でデータ管理を行う管理画面付きフルスタックアプリケーションです。

本番サイト: [yukie-n-portfolio.vercel.app](https://yukie-n-portfolio.vercel.app)

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

## パフォーマンス・セキュリティ対応

PageSpeed Insights（モバイル）で原因を計測・特定し、小さく修正して効果を確認する流れで改善しています。

- 画像の軽量化、日本語フォントの先読み停止などにより、トップページのスコアを73点から97点に改善（2026年10月計測）
- 公開APIが返す項目を、表示に必要な4項目（name・bio・avatarUrl・githubUrl）に限定
- `main` ブランチを保護（削除・強制プッシュの禁止）

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

- concurrently（front/apiの同時起動）
- ts-node-dev
- dotenv

### インフラ（デプロイ構成）

- **ホスティング**: Vercel（Hobbyプラン）— フロントエンド・バックエンドを1プロジェクトに統合。デプロイ済み
- **データベース**: Aiven for MySQL（Free Plan）。本番データ移行済み
- **認証**: Firebase Authentication
- **メール送信**: Gmail SMTP + Nodemailer

詳細は [`docs/デプロイsetup.md`](docs/デプロイsetup.md) を参照してください。

---

## ディレクトリ構成

```text
root
├── front/          # Next.js
├── api/            # Express API
├── docs/           # 設計ドキュメント
├── compose.yaml    # ローカルMySQL（本番用・テスト用）
├── package.json    # concurrently等、ルート用の開発支援スクリプト
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

ルート・フロントエンド・バックエンドの3箇所、それぞれで `npm install` が必要です。

#### ルート（concurrently等の開発支援ツール用）

```bash
npm install
```

#### フロントエンド

```bash
cd front
npm install
cd ..
```

#### バックエンド

```bash
cd api
npm install
cd ..
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

### 4. ローカルDBの起動（Docker）

ルートの `npm run db:up` で、`compose.yaml` に定義された本番用DB・テスト用DBのコンテナがまとめて起動します。

```bash
npm run db:up
```

停止する場合は以下を実行します。

```bash
npm run db:down
```

> 補足：`docker compose up -d` を直接実行しても同じ結果になりますが、ルートの `package.json` に定義したスクリプト経由での起動を推奨します。

---

### 5. データベースセットアップ

**既にマイグレーションファイル（`0_init`等）がリポジトリにコミット済み**のため、新規クローン時は `migrate deploy` で既存のマイグレーションをそのまま適用してください。

```bash
cd api
npx prisma migrate deploy
cd ..
```

> ⚠️ `npx prisma migrate dev --name init` は実行しないでください。既にマイグレーション履歴が存在する状態でこれを実行すると、意図しない新規マイグレーションが生成される可能性があります。
>
> 今後スキーマを変更する場合は、`npx prisma migrate dev --name <変更内容>` で新しいマイグレーションファイルを作成してください（`migrate dev` はスキーマ変更時、`migrate deploy` は既存マイグレーションの適用時、と使い分けます）。

---

### 6. 開発サーバー起動

ルートで以下を実行すると、`concurrently` により front と api の開発サーバーが1つのターミナルで同時に起動します。

```bash
npm run dev
```

#### 補足：個別に起動したい場合

front と api を別々のターミナルで起動したい場合は、以下のように個別実行することもできます。

```bash
# ターミナル1
cd front
npm run dev

# ターミナル2
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

Vercel（フロント・バックエンド統合構成）+ Aiven for MySQLによる完全無料構成で、本番稼働中です。手順・セキュリティ対策・運用ルールは [`docs/デプロイsetup.md`](docs/デプロイsetup.md) にまとめています。

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

- `/works` のデータ取得をサーバー側に移し、表示速度とレイアウトのずれ（CLS）を改善
- 実績画像の保存方法の見直し（現在はDBにBase64で保存）
- Firebase SDK の読み込み範囲の見直し
- 管理画面機能の拡充
- Cypress による E2E テスト導入
- Redis を利用したキャッシュ機構の導入検討

---

## ライセンス

個人ポートフォリオ開発プロジェクト