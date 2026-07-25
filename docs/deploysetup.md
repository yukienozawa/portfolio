---
name: Deployment Setup (Free Tier)
about: 完全無料構成でのデプロイ手順・接続数対策・費用一覧
title: '[Doc] デプロイ手順書（Vercel統合構成）'
labels: 'scope: docs, type: deploy'
assignees: ''
---

## 1. 構成概要

`front/`（Next.js）と `api/`（Express）を **1つのVercelプロジェクト**に統合し、Renderを使わずにVercelのみでフロント・バックエンドを完結させる構成です。

```
Vercel（1プロジェクト）
├── front/  … Next.jsアプリ（そのまま）
└── api/    … Expressアプリをサーバーレス関数として組み込み
        │
        └── Aiven for MySQL（無料枠）へ接続
```

認証はFirebase Authentication、メール送信はGmail SMTP + Nodemailerのまま変更なし。

### 採用理由（比較検討の結論）
- Renderの無料Web Serviceは15分でスリープし、復帰に約1分かかる。keep-alive pingでの回避はRenderの利用規約上グレーゾーンのため不採用
- Vercelのサーバーレス関数は公式にExpressアプリをそのままホストする方法がサポートされており、規約に抵触しない
- Google Cloud Runも選択肢だが、Docker化の手間とクレジットカード登録の心理的ハードルがあるため、今回はVercel統合を優先

---

## 2. 各サービスの役割と費用

| レイヤー | サービス | 費用 | 備考 |
|---|---|---|---|
| フロントエンド | Vercel（Hobbyプラン） | $0 | 個人の非商用プロジェクトが条件。帯域100GB/月、Edge Requests 100万/月、ビルド6,000分/月まで無料、クレカ登録不要 |
| バックエンド | Vercel（同一プロジェクト内、サーバーレス関数） | $0 | Expressアプリをそのまま関数化。Render等の別サービス不要 |
| データベース | Aiven for MySQL（Free Plan） | $0 | 1GB Storage / 1GB RAM、無期限無料、クレカ登録不要。ただし長期未使用で自動停止する場合あり（事前メール通知） |
| 認証 | Firebase Authentication | $0 | 既存実装のまま |
| メール送信 | Gmail SMTP + Nodemailer | $0 | 既存実装のまま |

**合計：月額 0円**（Vercelを商用利用に切り替えない限り）

---

## 3. セットアップ手順

### 3-1. Aiven for MySQL の準備
1. Aivenにサインアップ（クレカ不要）
2. MySQL Free Planでサービスを新規作成（リージョンは日本に近いものを選択）
3. 発行された接続情報から `DATABASE_URL` を組み立てる（SSL必須。`?ssl-mode=REQUIRED` 等のパラメータを付与）
4. サーバーレス対策として、接続文字列に `connection_limit=1` を追加

```
DATABASE_URL="mysql://user:password@host:port/dbname?ssl-mode=REQUIRED&connection_limit=1"
```

### 3-2. Prisma シングルトンパターンの実装
`api/src/` 配下に共通のPrismaClientインスタンスを1つだけ生成し、関数間で使い回す実装に変更する。

```ts
// api/src/lib/prisma.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
```

各コントローラー・サービスで `new PrismaClient()` している箇所を、この共通インスタンスのimportに置き換える。

### 3-3. Express アプリのサーバーレス関数化
`api/src/index.ts` の Express アプリ（`app`）をVercelが認識できる形でエクスポートする。

```ts
// api/src/index.ts の末尾
export default app;
```

`dotenv/config` の初期化順（既存ルール通り最初のimportにする）は維持する。

### 3-4. vercel.json の設定
リポジトリのルート（モノレポの直下）に `vercel.json` を配置し、`/api/*` へのリクエストをExpress側にルーティングする。

```json
{
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api/src/index.ts" }
  ]
}
```

