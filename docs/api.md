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
- **Admin専用API**: `authMiddleware`（Firebase AuthのセッションCookie検証）が必須。管理者権限がない、または未認証の場合は **HTTP 404 (Not Found)** を返却し、エンドポイント自体の存在を隠匿する。

> ⚠️ 以前のバージョンの本ドキュメントに記載していたエンドポイントとは、パス・エンドポイント構成が変わっています。旧`POST /api/admin/achievements`のように`/admin`をパスに含める設計は、実装上は採用されていません（後述）。

---

## 2. 実績（Achievement）関連エンドポイント

### ① 実績一覧の取得
* **Endpoint**: `GET /api/achievements`
* **認証要否**: 不要（公開）
* **Response (200 OK)**: `Achievement[]`（`db.md`参照）

### 実績一覧取得ルートについての補足（検証済み）
`achievementRoutes.ts`には、以前`GET /achievements`が認証なし・認証ありの2回登録されていましたが、検証の結果、`getAchievements`ハンドラーは認証状態を一切参照せず常に同じ結果を返す実装だったため、**実害のない未使用コード（デッドコード）**と判明しました。現在は管理者専用側の登録をコメントアウトし、以下の1系統のみで運用しています。

```ts
router.get('/achievements', achievementController.getAchievements);
```

### 下書き機能（`isPublished`）について
`Achievement`モデルには`isPublished`フィールドが存在しますが、**MVPスコープでは未使用**と正式に決定しました。`createAchievement`実装でも`isPublished: true`が固定で設定されており、実績は登録と同時に常に公開される運用です。フィールド自体は将来の拡張用にスキーマに残していますが、公開/非公開の出し分けロジックは実装しません。

### ② 実績の詳細取得（管理者専用）
* **Endpoint**: `GET /api/achievements/:id`
* **認証要否**: **必要（Admin）**
* **用途**: 編集画面（`/admin/edit`）読み込み時の1件取得
* **エラーレスポンス**: 未認証・権限不足時 → `404 Not Found`
* ⚠️ 実装上の注意：レスポンスのキーが `id` / `Title`（先頭大文字） / `description` / `imageUrl` となっており、`Title`のみ他と表記が揺れている（タイポの可能性）。フロント側の受け取りコードが未確認のため実害は不明。フロント側の対応コードを確認し、意図的でなければ`title`に統一することを推奨する。

### ③ 実績の更新（管理者専用）
* **Endpoint**: `PUT /api/achievements/:id`
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
* **Endpoint**: `POST /api/achievements`
* **認証要否**: **必要（Admin）**
* **Request Body**: ③と同様（`achievementTitle` / `description` / `imageData`）
* **内部挙動**: `category`は`"WEB_APP"`固定、`isPublished`は`true`固定で登録される（下書き機能は未使用のため）
* **エラーレスポンス**: `achievementTitle`未指定 → `400`、未認証・権限不足時 → `404 Not Found`
* 補足：ルーティングコードのコメントに「URLの先頭に`/admin`は付けず、インデックス側で合流させる」とある通り、旧設計（`POST /api/admin/achievements`）とはパス構成が異なる。`api/src/index.ts`側でこのルーターがどのプレフィックス（`/api`等）にマウントされているか未確認のため、実際に叩く際は要確認。

---

## 3. お問い合わせ機能ON/OFF設定（ContactSetting）関連エンドポイント

### ⑤ 設定状態の取得
* **Endpoint**: `GET /api/contact-setting`
* **認証要否**: 不要（公開。Contactページの表示切り替えに使用）
* **Response (200 OK)**:
    ```json
    { "isEnabled": true }
    ```

### ⑥ 設定状態の更新（管理者専用）
* **Endpoint**: `PUT /api/admin/contact-setting`
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

`sessionController.ts`に以下2つの処理が実装されていますが、対応する**ルーティングファイルの内容が未確認**のため、実際のパスは仮置きです。ルーティング定義（`sessionRoutes.ts`等）を確認して修正してください。

### ⑦ セッションCookie作成（ログイン時）
* **Endpoint**: `POST /api/session`（暫定・要確認）
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

### ⑧ セッションCookie検証（`/admin`アクセス時、`proxy.ts`から利用）
* **Endpoint**: `GET /api/session/verify`（暫定・要確認）
* **認証要否**: セッションCookie自体が検証対象
* **Cookie解析の実装ポイント**: `.split('=')[1]`ではなく`.slice('session='.length)`を使用（base64値に含まれる`=`を誤って切り落とさないための対策）
* **Response**:
  - 検証成功 → `200 OK { "ok": true }`
  - Cookie未指定・検証失敗（`checkRevoked: true`でログアウト済み・失効セッションも含む）→ **`404 Not Found`**（`authMiddleware`と同じ「存在の隠蔽」方針）

---

## 5. 問い合わせ送信エンドポイント

* **Endpoint**: `POST /api/contact`
* **認証要否**: 不要（公開）
* **Request Body**（`db.md`の`Inquiry`モデルに合わせてフィールド名が変更されている点に注意。旧: `senderName`/`senderEmail`/`messageContent` → 現在の想定: `name`/`email`/`message`）:
    ```json
    {
      "name": "野澤 太成",
      "email": "nozawa@example.com",
      "message": "お仕事のご相談です。"
    }
    ```
* **内部挙動**: `ContactSetting.isEnabled`が`false`の場合は送信を拒否する想定（メンテナンスモード）。DB（`Inquiry`テーブル）へ保存後、Nodemailer経由でメール通知。
* ⚠️ `contactController.ts` / `contactService.ts`の現在の実装内容は未確認のため、上記は`db.md`のスキーマ変更点から逆算した推測を含みます。実装を確認の上、必要であれば修正してください。

---

## 6. ドキュメントの正確性について

①〜④（実績関連）は`achievementController.ts`・`achievementService.ts`・`achievementRoutes.ts`の実物を確認済みで、内容は正確です。⑤⑥（ContactSetting）はコントローラー実物を確認済みです。一方、⑦⑧（セッション関連）と5章（問い合わせ送信）は**ルーティングファイル・コントローラーの一部が未確認**のため、パスやフィールド名は推測を含みます。今後、該当ファイルを共有してもらえれば、都度正確な内容に更新します。