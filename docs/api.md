---
name: API Specification
about: バックエンド（api）が提供するエンドポイントの定義およびリクエスト・レスポンス
title: '[Doc] APIエンドポイントおよびインターフェース定義'
labels: 'scope: docs, type: setup'
assignees: ''
---

## 1. API一覧と認証・認可ポリシー

### 認証・認可ポリシー
- **公開API**: 認証不要。誰でもアクセス可能。
- **Admin専用API**: 2種類の認証方式が併存する。
  - `authMiddleware`：`Authorization: Bearer <Firebase IDトークン>`ヘッダーによる認証（実績・問い合わせ一覧等のAPI呼び出しで使用）
  - `verifySession`：セッションCookieによる認証（`/admin`ページの表示可否を判定する`proxy.ts`から利用）
  - どちらも、認証（本人確認）に加えて**MySQL側の`User.role === 'ADMIN'`かどうかの認可チェック**を行う。管理者権限がない、または未認証の場合は **HTTP 404 (Not Found)** を返却し、エンドポイント自体の存在を隠匿する。

### パス構成についての重要な補足（`api/src/index.ts`確認済み）
`achievement` / `contactSetting` / `inquiry` / `user` の各ルーターは、`index.ts`側で**意図的に`/api`と`/api/admin`の両方にマウントされている**。

```ts
// 1. 公開用API群（/api/...）
app.use('/api', achievementRoutes);
app.use('/api', contactRoutes);
app.use('/api', contactSettingRoutes);
app.use('/api', inquiryRoutes);
app.use('/api', userRoutes);

// 2. 管理画面用API群（/api/admin/...）
app.use('/api/admin', achievementRoutes);
app.use('/api/admin', contactSettingRoutes);
app.use('/api/admin', inquiryRoutes);
app.use('/api/admin', userRoutes);

// 3. セッション検証API（/api/admin/verify-sessionのみ、単独マウント）
app.use('/api/admin', sessionRoutes);
```

各ルーターファイル自体は1系統のパス（例：`/achievements`）しか定義していないが、`index.ts`で2つのプレフィックスに二重マウントすることで、結果的に`/api/xxx`と`/api/admin/xxx`の両方が有効になる。認証・認可はルーター内で`authMiddleware`をルート定義時に組み込む形で行っているため、**どちらのプレフィックスでアクセスしても同じ認証要件が適用される**（`/api/xxx`だからといって`/api/admin/xxx`より緩いわけではない）。

front側は管理画面からの操作を一貫して`/api/admin/...`で呼び出す設計になっている。これは不具合ではなく正しい設計。

例外：
- `contactRoutes`（お問い合わせ送信）は `/api` のみの単独マウント
- `sessionRoutes`（セッション検証・作成）は `/api/admin` のみの単独マウント

---

## 2. 実績（Achievement）関連エンドポイント

### エンドポイント対応表
| 操作 | 公開側パス | 管理画面側パス（frontが実際に使用） | 認証要否 |
|---|---|---|---|
| 一覧取得 | `GET /api/achievements` | `GET /api/admin/achievements` | 不要（公開・両方とも同じ結果） |
| 詳細取得 | `GET /api/achievements/:id` | `GET /api/admin/achievements/:id` | 必要（Admin） |
| 更新 | `PUT /api/achievements/:id` | `PUT /api/admin/achievements/:id` | 必要（Admin） |
| 新規登録 | `POST /api/achievements` | `POST /api/admin/achievements` | 必要（Admin） |

### ① 実績一覧の取得
* **Endpoint**: `GET /api/achievements`（`GET /api/admin/achievements`でも同一結果）
* **認証要否**: 不要（公開）
* **Response (200 OK)**: `Achievement[]`（`db.md`参照）

### 実績一覧取得ルートについての補足（訂正済み）
`achievementRoutes.ts`自体には`/achievements`という1系統のパスしか定義されていないが、`index.ts`側で同じルーターを`/api`と`/api/admin`の両方に意図的にマウントしている（詳細は1章参照）。この結果、`GET /api/achievements`（公開）と`GET /api/admin/achievements`（同一ハンドラー）の両方が有効。front側は管理画面からの操作を一貫して`/api/admin/...`で呼び出す設計であり、これは不具合ではなく正しい設計。

なお、ファイル内にコメントアウトされている「下書き機能（isPublished出し分け）を実装する場合の管理者専用ルート案」は、この二重マウントの話とは別の、将来の拡張用メモである点に注意。

### 下書き機能（`isPublished`）について
`Achievement`モデルには`isPublished`フィールドが存在しますが、**MVPスコープでは未使用**と正式に決定しました。`createAchievement`実装でも`isPublished: true`が固定で設定されており、実績は登録と同時に常に公開される運用です。フィールド自体は将来の拡張用にスキーマに残していますが、公開/非公開の出し分けロジックは実装しません。