### 3-5. Vercelプロジェクト設定（モノレポ対応）
- Vercelダッシュボードで新規プロジェクトを作成し、GitHubリポジトリ（`yukienozawa/portfolio`）を連携
- Production Branchは `main` を指定する（`develop`で開発を進め、リリース時に`main`へマージする運用のため。詳細は`rules.md`参照）
- Root Directoryはリポジトリ直下のまま（`front/` と `api/` の両方を含める）
- Build Commandはfront側のNext.jsビルドを実行するよう設定
- 環境変数（`DATABASE_URL`、Firebase関連キー、Gmail SMTP認証情報など）をVercelダッシュボードのEnvironment Variablesに登録

#### ⚠️ FIREBASE_PRIVATE_KEYの改行に関する注意
`api/src/config/firebase.ts`は、`FIREBASE_PRIVATE_KEY`を読み込む際に`.replace(/\\n/g, '\n')`でエスケープされた`\n`を実際の改行に戻す実装になっている。そのため、Vercelの環境変数入力欄に秘密鍵を貼り付ける際は、**PEM形式の改行がエスケープされた`\n`という2文字の並びとして1行の文字列で保存されるようにする**（実際の改行コードのまま複数行で保存すると、コード側の`.replace()`が効かず、初期化エラーになる可能性がある）。設定後は、Vercelへのデプロイ後に一度ログイン動作を確認し、Firebase Admin SDKの初期化に失敗していないか（サーバーログに`❌ Firebase Admin SDK の初期化でエラーが発生しました`が出ていないか）を確認すること。

### 3-6. Prisma Client の生成をビルドに組み込む
Vercelのビルドコマンドに `npx prisma generate` を含める（Prisma Clientの生成漏れによるビルド失敗を防ぐため）。**マイグレーション（`prisma migrate deploy`）はここに含めない**（詳細は6-4）。

```
npm install && npx prisma generate && npm run build
```

### 3-7. Preview環境とProduction環境のDB分離
Vercelは Pull Request ごとに Preview環境を自動デプロイするため、環境変数を分けずに `DATABASE_URL` を1つだけ設定すると、開発中のPreviewが本番のAiven MySQLに直接書き込んでしまう。

1. Vercelダッシュボードの Environment Variables で、`DATABASE_URL` を **Production** と **Preview / Development** で別々の値に設定する
2. Preview / Development用には、Aivenでもう1つ無料のMySQLサービスを作成する（無料枠は組織内で複数作成可能）か、最低限スキーマを分ける
3. 他の環境変数（Firebase、Gmail SMTP等）についても同様に、本番用と検証用でキーを分けられるものは分ける

### 3-8. CORSの制限
Express側で`cors()`を引数なしで使っていると全オリジン許可のままになるため、本番ドメインのみを明示的に許可する。

```ts
// api/src/index.ts
app.use(cors({
  origin: process.env.ALLOWED_ORIGIN, // 例: https://your-portfolio.vercel.app
}));
```

`ALLOWED_ORIGIN` もVercelのEnvironment Variablesに追加し、Production/Previewでそれぞれ正しいドメインを設定する。

---

## 4. デプロイ前チェックリスト

1. **バックエンド本番ビルド確認**：`npx tsc --noEmit` またはビルドスクリクトでエラーがないことを確認
2. **`.env.example` の作成**：`front/` と `api/` それぞれに、安全なプレースホルダー値で `.env.example` を作成
3. **管理画面のセキュリティ確認**：本番ビルドで `/admin` に未認証アクセスした際、404が返ることを確認
4. **本番DB・デプロイ設定の最終確認**：`compose.yaml`（ローカル用）とは別に、VercelのEnvironment Variablesに本番用 `DATABASE_URL` が正しく設定されていることを確認
5. **Prisma接続数対策の確認**：`connection_limit=1` とシングルトンパターンが実装されていることを確認
6. **CORS設定確認**：フロントとAPIが同一Vercelプロジェクト・同一オリジンになるため、原則追加のCORS設定は不要（別ドメイン運用にする場合のみ要設定）
7. **`develop`→`main`マージ確認**：デプロイ直前に `develop` を `main` にマージし、`git log origin/main..origin/develop --oneline` で乖離がないこと（何も表示されないこと）を確認する。Vercelの Production Branch は `main` を参照するため、マージ漏れがあると古いバージョンが本番公開されてしまう

