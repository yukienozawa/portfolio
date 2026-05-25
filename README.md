# ⚠️本READMEについて
一旦section5のREADMEをテンプレとして以下は残しておきます。後ほど更新予定。

# プロジェクト開発・品質管理（QA）ガイド

フロントエンド（Next.js）とバックエンド（Express/Prisma）の2軸で構成され、静的解析（ESLint）、自動整形（Prettier）、および単体・結合テスト（Vitest）による厳格な品質管理（QA）を導入。

---

## 🛠️ テスト・検証コマンド

各ツールは、ローカル環境で直接実行するか、Dockerコンテナ内で実行するかによってコマンドが異なります。環境に合わせて使い分けてください。

### 🟩 フロントエンド (`front` フォルダ)

| 目的 | ローカル（直叩き） | Dockerコンテナ経由 |
| :--- | :--- | :--- |
| **単体テスト起動 (Watch)** | `npm run test` | `docker compose exec front npm run test` |
| **カバレッジ（網羅率）測定** | `npm run test:coverage` | `docker compose exec front npm run test:coverage` |
| **構文チェック (Lint)** | `npm run lint` | `docker compose exec front npm run lint` |
| **コード自動整形 (Format)** | `npm run format` | `docker compose exec front npm run format` |

### 🟦 バックエンド (`api` フォルダ)

| 目的 | ローカル（直叩き） | Dockerコンテナ経由 |
| :--- | :--- | :--- |
| **単体テスト起動 (Watch)** | `npm run test` | `docker compose exec api npm run test` |
| **テスト用DBの同期** | `npm run db:push:test` | `docker compose exec api npm run db:push:test` |
| **結合・統合テスト実行** | `npm run test:integration` | `docker compose exec api npm run test:integration` |
| **カバレッジ（網羅率）測定** | `npm run test:coverage` | `docker compose exec api npm run test:coverage` |
| **構文チェック (Lint)** | `npm run lint` | `docker compose exec api npm run lint` |
| **コード自動整形 (Format)** | `npm run format` | `docker compose exec api npm run format` |

> 💡 **QA視点のTips: カバレッジの視覚化**
> `test:coverage` を実行すると、各フォルダ内に `coverage/index.html` が生成されます。これをブラウザで開くと、コードのどの行がテスト未通過かをビジュアルで確認できる。

---

## 📋 主要パッケージ・環境構成

### 1. 静的解析・コード成形（規約の統一）
*   **ESLint / TypeScript-ESLint**: コードの潜在的なバグを自動検知。
*   **eslint-config-airbnb-base** (API側): 業界で最も厳格とされるAirbnbのコード規約をベースに採用。
*   **Prettier**: インデント、クォーテーションなどの見た目を自動統一。
*   **eslint-config-prettier**: ESLintとPrettierのルール衝突を完全に回避。

### 2. テスト・品質保証（QAの3階層）
*   **Vitest (v4.1.6)**: フロント/バック共通の高レスポンスな単体テスト環境。
*   **@vitest/coverage-v8**: C0/C1カバレッジ（網羅率）の自動測定。
*   **@testing-library/react & jsdom**: Reactコンポーネントの挙動・DOMテスト。
*   **Supertest** (API側): HTTPリクエスト/レスポンスのモックテスト（結合テスト用）。
*   **Cypress**: ユーザーの操作シナリオをブラウザでエミュレートするE2Eテスト環境。

### 3. コアスタック
*   **Front**: Next.js (v16.2.4) / React (v19.2.4) / Chakra UI
*   **API**: Express (v5.2.1) / Prisma (v6.19.3) / TypeScript (v6.0.3)

> 💡 **QA視点のTips: テスト用環境変数のインライン管理について**
> テスト用の物理ファイル（`.env.test`等）を作成していません。ファイル分割時に発生した「テスト実行時に開発/本番用のポートやDB接続先を誤って呼び出してしまうトラブルが頻発したため、`cross-env` を使用してコマンド実行時のみメモリ上でテスト用環境変数を注入しました。

### 📝 【検証実績】本プロジェクトで実際に通したテストファイル一覧

* **🟩 フロントエンド側 (`front`)**
    ```text
    front/
    ├── .env.example ── ※フロント側の環境変数テンプレート
    ├── .env.local   ── ※ローカル開発環境用の環境変数ファイル
    ├── cypress/
    │   ├── e2e/
    │   │   └── 🧪 record.cy.ts      （E2Eテスト：入力〜保存〜履歴遷移の全画面貫通シナリオ）
    │   ├── fixtures/
    │   │   └── 📄 example.json     （E2Eテスト用：テストデータの定義ファイル）
    │   └── support/
    │       ├── 🧪 commands.ts       （UI・システム連携層テスト：独自カスタムコマンドの定義）
    │       └── 🧪 e2e.ts            （E2Eテスト全体：共通のインポートや事前設定ファイルを管理）
    └── src/
        ├── components/
        │   └── features/
        │       └── record/
        │           └── 🧪 EntryForm.test.tsx （UI層テスト：画面コンポーネント挙動）
        └── lib/
            ├── 🧪 math.test.ts （スモークテスト：基本動作確認）
            └── api/
                └── 🧪 transactions.test.ts （ロジック層テスト：データ処理）
    ```

* **🟦 バックエンド側 (`api`)**
    ```text
    ※api/の誤って2重階層にしてしまいました。後日修正必要箇所。
    api/
    └── api/
        ├── ⚙️ .env.test ── ※【不使用】ポート誤呼出トラブル防止のため、現在はcross-envによるインライン注入に移行
        ├── scripts/
        │   └── 🧪 seed-test-db.ts （テスト用DB初期化・シードデータ投入スクリプト）
        └── src/
            └── __tests__/
                ├── 🧪 integration.smoke.test.ts （基本検証：スモークテスト）
                ├── 🧪 categories.unit.test.ts   (ロジック層・単体テスト：モックによる正常系/異常系検証)
                └── 🧪 categories.int.test.ts    （結合テスト：DB連携検証層）
    ```