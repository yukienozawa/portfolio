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
2. MySQL Free Planでサービスを新規作成
3. 発行された接続情報から `DATABASE_URL` を組み立てる（SSL必須。`?ssl-mode=REQUIRED` 等のパラメータを付与）
4. サーバーレス対策として、接続文字列に `connection_limit=1` を追加

```
DATABASE_URL="mysql://user:password@host:port/dbname?ssl-mode=REQUIRED&connection_limit=1"
```

> **補足（リージョンについて）**：無料プランでは詳細なリージョンを自分で選べず、大枠の地域グループ（例：Asia Pacific）を選択すると、Aiven側が空きリソースに応じて実際の詳細リージョンを自動的に割り当てる仕様になっている。実際の運用では、Asia Pacificを選択したにもかかわらず DigitalOcean の blr（インド・バンガロール）に割り当てられた実績がある。日本から地理的に遠くなる場合があるが、個人ポートフォリオ規模のレイテンシであれば実害はほぼないと判断し許容した。

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

**この`vercel.json`の内容は当初のまま変更していない。** デプロイが失敗した原因はこのファイルではなく、後述するBuild Command側（3-6参照）にあった。Root Directoryをリポジトリ直下から`front/`に変更する対応も検討したが、その場合Vercelのサーバーレス関数自動検出スコープがRoot Directory内に限定され、兄弟フォルダである`api/`にアクセスできなくなるため不採用と判断した（詳細は3-5参照）。

### 3-5. Vercelプロジェクト設定（モノレポ対応）
- Vercelダッシュボードで新規プロジェクトを作成し、GitHubリポジトリ（`yukienozawa/portfolio`）を連携
  - GitHub App の権限は **「Only select repositories」** を選び、対象リポジトリ（`yukienozawa/portfolio`）のみにアクセスを限定すること（Aiven連携時と同様、最小権限の原則を適用）
- Production Branchは `main` を指定する（`develop`で開発を進め、リリース時に`main`へマージする運用のため。詳細は`rules.md`参照）
- **Root Directoryはリポジトリ直下のまま**（`front/` と `api/` の両方を含める）。`front/`への変更は検証の結果不採用と判断した：`front/`をRoot Directoryにすると、Vercelのサーバーレス関数（`/api`フォルダ規約）の自動検出スコープがRoot Directory内に限定され、兄弟フォルダである`api/`にアクセスできなくなるため
- Build Commandはfront側のNext.jsビルドを実行するよう設定（詳細は3-6参照）
- 環境変数（`DATABASE_URL`、Firebase関連キー、Gmail SMTP認証情報など）をVercelダッシュボードのEnvironment Variablesに登録
- **Vercel Agent（AIコードレビュー機能）は有効化しない**：ダッシュボード上で有効化を促す表示があるが、Pro/Enterprise向けの従量課金制機能であることを確認済み。完全無料構成の方針と矛盾するため、意図的にスキップする

#### ⚠️ FIREBASE_PRIVATE_KEYの改行に関する注意
`api/src/config/firebase.ts`は、`FIREBASE_PRIVATE_KEY`を読み込む際に`.replace(/\\n/g, '\n')`でエスケープされた`\n`を実際の改行に戻す実装になっている。そのため、Vercelの環境変数入力欄に秘密鍵を貼り付ける際は、**PEM形式の改行がエスケープされた`\n`という2文字の並びとして1行の文字列で保存されるようにする**（実際の改行コードのまま複数行で保存すると、コード側の`.replace()`が効かず、初期化エラーになる可能性がある）。

**実際に起きた事象**：Vercelの「Import .env」機能で `api/.env` を一括インポートした際、`FIREBASE_PRIVATE_KEY` に含まれる `\n`（バックスラッシュ+n、文字列としての2文字）が、Vercel側で実際の改行として解釈されてしまい、値が複数行に分割される事象が発生した。気づかずに進めると、Firebase Admin SDKの初期化に失敗する。

