---
name: Phase 3 Backend API Development
about: 実績API（取得・登録）および問い合わせ送信APIの実装タスク定義
title: '[Doc] Phase 3: バックエンドAPI群の実装とテスト同梱'
labels: 'scope: docs, type: setup'
assignees: ''
---

# Phase概要
Phase 3は、バックエンド（`api` フォルダ）において、公開画面および管理画面から呼び出される中核API（実績一覧取得・実績登録・問い合わせ送信）を実装するフェーズです。すべてのAPIは、MDN準拠のセマンティックな命名、strict TypeScript（`any` の完全排除）、および「テストコードの同梱」を絶対条件とします。

---

## 🛠️ タスク1：実績一覧取得API（GET /api/achievements）の実装

### 1. 目的
公開画面の「実績（`/works`）」ページで、データベースから動的に実績一覧を取得して表示できるようにするため。

### 2. 対象ファイル・領域
- **領域**: `api` (Express)
- **編集・新規作成**:
  * `api/src/routes/achievementRoutes.ts`（ルーティング）
  * `api/src/controllers/achievementController.ts`（コントローラー）
  * `api/src/services/achievementService.ts`（DB操作・Prisma呼び出し）
  * `api/src/controllers/__tests__/achievementController.test.ts`（テストコード）

### 3. 実装内容
- 認証不要（誰でもアクセス可能）なエンドポイントとして実装する。
- Prismaを使って、MySQLの `Achievement` テーブルから全レコードを `createdAt` の降順（新しい順）で取得し、JSON配列で返却する。

### 4. 完了条件
- [x] `GET /api/achievements` を叩いた際、ステータスコード `200 OK` とともに、正しい実績データ配列が返ってくること。
- [x] Vitest ＋ Supertest によるコントローラー層のAPIテスト（3件）がすべて合格すること。

---

## 🛠️ タスク2：実績新規登録API（POST /api/admin/achievements）の実装

### 1. 目的
管理者がダッシュボードから、新しい実績コンテンツ（テキスト・画像）を安全に登録できるようにするため。

### 2. 対象ファイル・領域
- **領域**: `api` (Express)
- **編集・新規作成**:
  * 同上（実績関連ファイルに追記）

### 3. 実装内容
- **ガードの適用**: Phase 2 で作成した `authMiddleware.ts` をこのAPIの直前に配置し、厳格に認証チェックを行う。
- **最重要セキュリティ要件**: 未認証、または管理者権限を持たないリクエストに対しては、一律で **`HTTP 404 Not Found`** を返却し、APIエンドポイントの存在自体を隠蔽する。
- リクエストボディから `achievementTitle`, `description`, `imageData` を受け取り、Prismaを介してDBに保存後、生成されたオブジェクトを丸ごと返却する。

### 4. 完了条件
- [x] 正しいFirebaseトークンを持ったリクエストで、DBにデータが正常に保存され、`200 OK` が返ること。（※実装整合性: 201ではなく200応答に統一）
- [x] トークンが無効・または無い場合、401や403ではなく **`404`** が返却されること（存在隠蔽テストの合格）。
- [x] 同梱したAPIテストがすべて合格すること。

---

## 🛠️ タスク3：問い合わせ送信API（POST /api/contact）の実装とWebhook連携

### 1. 目的
一般ユーザーからの問い合わせ内容をDBに記録し、同時に管理者のSlack等へリアルタイムに通知を飛ばすため。

### 2. 対象ファイル・領域
- **領域**: `api` (Express)
- **編集・新規作成**:
  * `api/src/routes/contactRoutes.ts`
  * `api/src/controllers/contactController.ts`
  * `api/src/services/contactService.ts`
  * `api/src/controllers/__tests__/contactController.test.ts`

### 3. 実装内容
- 認証不要（公開API）。リクエストボディからフロントエンド共通の変数名（**`senderName`**, **`senderEmail`**, **`messageContent`**）を受け取り、必須チェックおよびメール形式のバリデーションを行う。
- バリデーションエラー時は、フロントエンドのテストが検知できるよう、丁寧な文言（`すべての項目（お名前、メールアドレス、本文）を入力してください。`等）を含めたエラーを返却する。
- 受信データを `Inquiry` テーブル（`schema.prisma` に新設した `model Inquiry`）へ保存する。
- **外部連携**: 保存完了後、`.env` に定義された `NOTIFICATION_WEBHOOK_URL` を利用し、`fetch` 通信を用いてSlack等へリアルタイムに通知を送信するトリガーを実装する。

### 4. 完了条件
- [x] `POST /api/contact` に必須項目を送った際、`200 OK` が返り、DBにレコードが作成されていること。
- [x] バリデーションエラー（メールアドレスの形式不正や名前の空欄）の際、適切なエラーメッセージと `400 Bad Request` が返ること。
- [x] `contactController.test.ts` の文字列検証を含めたテストが修正され、Vitestのテストがすべて合格すること。