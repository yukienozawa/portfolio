```mermaid
graph TD
    %% ユーザーの分類
    subgraph Users [ユーザー層]
        Anon[👤 未認証の第三者 / 一般ユーザー]
        Admin[👨‍💻 管理者ユーザー]
    end

    %% フロントエンド（Next.js）
    subgraph Frontend [フロントエンド: Next.js TypeScript / App Router]
        subgraph PublicPages [🌐 公開ページ: 誰でも閲覧可能]
            Top[トップページ]
            Profile[プロフィール]
            Works[実績]
            Skills[スキル]
            Contact[コンタクト / 問い合わせフォーム]
        end

        subgraph AdminPages [🔒 管理画面: 要ログイン]
            AdminPanel[🖥️ 管理者ダッシュボード]
            FormText[📝 テキスト編集フォーム]
            FormImg[🖼️ 画像アップロード機能]
        end

        Middleware{🛡️ ルーティング保護<br>Middleware}
        NextServer[⚙️ Next.js サーバー機能<br>Server Components / Actions]
    end

    %% 外部サービス（Firebase）
    subgraph External [外部サービス]
        FB_Auth[🔥 Firebase Authentication]
    end

    %% バックエンド（Express / Prisma）
    subgraph Backend [バックエンド & インフラ: AWS構築範囲]
        Express[🚀 バックエンドアプリ: Express.js]
        Prisma[💎 ORM: Prisma]
        Redis[⚡ キャッシュ: Redis ※ADVANCED]
    end

    %% データベース（MySQL）
    subgraph DB [データベース: MySQL / RDS]
        TableText[(📄 コンテンツテキスト テーブル)]
        TableImg[(🖼️ プロフィール画像 テーブル<br>Blob型/Base64)]
        TableInquiry[(✉️ お問い合わせデータ テーブル)]
    end

    %% 通知システム
    subgraph Notification [通知システム]
        Webhook[💬 Slack / メール Webhook通知]
    end

    %% -----------------------------------------
    %% データの流れ・ルーティングの定義
    %% -----------------------------------------

    %% 1. アクセス制御と404偽装 (GitHub/Notion方式)
    Anon -->|URL直打ち: /admin| Middleware
    Middleware -->|未認証のため存在を隠蔽| 404[❌ 404 Not Found 応答]

    %% 2. ログインと認可のフロー
    Admin -->|ログイン要求| AdminPages
    AdminPanel -->|認証・認可の確認 Admin権限| FB_Auth
    FB_Auth -->|認証成功セッション保持| AdminPanel

    %% 3. 管理画面からのデータ更新フロー (CREATE / UPDATE)
    FormText -->|① 更新テキスト送信| NextServer
    FormImg -->|② 画像バイナリ/Base64送信| NextServer
    NextServer --> Express
    Express --> Prisma
    Prisma -->|テキストデータ上書き| TableText
    Prisma -->|バイナリデータとして直接保持| TableImg

    %% 4. 公開ページのデータ表示フロー (READ)
    TableText -->|最新テキスト取得| Express
    TableImg -->|最新画像データ取得| Express
    Express -.->|高速化のためのキャッシュ| Redis
    Express --> NextServer
    NextServer -->|SSG / SSR / ISR で高速描画| PublicPages

    %% 5. 問い合わせフォームのフロー (CREATE & NOTIFY)
    Contact -->|ユーザーが問い合わせ送信| NextServer
    NextServer --> Express
    Express --> Prisma
    Prisma -->|テキストデータとして蓄積 ※映像データではない| TableInquiry
    Express -->|送信と同時にリアルタイムトリガー| Webhook