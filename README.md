---
name: Root README Setup
about: プロジェクトのルートに配置し、概要、セットアップ、開発・テスト手順、規約を網羅する総合ガイド
title: 'Setup: ルートREADME.mdの初期バージョン作成'
labels: 'scope: docs, type: setup'
assignees: ''
---

# ポートフォリオ開発プロジェクト (Fullstack Portfolio)

本プロジェクトは、Next.js（フロントエンド）とExpress（バックエンド）をサーバー間通信で連携させ、Prisma/MySQLでデータ管理を行う、管理画面付きフルスタック・ポートフォリオアプリケーションです。

---

## 概要

開発・運用において「コード品質の自動統一」と「セマンティックな設計」を重視し、堅牢かつ運用のしやすいポートフォリオ基盤を目指します。
ルート配下の `docs/` ディレクトリに格納された設計書（`overview.md`, `api.md`, `db.md`, `rules.md`, `test.md`, `screens.md`）を唯一の信頼できるソース（真実のソース）とし、コードの成長とともに段階的にドキュメントをアップデートしていく方針（Docs as Code）を採用しています。

---

## MVP (Minimum Viable Product)

「最小限の労力でアイデアを検証する」という原則に基づき、初回のゴールを以下に限定します。

* **公開側**: プロフィールおよび実績一覧をデータベースから動的に取得・表示できること。
* **管理側**: Firebase Authenticationによるログイン後、実績のテキスト情報を登録・更新（CRUD）できること。
* **品質**: strict TypeScript、Airbnb規約、MDN準拠のセマンティックな命名、基本単体テストの合格。

---

## 技術構成

`package.json` および基本設計に準拠した主要な技術スタックです。

* **フロントエンド**: Next.js (App Router) / TypeScript (`strict: true`)
* **バックエンド**: Express / TypeScript
* **データベース / ORM**: MySQL / Prisma
* **認証・認可**: Firebase Authentication (Firebase Admin SDK)
* **静的解析・整形**: ESLint (Airbnb JavaScript Style Guide) / Prettier
* **テスト**: Vitest (Unit / API), Cypress (E2E)
* **インフラ（Advanced）**: AWS (HTTPS環境), Redis（※MVP完成後に導入判断）

---

## セットアップ

リポジトリをクローンした後、以下の手順で環境構築から起動までを行えます。

### 1. 依存関係のインストール
各サブディレクトリ（`front`、`api`）にてパッケージをインストールします。
```bash
# front と api のそれぞれの配下で実行
npm install