---

## 5. 運用上の注意点

- **Vercel Hobbyプランは非商用限定**：将来的にサイト経由で収益が発生する場合はProプラン（$20/月）への切り替えが必要
- **Aivenの自動停止**：長期間アクセスがないとMySQLサービスが自動的に停止する場合がある（事前にメール通知が届くので、通知が来たらAivenコンソールから再起動する）
- **コールドスタート**：サーバーレス関数のため、しばらくアクセスがないと初回リクエストが多少遅くなる（Renderの完全スリープよりは短い）
- **接続過多のリスク**：個人ポートフォリオ規模の同時アクセスなら`connection_limit=1`で問題ないが、エラーが頻発するようであればPrisma Accelerate（無料枠：月6万クエリ）の導入を検討する

---

## 6. Aiven自動停止時の対応手順

Aiven Free Planは長期間アクセスがないとサービスが自動的に停止する。停止前にメール通知が届くため、以下の手順で対応する。

### 6-1. 事前通知を受け取ったら
1. Aivenから届く停止予告メールを確認する（停止までの猶予期間が記載されている）
2. 猶予期間内に対応する時間が取れない場合でも、停止後にデータが削除されるわけではないため、慌てて対応する必要はない（次項の復旧手順で対応可能）

### 6-2. 実際に停止してしまった場合の復旧手順
1. [Aiven Console](https://console.aiven.io/) にログインする
2. 対象のMySQLサービスを選択する
3. サービスステータスが「Powered off」等になっていることを確認する
4. **Power on**（または同等の起動）ボタンをクリックする
5. サービスが「Running」状態に戻るまで数分待つ
6. 接続情報（ホスト名・ポート）が変わっていないか念のため確認する（通常は変わらないが、`DATABASE_URL`が古いままエラーになる場合はAivenコンソールの接続情報を再確認する）
7. Vercel側のAPIエンドポイント（`/api/contact`等）に軽くアクセスし、DB接続が復旧していることを確認する

### 6-3. 再発防止・運用ルール
- ポートフォリオを面接・案件提出などで見せる予定がある場合は、**前日までにAivenコンソールでサービスが起動中か確認する**
- 停止予告メールの受信フォルダを定期的にチェックする（迷惑メール振り分けに注意）
- 長期間放置しそうな場合は、月1回程度ログインして軽くアクセスしておくと、無駄な停止・復旧の手間を避けられる

### 6-4. マイグレーション実行の分離（重要）
`npx prisma migrate deploy` はビルドコマンドに含めない。理由は、Previewデプロイのたびにビルドが走ると、意図せず本番相当の処理が繰り返し実行される構成になりやすいため。以下の手順で手動実行に統一する。

1. スキーマ変更（`api/prisma/schema.prisma`）をローカルで編集する
2. ローカル環境で `npx prisma migrate dev --name <変更内容>` を実行し、マイグレーションファイルを生成・動作確認する
3. 生成されたマイグレーションファイルをコミットし、`develop` → `main` の通常のPRフローでレビューする
4. 本番反映時のみ、ローカルまたは手元のターミナルから本番用`DATABASE_URL`を指定して `npx prisma migrate deploy` を手動実行する

```bash
# 本番DBに対してのみ、意図したタイミングで手動実行する例
DATABASE_URL="<本番用のDATABASE_URL>" npx prisma migrate deploy
```

`prisma migrate deploy` 自体は未適用分のみを適用する設計のため複数回実行しても安全だが、「いつ・誰が」本番に反映したかを手動実行として明示的に残すことを優先する。