対応手順：
1. Import後、`FIREBASE_PRIVATE_KEY` の値を👁アイコンで開いて確認する
2. 1行の文字列になっているか確認する（複数行に分かれていたら要修正）
3. 複数行になっていた場合、一度値を削除し、`.env` ファイルの `"` で囲まれた中身だけを手動でコピー＆ペーストし直す
4. 設定後は、Vercelへのデプロイ後に一度ログイン動作を確認し、Firebase Admin SDKの初期化に失敗していないか（サーバーログに`❌ Firebase Admin SDK の初期化でエラーが発生しました`が出ていないか）を確認すること

### 3-6. Prisma Client の生成をビルドに組み込む
Vercelのビルドコマンドに `npx prisma generate` を含める（Prisma Clientの生成漏れによるビルド失敗を防ぐため）。**マイグレーション（`prisma migrate deploy`）はここに含めない**（詳細は6-4）。

```
npm install && npx --no-install prisma generate && npm run build
```

**なぜ `--no-install` が必要か（実際にハマった罠）**：
`package.json` に `prisma: "^5.13.0"` のようにバージョンを指定していても、Vercelのビルド環境で単に `npx prisma generate` を実行すると、`npx` が `node_modules` 内のインストール済みバージョンを無視し、最新版（例: 7.9.0）を勝手にインストールしようとすることがある。これにより「意図しないメジャーバージョンでの実行」や、依存関係の不整合によるビルド失敗が発生した（実際に2回ビルドが失敗した経緯あり）。
`--no-install` オプションを付けることで、`npx` に「既にインストール済みのバージョンのみを使い、見つからなければエラーにする」よう指示できる。これにより、`package.json` で固定したバージョンが確実に使われる。

> **さらなる保険（依存関係キャッシュ対策）**：Vercelが依存関係をキャッシュした場合、`npm install`自体がスキップされ`postinstall`フックが効かないケースがある。`api/package.json`の`build`スクリプト自体にも`prisma generate`を含める（`"build": "prisma generate && tsc"`）ことで、`postinstall`と`build`の二重の保険としている。

### 3-7. Preview環境とProduction環境のDB分離について（検討したが見送り）
Vercelは Pull Request ごとに Preview環境を自動デプロイするため、環境変数を分けずに `DATABASE_URL` を1つだけ設定すると、Previewでの動作確認が本番のAiven MySQLに直接書き込むことになる。

**当初の計画**：AivenでもうひとつMySQLサービスを作成し、Preview用の `DATABASE_URL` を分離する。

**実際の判断**：個人ポートフォリオ規模ではこの分離を見送り、Production/Preview共通の `DATABASE_URL` のまま運用することにした。理由は、Preview環境でのテスト送信データが本番DBに混ざるリスクはあるが、それが発生するのは自分が意図的にPreview環境でテストしたときに限られ、内容を見れば自分で判断・削除できるため。無料枠のAivenサービスをもう1つ増やす運用コストとのバランスを考慮した。

テストデータが本番DBに混ざった場合は、Prisma Studio等から手動で確認・削除する運用とする。

### 3-8. CORSについて（同一オリジンのため原則不要）
フロントとAPIが同一Vercelプロジェクト・同一オリジンで運用されるため、**原則としてCORS設定の追加は不要**。実際に `api/src/index.ts` の `cors()` は引数なし（全オリジン許可）のまま変更していない。

> 補足：当初、本番ドメインのみを許可するよう `ALLOWED_ORIGIN` 環境変数でCORSを制限する計画があったが、同一オリジン運用であるためこの制限は機能上意味を持たないと判断し、見送った。この設定が必要になるのは、front と api を別ドメイン・別Vercelプロジェクトに分割する場合のみ。

### 3-9. 初回デプロイ後の環境変数更新
front側の以下3つの環境変数は、本番URLが確定するまで正しい値を入れられない（デプロイ前は本番URLが分からないため）。そのため、以下の2段階の手順を踏む。

- `NEXT_PUBLIC_API_URL`
- `API_INTERNAL_URL`
- `NEXT_PUBLIC_ALLOWED_DEV_ORIGIN`

