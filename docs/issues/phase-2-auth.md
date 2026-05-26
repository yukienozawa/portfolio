# フェーズ2：認証・認可基盤の実装タスク

本ドキュメントは、Firebase Authentication を用いたフロントエンド・バックエンドの認証・認可基盤の構築タスクを定義します。安全性の担保のため、未認証アクセスに対しては一律 `HTTP 404` を応答し、リソースの存在自体を隠蔽します。

---

## 🛠️ タスク1：【バックエンド】Firebase Admin SDK導入と認可Middleware実装 (Issue #7)

### 1. 目的
Admin専用API（`POST /api/admin/achievements` 等）を保護し、未認証・権限不足のユーザーからのアクセスをシャットアウトするため。

### 2. 対象領域・ファイル
- **領域**: `api` (Express)
- **新規作成**:
  * `api/src/middlewares/authMiddleware.ts` (ミドルウェア本体)
  * `api/src/middlewares/__tests__/authMiddleware.test.ts` (テストコード)

### 3. 実実装内容
- `firebase-admin` を導入し、ヘッダーの `Authorization: Bearer <Token>` から取得したIDトークンを検証する。
- **最重要セキュリティ要件**: トークンが無効・期限切れ、または管理者権限（`UserRole.ADMIN`）が無い場合は、401や403ではなく **`HTTP 404 Not Found`** を返却してエンドポイントを隠匿する。
- 認証成功時は、デコードしたユーザー情報を `req.user` に格納して `next()` を呼ぶ。

### 4. 完了条件
- [ ] 正常なFirebaseトークンを持つリクエストが、Middlewareを通過して次の処理へ進むこと。
- [ ] トークン未所持・不正トークンのリクエストに対して、一律 `404` が返ること。
- [ ] Vitest ＋ Supertest による単体・APIテストがすべて合格すること。

---

## 💻 タスク2：【フロントエンド】管理画面（/admin）の構築とRouting保護 (Issue #11)

### 1. 目的
管理画面（`/admin` および `/admin/edit`）への未認証アクセスをフロント側でブロックし、画面の存在自体を隠蔽するため。

### 2. 対象領域・ファイル
- **領域**: `front` (Next.js App Router)
- **新規作成・編集**:
  * `front/src/middleware.ts` (Next.js ミドルウェア)
  * `front/src/app/admin/page.tsx` (ダッシュボード画面)
  * `front/src/app/admin/edit/page.tsx` (実績編集画面)

### 3. 実実装内容
- Firebase Client SDK (`firebase/auth`) を用いて、フロント側のログイン状態（セッション）を管理する。
- `front/src/middleware.ts` で `/admin` 配下へのアクセスを検知する。
- 未ログイン状態、またはAdmin権限がない場合は、ログイン画面へのリダイレクトではなく、**フロント側で直接 `NotFound` コンポーネント（404画面）を描画** し、管理画面の存在を隠蔽する。

### 4. 完了条件
- [ ] 管理者アカウントでログイン後、`/admin` のダッシュボードが正常に表示されること。
- [ ] シークレットウィンドウ（未ログイン）で `/admin` に直接アクセスした際、標準の404ページが表示され、画面の存在が隠蔽されていること。