---
name: API Specification draft
about: バックエンド（Express）が提供するエンドポイントの定義およびリクエスト・レスポンス案
title: '[Doc] APIエンドポイントおよびインターフェース定義'
labels: api, design
assignees: ''
---

## 1. API候補一覧
公開用API、管理画面用API、外部連携APIに分類して定義します。

### 認証・認可ポリシー
- **公開API**: 認証不要。誰でもアクセス可能。
- **Admin専用API**: Firebase AuthのIDトークン検証が必須。管理者権限がない、または未認証の場合は **HTTP 404** を返却し、エンドポイント自体の存在を隠匿します。

---

## 2. エンドポイント詳細

### ① 実績一覧の取得
* **Endpoint**: `GET /api/achievements`
* **認証要否**: 不要（公開）
* **Request**: なし
* **Response (200)**:
    ```json
    [
      {
        "id": 1,
        "achievementTitle": "ECサイトリニューアル",
        "description": "フロントエンドのNext.js移行を担当。",
        "imageData": "data:image/png;base64,iVBORw0KGgoAAA...",
        "createdAt": "2026-05-26T02:30:00.000Z"
      }
    ]
    ```

### ② 実績の新規登録
* **Endpoint**: `POST /api/admin/achievements`
* **認証要否**: **必要（Adminのみ）**
* **Request Headers**:
    ```http
    Authorization: Bearer <Firebase_ID_Token>
    ```
* **Request Body**:
    ```json
    {
      "achievementTitle": "新規モジュール開発",
      "description": "Expressを用いたマイクロサービスの実装。",
      "imageData": "data:image/png;base64,iVBORw0KGgoAAA..."
    }
    ```
* **Response (201)**:
    ```json
    {
      "id": 2,
      "achievementTitle": "新規モジュール開発",
      "success": true
    }
    ```
* **エラーレスポンス (未認証・権限不足時)**:
    * **Status**: `404 Not Found` （※セキュリティ要件に基づく存在隠蔽）

### ③ 問い合わせ送信
* **Endpoint**: `POST /api/contact`
* **認証要否**: 不要（公開）
* **Request Body**:
    ```json
    {
      "senderName": "山田 太郎",
      "senderEmail": "yamada@example.com",
      "messageContent": "お仕事のご相談です。"
    }
    ```
* **Response (200)**:
    ```json
    {
      "success": true,
      "message": "Inquiry received successfully."
    }
    ```
* **内部挙動**: DB（Inquiriesテーブル）へテキストデータとして蓄積後、Slack等のWebhook通知をリアルタイムにトリガーします。