1. 初回はこれら3つをローカル開発用の値のままデプロイして構わない（これらが未更新でも、`DATABASE_URL`等が正しければビルド自体は成功する）
2. デプロイ完了後に発行される本番URL（例: `https://<プロジェクト名>.vercel.app`）を確認する
3. 上記3つの環境変数を、確認した本番URLに更新する
4. Vercelダッシュボードから再デプロイ（Redeploy）し、管理画面（`/admin`）へのアクセスを含めて動作確認する（`API_INTERNAL_URL`は`proxy.ts`のセッション検証に使われるため、更新前は管理画面アクセスが正しく機能しない）

---

## 4. デプロイ前チェックリスト

1. **バックエンド本番ビルド確認**：`npx tsc --noEmit` またはビルドスクリクトでエラーがないことを確認
2. **`.env.example` の作成**：`front/` と `api/` それぞれに、安全なプレースホルダー値で `.env.example` を作成
3. **管理画面のセキュリティ確認**：本番ビルドで `/admin` に未認証アクセスした際、404が返ることを確認
4. **本番DB・デプロイ設定の最終確認**：`compose.yaml`（ローカル用）とは別に、VercelのEnvironment Variablesに本番用 `DATABASE_URL` が正しく設定されていることを確認
5. **Prisma接続数対策の確認**：`connection_limit=1` とシングルトンパターンが実装されていることを確認
6. **CORS設定確認**：フロントとAPIが同一Vercelプロジェクト・同一オリジンになるため、原則追加のCORS設定は不要（別ドメイン運用にする場合のみ要設定）
7. **`develop`→`main`マージ確認**：デプロイ直前に `develop` を `main` にマージし、`git log origin/main..origin/develop --oneline` で乖離がないこと（何も表示されないこと）を確認する。Vercelの Production Branch は `main` を参照するため、マージ漏れがあると古いバージョンが本番公開されてしまう
8. **環境変数の本番URL反映確認**：3-9の手順に従い、`NEXT_PUBLIC_API_URL`・`API_INTERNAL_URL`・`NEXT_PUBLIC_ALLOWED_DEV_ORIGIN`が本番URLに更新されているか確認する

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
5. サービスが「Running」状態に戻るまで数分待つ（Free Planは起動処理に時間がかかることがある）
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

---

## 7. 本番データ移行手順

ローカルDBに蓄積した実績データ等をAiven本番DBに移行する際の手順。

```bash
# ローカルDBからエクスポート（Dockerコンテナ内のmysqldumpを使用）
docker compose exec db mysqldump -u <user> -p<password> --no-create-info --complete-insert --skip-extended-insert <db名> Achievement User > migration_data.sql

# Aiven本番DBへインポート（使い捨てのmysqlクライアントコンテナを使用、環境を汚さない）
docker run --rm -i mysql:8.0 mysql -h <Aivenホスト> -P 14735 -u avnadmin -p'<パスワード>' --ssl-mode=REQUIRED defaultdb < migration_data.sql
```

**補足**：
- `docker run --rm -i mysql:8.0 ...` は、既存の `compose.yaml` で使っている `mysql:8.0` イメージをそのまま流用するだけなので、新規インストールは発生しない
- `-p'パスワード'` はパスワードに `'`（シングルクォート）が含まれる場合はエスケープが必要になる
- `docker compose exec` でリモートホストに接続する際、TTY未割り当てによる `the input device is not a TTY` エラーが出ることがある。その場合は `docker compose exec -T` のように `-T` オプションを付けるか、上記のように使い捨てコンテナ（`docker run --rm -i`）方式に切り替えると回避できる
- `--no-create-info` はテーブル構造の出力を省略するオプション（Aiven側は`prisma migrate deploy`で既にテーブル構造を反映済みのため、データのみで十分）
- `--skip-extended-insert` は1レコード＝1行のINSERT文にするオプション。件数確認や差分確認がしやすくなる
- インポート後は、対象テーブルの件数をAiven側で確認しておくと安心（例: `SELECT COUNT(*) FROM Achievement;`）
- `migration_data.sql` にはBase64エンコードされた画像データや個人情報が含まれるため、**Gitには絶対にコミットしない**（`.gitignore` に追加すること）