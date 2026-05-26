---
name: Phase 4 Frontend Development
about: 公開ページ群および管理画面の実装、Routing保護（404存在隠蔽）のタスク定義
title: '[Doc] Phase 4: フロントエンド画面群の実装とルーティング保護'
labels: 'scope: docs, type: setup'
assignees: ''
---

# Phase概要
Phase 4は、フロントエンド（`front` フォルダ）において、Next.js (App Router) を用いたすべての画面（公開ページ群および管理画面）を実装するフェーズです。バックエンドAPI（`api` 側）との通信をカチッと繋ぎ込み、フォームの入力値や管理画面への厳格なアクセス制御（404存在隠蔽）を画面側に組み込みます。

---

## 🛠️ タスク1：公開ページ群（Top/Profile/Works/Skills/Contact）の画面実装 (Issue #10)

### 1. 目的
ポートフォリオの核となる公開画面群を構築し、データベースから取得した実績やスキルをユーザーが閲覧・操作できるようにするため。

### 2. 対象ファイル・領域
- **領域**: `front` (Next.js App Router)
- **編集・新規作成**:
  * `front/src/app/page.tsx` （トップページ）
  * `front/src/app/profile/page.tsx` （プロフィール）
  * `front/src/app/works/page.tsx` （実績一覧：`GET /api/achievements` からデータ取得・表示）
  * `front/src/app/skills/page.tsx` （スキル一覧）
  * `front/src/app/contact/page.tsx` （問い合わせフォーム：`POST /api/contact` へ送信）

### 3. 実実装内容
- **Works画面**: ページアクセス時にバックエンドAPIから実績データを動的に取得し、カード型UIで美しく配置する。
- **Contactフォーム**: `useState` を用いて、お名前（`senderName`）、メールアドレス（`senderEmail`）、本文（`messageContent`）の入力値を制御。必須バリデーションチェックを行い、ボタン押下時にAPIへ送信する。

### 4. 完了条件
- [ ] 各公開ページ（`/`, `/profile`, `/works`, `/skills`, `/contact`）がエラーなくブラウザで正常に表示されること。
- [ ] 問い合わせフォームから送信した際、バックエンドへの疎通と送信完了メッセージが正常に表示されること。

---

## 🛠️ タスク2：管理画面（/admin）の構築とフロントエンドRouting保護の実装 (Issue #11)

### 1. 目的
実績の管理を行うエリア（`/admin`）を構築し、未認証の第三者からのアクセスに対しては画面の存在自体を完全に隠匿するため。

### 2. 対象ファイル・領域
- **領域**: `front` (Next.js App Router)
- **編集・新規作成**:
  * `front/src/middleware.ts` （ルーティング保護ガード）
  * `front/src/app/admin/page.tsx` （管理者ダッシュボード）
  * `front/src/app/admin/edit/page.tsx` （実績登録・編集フォーム：画像Base64変換UI内包）

### 3. 実実装内容
- **最重要セキュリティ（存在隠蔽）**: `front/src/middleware.ts` で `/admin` 配下へのアクセスを監視する。Firebaseのセッションを確認し、未ログイン（またはAdmin権限なし）の場合は、ログイン画面へリダイレクトさせてはならない。フロント側で**直接 `NotFound` コンポーネントを呼び出して404画面を描画**し、管理画面の存在自体を隠蔽する。
- **edit画面のフォーム**: 実績名（`achievementTitle`）、説明文（`description`）の入力と、画像（`imageData`）のファイル選択UIを実装。選択された画像はフロント側でBase64文字列（またはBlob）へと変換処理を行い、バックエンドのAdmin専用APIへ `Authorization` ヘッダー（Firebase IDトークン）を同梱してPOST送信する。

### 4. 完了条件
- [ ] 管理者アカウントで正常にログインし、`/admin` や `/admin/edit` のフォームが利用できること。
- [ ] 未ログインのシークレットウィンドウ等から `/admin` へ直接URLを叩いてアクセスした際、リダイレクトが発生せず、通常の「404 Not Found」画面が描画されること。
- [ ] 開発規約（any禁止、セマンティック命名）に違反していないこと。