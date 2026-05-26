```
2026.05.26更新
.
├── .github/                           # ⚙️ GitHub設定フォルダ
│   └── ISSUE_TEMPLATE/               # 📋 タスク管理用カスタムIssueテンプレート群（作成済）
│       ├── 01-bug_report.yml
│       ├── 02-feature_request.yml
│       ├── 03-support.yml
│       ├── 04-execution_report.yml
│       └── 05-progress_management.yml
├── api/                               # 🔑 サーバー側 / バックエンド (Express + TypeScript)
│   ├── prisma/
│   │   └── schema.prisma             # 💎 DBモデル定義＆接続設定（Docker MySQLとの開通テスト成功！）
│   ├── scripts/                      # 🧪 テストデータ挿入（シード）等のスクリプト格納庫
│   │   ├── seed-test-db.ts
│   │   └── tsconfig.json
│   ├── src/
│   │   ├── controllers/             # 🕹️ コントローラー層：リクエスト受付とレスポンス返却
│   │   ├── middlewares/             # 🛡️ ミドルウェア層：認証(Firebase Admin)やエラー処理
│   │   ├── routes/                  # 🌐 ルーティング層：APIエンドポイントの定義
│   │   ├── services/                # ⚙️ サービス層：ビジネスロジック・Prismaを介したDB操作
│   │   ├── utils/                   # 🧰 ユーティリティ層：共通のヘルパー関数
│   │   └── index.ts                 # 🚀 Expressサーバーのエントリーポイント（起動ファイル）
│   ├── .env                         # 🔒 バックエンド環境変数（DB接続文字列やFirebase秘密鍵パス）
│   ├── .gitignore
│   ├── .prettierrc
│   ├── eslint.config.mjs            # 🎨 Linter設定（Airbnb規約準拠・Lintチェック合格！）
│   ├── package-lock.json
│   ├── package.json                 # 📦 バックエンドの依存ライブラリ・スクリプト管理
│   └── tsconfig.json                # 📐 TypeScript設定（strict: true 適用済）
├── docs/                              # 📄 設計書（真実のソース・全7大ドキュメント整備完了！）
│   ├── architecture/                # 🗺️ アーキテクチャ図面・システムフロー
│   │   ├── system-architecture.jpg
│   │   └── system-flowchart.md
│   ├── issues/                      # 🎯 フェーズごとのタスク詳細・進捗管理
│   │   └── phase-1-setup.md
│   ├── api.md                       # 🌐 APIエンドポイントおよびインターフェース定義書
│   ├── db.md                        # 🗄️ データベース設計およびPrisma Schema定義書
│   ├── MEMO.md                      # 📝 開発中の備忘録・一時メモ
│   ├── overview.md                  # 🗺️ ポートフォリオ概要・全体アーキテクチャ策定書
│   ├── rules.md                     # ⚖️ 開発規約・AI実装禁止事項ルールブック
│   ├── screens.md                   # 📺 画面一覧・UI仕様および状態管理概要書
│   ├── test.md                      # 🧪 テスト戦略・品質担保方針の定義書
│   └── tree.md                      # 🌳 本ディレクトリ構造解説ファイル
├── front/                             # 🎨 クライアント側 / フロントエンド (Next.js App Router)
│   ├── src/
│   │   ├── app/                     # 📂 App Router：ページルーティング
│   │   │   ├── admin/               # 🔒 管理画面エリア（未認証時は404存在隠蔽の対象）
│   │   │   ├── layout.tsx           # フロント共通のルートレイアウト
│   │   │   └── page.tsx             # 🌐 ポートフォリオのトップページ画面
│   │   ├── components/              # 🧱 画面共通の独立UIコンポーネント（Button, Headerなど）
│   │   ├── features/                # 🧩 機能ごと（実績、コンタクト等）の画面・ロジック塊
│   │   ├── hooks/                   # 🎣 局所状態やAPI通信を管理するカスタムフック
│   │   ├── lib/                     # 📡 外部連携設定（Firebase初期化やAPIクライアント設定など）
│   │   ├── types/                   # 🏷️ フロントエンド専用の型定義
│   │   └── middleware.ts            # 🛡️ フロントエンド側のルーティング保護ミドルウェア
│   ├── .gitignore
│   ├── .prettierrc
│   ├── eslint.config.mjs            # 🎨 Linter設定（Airbnb規約準拠・Lintチェック合格！）
│   ├── package-lock.json
│   ├── package.json                 # 📦 フロントエンドの依存ライブラリ・スクリプト管理
│   └── tsconfig.json                # 📐 TypeScript設定（strict: true 適用済）
├── compose.yaml                       # 🐳 データベース（MySQL）用Docker構成ファイル（起動成功！）
└── README.md                          # 🏠 プロジェクト総合ガイド（実際の構成に合わせ更新完了！）
```