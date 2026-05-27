---
name: Phase 4 Frontend Development
about: 公開ページ群および管理画面の実装、Routing保護（404存在隠蔽）のタスク定義
title: '[Doc] Phase 4: フロントエンド画面群の実装とルーティング保護'
labels: 'scope: docs, type: setup'
assignees: ''
---

# Phase概要
Phase 4は、フロントエンド（`front` フォルダ）において、Next.js (App Router) を用いたすべての画面（公開ページ群および管理画面）を実装するフェーズです。
メンターのアドバイスに基づき「フロントエンド先行開発」を採用。バックエンド未実装の状態でもモックデータを活用して完全に動作する画面群を構築し、UI/UXの確定と必要なAPI仕様の逆引き策定を行います。

---

## 🛠️ タスク1：公開ページ群（Top/Profile/Works/Skills/Contact）の画面実装 (Issue #10)

### 1. 目的
ポートフォリオの核となる公開画面群を構築し、実績やスキルをユーザーが閲覧・操作できるようにするため。

### 2. 対象ファイル・領域
- **領域**: `front` (Next.js App Router)
- **作成ファイル**:
  * `front/src/app/page.tsx` （トップページ：ナビゲーションおよびTech Stackバッジ）
  * `front/src/app/profile/page.tsx` （プロフィール：セマンティックHTMLによる自己紹介）
  * `front/src/app/works/page.tsx` （実績一覧：Next.js `<Image>` および `unoptimized` 属性を用いたカード型UI）
  * `front/src/app/skills/page.tsx` （スキル一覧：インラインスタイルを併用した動的レベルメーターコンポーネント）
  * `front/src/app/contact/page.tsx` （問い合わせフォーム：`useState` オブジェクト管理と送信 loading 制御）

### 3. 実装内容
- **Works画面**: ページアクセス時にモックデータ（`MOCK_ACHIEVEMENTS`）を動的にマッピング。将来のBase64画像表示を見据え、Next.jsの画像最適化をバイパスする `unoptimized` 属性を先行実装。
- **Skills画面**: スキルレベル（1〜5）を親しみやすいメーター形式で視覚化する `SkillBar` コンポーネントを切り出し、スプレッド構文によるスマートなデータ受け渡しを実現。
- **Contactフォーム**: お名前（`senderName`）、メールアドレス（`senderEmail`）、本文（`messageContent`）の入力を単一のハンドラー（ブラケット記法）で制御。ローカルバリデーション（メール形式正規表現含む）をパスした段階で `/api/contact` へリクエストを送出する連打防止（loading）付き送信ロジックを配備。

### 4. 完了条件
- [x] 各公開ページ（`/`, `/profile`, `/works`, `/skills`, `/contact`）がエラーなくブラウザで正常に表示されること。
- [x] 問い合わせフォームにおいて、送信中ステータスおよび送信後の成否メッセージ表示（UX制御）が正常に機能すること。
- [x] ESLintおよびTypeScriptのチェック（`any` 禁止規約）を完全クリーンに通過していること。

---

## 🛠️ タスク2：管理画面（/admin）の構築とフロントエンドRouting保護の実装 (Issue #11)

### 1. 目的
実績の管理を行うエリア（`/admin`）を構築し、未認証の第三者からのアクセスに対しては画面の存在自体を完全に隠匿するため。

### 2. 対象ファイル・領域
- **領域**: `front` (Next.js App Router)
- **作成ファイル**:
  * `front/src/middleware.ts` （ルーティング保護ガード：src直下配置）
  * `front/src/app/admin/page.tsx` （管理者ダッシュボード：実績テーブルUIおよび認証ガード）
  * `front/src/app/admin/edit/page.tsx` （実績登録・編集フォーム：画像Base64変換UIおよび既存データ取得）

### 3. 実実装内容
- **最重要セキュリティ（存在隠蔽）**: `front/src/middleware.ts` で `/admin/:path*` を監視。未認証ユーザーがアクセスした際、リダイレクトを一切発生させず、**`NextResponse.rewrite()` を用いて裏側で Next.js 標準の 404 画面（`/_not-found`）をフェッチして描画**。URLを変更せずに管理画面の存在自体を完全に隠蔽する。
- **Dashboard画面**: `auth.onAuthStateChanged` によるクライアントサイドの認証監視。未ログイン時はNext.jsの `notFound()` を直接トリガーし、厳格な二重ガードを敷く。データ取得関数は `useEffect` 内に隠蔽（ローカル関数化）し、依存関係の安全性を担保。
- **Edit画面のフォーム**: 実績名（`achievementTitle`）、説明文（`description`）の入力を制御。`FileReader API` を用いたサムネイル画像のBase64変換プレビューUIを内包し、URLクエリ（`id`）の有無から「新規登録（POST）」と「既存編集（PUT）」の振る舞いを自動判定する柔軟な送信機構を実装。

### 4. 完了条件
- [x] 管理者アカウントで正常にログインした際、ダッシュボードや登録・編集フォームのUIが利用できること。
- [x] 未ログイン状態で `/admin` または `/admin/edit` へ直接URLを入力してアクセスした際、通常の「404 Not Found」画面が描画され、管理機能の存在が完全に隠蔽されること。
- [x] `useEffect` の依存関係に起因する `react-hooks/exhaustive-deps` 警告がすべてのコンポーネントにおいて解決され、完全な型安全が維持されていること。

---

## 📋 品質・コーディング規約（フロントエンド）
- **TypeScript構成**: `strict: true` 環境に基づき、すべてのコンポーネント、イベントハンドラー、フックにおいて `any` の使用を全面的に禁止。
- **セマンティックマークアップ**: MDN推奨の `<main>`, `<section>`, `<article>`, `<table>` などのセマンティックなタグ選定を徹底し、アクセシビリティと構造の明確さを担保する。
- **命名方針**: 略称を避け、キャメルケースを用いた人間が理解できるセマンティックな命名を徹底する（例: `senderName`, `achievementTitle`, `messageContent`）。