### ② 実績の詳細取得（管理者専用）
* **Endpoint**: `GET /api/achievements/:id`（`GET /api/admin/achievements/:id`でも同一）
* **認証要否**: **必要（Admin）**
* **用途**: 編集画面（`/admin/edit`）読み込み時の1件取得
* **エラーレスポンス**: 未認証・権限不足時 → `404 Not Found`
* レスポンスのキーは `id` / `title` / `description` / `imageUrl`（すべて小文字始まりで統一済み）。

> **経緯（修正済みの表記ゆれ）**：以前は`Title`（先頭大文字）という表記ゆれがあり、front側（`admin/edit/page.tsx`）が`data.title || data.Title`という防御的なフォールバック処理で実害を吸収していた。`achievementController.ts`の`getAchievementById`を`title`に統一し、front側の不要なフォールバックも削除した（両ファイルとも修正済み）。

### ③ 実績の更新（管理者専用）
* **Endpoint**: `PUT /api/achievements/:id`（`PUT /api/admin/achievements/:id`でも同一）
* **認証要否**: **必要（Admin）**
* **Request Body**（検証済み。コントローラーの受け取り名とスキーマのフィールド名が異なるが、`achievementService.ts`で正しくマッピングされている）:
    ```json
    {
      "achievementTitle": "実績タイトル",
      "description": "説明文",
      "imageData": "画像URLまたはBase64文字列"
    }
    ```
    → 内部で `title` / `description` / `imageUrl` にマッピングされてDB保存される
* **エラーレスポンス**: `achievementTitle`未指定 → `400`、未認証・権限不足時 → `404 Not Found`

### ④ 実績の新規登録（管理者専用）
* **Endpoint**: `POST /api/achievements`（`POST /api/admin/achievements`でも同一、frontはこちらを使用）
* **認証要否**: **必要（Admin）**
* **Request Body**: ③と同様（`achievementTitle` / `description` / `imageData`）
* **内部挙動**: `category`は`"WEB_APP"`固定、`isPublished`は`true`固定で登録される（下書き機能は未使用のため）
* **エラーレスポンス**: `achievementTitle`未指定 → `400`、未認証・権限不足時 → `404 Not Found`

---

## 3. お問い合わせ機能ON/OFF設定（ContactSetting）関連エンドポイント

### ⑤ 設定状態の取得
* **Endpoint**: `GET /api/contact-setting`（`GET /api/admin/contact-setting`でも同一）
* **認証要否**: 不要（公開。Contactページの表示切り替えに使用）
* **Response (200 OK)**:
    ```json
    { "isEnabled": true }
    ```

### ⑥ 設定状態の更新（管理者専用）
* **Endpoint**: `PUT /api/admin/contact-setting`（`PUT /api/contact-setting`でも同一だが、frontは`/admin`側を使用）
* **認証要否**: **必要（Admin）**
* **Request Body**:
    ```json
    { "isEnabled": false }
    ```
* **Response (200 OK)**:
    ```json
    { "isEnabled": false }
    ```
* **バリデーション**: `isEnabled`が`boolean`でない場合は`400 Bad Request`
* **エラーレスポンス（サーバーエラー時）**: `500 Internal Server Error`

---

## 4. セッション（認証）関連エンドポイント

`sessionRoutes.ts`は`index.ts`で`/api/admin`のみに単独マウントされている（`achievement`等と異なり二重マウントされない。詳細は1章参照）。

### ⑦ セッションCookie作成（ログイン時）
* **Endpoint**: `POST /api/admin/create-session`
* **認証要否**: 不要（Firebase IDトークンを検証材料として使うため）
* **Request Body**:
    ```json
    { "idToken": "<Firebase IDトークン>" }
    ```
* **Response (200 OK)**:
    ```json
    { "sessionCookie": "<セッションCookie文字列>" }
    ```
* **有効期限**: 14日間（Firebaseの上限値）
* **エラーレスポンス**: `idToken`未指定 → `400`、検証失敗 → `401 Unauthorized`
* **注意**: このエンドポイントは意図的に`authMiddleware`を経由しない（Bearerトークン方式とCookie方式で認証の仕組みが異なるため）。

### ⑧ セッションCookie検証（`/admin`アクセス時、`proxy.ts`から利用）
* **Endpoint**: `GET /api/admin/verify-session`
* **認証要否**: セッションCookie自体が検証対象
* **Cookie解析の実装ポイント**: `.split('=')[1]`ではなく`.slice('session='.length)`を使用（base64値に含まれる`=`を誤って切り落とさないための対策）
* **認可チェック（修正済み）**: 以前はFirebaseセッションが本物かどうか（認証）のみをチェックしており、`role === 'ADMIN'`かどうか（認可）を見ていなかった。`authMiddleware`と同じ基準（MySQL側の`User.role`を確認）を追加済み。
* **Response**:
  - 検証成功（Cookie正当 かつ role === 'ADMIN'）→ `200 OK { "ok": true }`
  - Cookie未指定・検証失敗・ADMINロールでない → **`404 Not Found`**（`authMiddleware`と同じ「存在の隠蔽」方針）

