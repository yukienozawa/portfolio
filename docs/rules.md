### `docs/rules.md` 
# 開発規約 & コーディングルール（Development Rules）

## 1. 厳格な型安全（TypeScript）
* **`any` の完全禁止**
  * コード内での `any` 使用は一切禁止
  * 型が不明なエラー等は必ず `unknown` を使い、`instanceof Error` で型ガードする
* **インデントルールの厳守**
  * ESLint Flat Config に従い、不要なスペースやネストを排除した「左寄せインデント」を徹底する

## 2. Prisma（ORM）操作ルール
* **環境変数の生書き禁止**
  * `new PrismaClient()` の引数は空（デフォルト）にする
  * 接続URLはハードコーディングせず、Dockerから注入される `DATABASE_URL` に自動検知させる
* **リレーション取得の明確化**
  * 取引（Transaction）取得時は、必ず `include: { details: true }` で明細を同時結合（Eager Loading）する

## 3. 最小変更原則（YAGNIの徹底）
* **先回りの実装禁止**
  * 「将来使うかもしれない」という予測での不要な関数、拡張コード、未使用の型定義の追加は一切禁止
  * 今あるMVP仕様（設計書）を満たすためだけの「最小・最簡」の変更に留める

## 4. 静的解析（Lint/Format）の強制
* **エラーゼロの義務化**
  * コミット前、動作確認前には必ずコンテナ内から以下を実行し、Warningおよびエラーが「ゼロ」であることを確認する
  ```bash
  # バックエンドの検証
  docker compose exec api npm run lint
  docker compose exec api npm run format

  # フロントエンドの検証
  docker compose exec next npm run lint
  docker compose exec next npm run format