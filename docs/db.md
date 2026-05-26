---
name: Database Schema Design
about: Prisma を使用した MySQL テーブル構造とモデルの定義
title: '[Doc] DB設計およびPrisma Schema候補の定義'
labels: 'scope: docs, type: setup'
assignees: ''
---

## 1. データベース方針
- **ORM**: Prisma を使用。
- **命名規則**: MDN推奨のキャメルケースを適用し、短縮形を避けたセマンティックな名称（例: `achievementTitle`）を採用します。
- **画像保持**: MVPフェーズではMySQL内にバイナリ/Base64（文字列またはBlob）として直接格納します。

---

## 2. Prisma Schema 構成案
プロジェクトの `api/prisma/schema.prisma` の中身を以下の構成とします。

```prisma
datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}


/// ユーザー管理モデル（管理者認証用）
model User {
  id         Int      @id @default(autoincrement())
  firebaseId String   @unique // Firebase Authのuidとマッピング
  userEmail  String   @unique
  role       UserRole @default(GUEST)
  createdAt  DateTime @default(now())
}

/// 実績コンテンツモデル
model Achievement {
  id               Int      @id @default(autoincrement())
  achievementTitle String   // MDNに準拠したセマンティックなキャメルケース
  description      String   @db.Text
  imageData        String   @db.LongText // Blob型、またはBase64文字列
  createdAt        DateTime @default(now())
}

/// スキル管理モデル
model Skill {
  id         Int      @id @default(autoincrement())
  skillName  String   @unique
  skillLevel String   // 例: "Advanced", "Intermediate"
  createdAt  DateTime @default(now())
}

/// お問い合わせデータモデル
model Inquiry {
  id             Int      @id @default(autoincrement())
  senderName     String
  senderEmail    String
  messageContent String   @db.Text
  receivedAt     DateTime @default(now())
}

/// 権限定義の列挙型
enum UserRole {
  ADMIN
  GUEST
}