---

## 5. 問い合わせ送信エンドポイント

`contactController.ts` / `contactService.ts`の実物を確認済み。`contactRoutes`は`/api`のみに単独マウントされている（`/api/admin/contact`は存在しない）。

* **Endpoint**: `POST /api/contact`
* **認証要否**: 不要（公開）
* **Request Body**:
    ```json
    {
      "name": "野澤 太成",
      "email": "nozawa@example.com",
      "message": "お仕事のご相談です。"
    }
    ```
* **バリデーション（実装順）**:
  1. `ContactSetting.isEnabled`が`false`の場合、送信を拒否（`403 Forbidden`、メンテナンスモード）
  2. `name` / `email` / `message`の必須チェック（未入力があれば`400`）
  3. 文字数上限チェック（`name`は100文字以内、`message`は2000文字以内。超過時は`400`）
  4. `email`の形式チェック（簡易正規表現、不正な形式は`400`）
* **内部挙動**: バリデーション通過後、`Inquiry`テーブルへ保存 → Slack Webhook通知（`NOTIFICATION_WEBHOOK_URL`が設定されている場合）→ Gmail経由でのHTML形式メール転送（`GMAIL_USER` / `GMAIL_APP_PASSWORD`が設定されている場合）。メール本文に埋め込む前にユーザー入力を`escapeHtml`でエスケープし、タグインジェクションを防止している。
* **Response (201 Created)**: 保存された`Inquiry`オブジェクト

---

## 6. お問い合わせ一覧取得エンドポイント（管理者専用）

* **Endpoint**: `GET /api/admin/inquiries`（`GET /api/inquiries`でも同一だが、frontは`/admin`側を使用）
* **認証要否**: **必要（Admin）**
* **用途**: 管理画面の受信箱タブへの表示
* **Response (200 OK)**: `Inquiry[]`（作成日時の降順）
* **エラーレスポンス**: 未認証・権限不足時 → `404 Not Found`

---

## 7. 管理者プロフィール関連エンドポイント

`userController.ts` / `userRoutes.ts`の実物を確認済み。

### ⑨ 公開プロフィール取得
* **Endpoint**: `GET /api/profile/public`
* **認証要否**: 不要（公開。トップページ・プロフィールページでの表示に使用）
* **内部挙動**: `role: 'ADMIN'`のユーザーを1件取得し、`select`で**表示に必要な4項目のみ**を返す
* **Response (200 OK)**:
```json
   {
     "name": "Yukie Nozawa",
     "bio": "自己紹介文",
     "avatarUrl": "/images/profile.jpg",
     "githubUrl": "https://github.com/yukienozawa"
   }
```
* **返さない項目**: `id`・`email`・`role` など（公開APIから個人情報を返さないため、2026年10月に修正）
* **エラーレスポンス**: 該当ユーザーなし → `404`
* 補足：`userRoutes`は`/api`と`/api/admin`の両方にマウントされているため`GET /api/admin/profile/public`も同一結果を返すが、公開情報のため`/admin`プレフィックスを付ける意味はなく、front側も`/api/profile/public`を使用している。

### ⑩ ログイン中の管理者プロフィール取得
* **Endpoint**: `GET /api/admin/profile`（`GET /api/profile`でも同一だが、frontは`/admin`側を使用）
* **認証要否**: **必要（Admin）**
* **注意（セキュリティ修正済み）**: 以前はレコードが存在しない場合に`role: 'ADMIN'`で自動作成する実装だったが、「初めてログインした人が誰でもADMINになれる」抜け道になるため廃止。現在はレコードが存在しない場合`404`を返すのみで、ADMINユーザーは事前に手動でDBに1件作成しておく運用。

### ⑪ 管理者プロフィール更新
* **Endpoint**: `PUT /api/admin/profile`（`PUT /api/profile`でも同一だが、frontは`/admin`側を使用）
* **認証要否**: **必要（Admin）**
* **Request Body**: `name` / `bio` / `avatarUrl` / `githubUrl`

---

## 8. ドキュメントの正確性について

今回、確認対象としていた全コントローラー・全ルーティングファイル（`achievement`・`session`・`contact`・`inquiry`・`user`関連）に加え、`api/src/index.ts`の各ルーターのマウント状況（プレフィックス）についても実物を確認済み。①〜⑪すべて実装済みコードを根拠にした正確な内容であり、未確認事項は残っていない。