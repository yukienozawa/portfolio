---
name: Database Schema Design
about: Prisma を使用した MySQL テーブル構造とモデルの定義
title: '[Doc] DB設計およびPrisma Schema候補の定義'
labels: database, prisma
assignees: ''
---

## 1. データベース方針
- **ORM**: Prisma を使用。
- **命名規則**: MDN推奨のキャメルケースを適用し、短縮形を避けたセマンティックな名称（例: `achievementTitle`）を採用します。
- **画像保持**: MVPフェーズではMySQL内にバイナリ/Base64（文字列またはBlob）として直接格納します。

---

## 2. Prisma Model 候補
以下を `prisma/schema.prisma` の構成案とします。

```prisma
datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-client-js"
}

/// ユーザー管理モデル（管理者認証用）
model User {
  id        Int      @id @default(autoincrement())
  firebaseId String   @unique // Firebase Authのuidとマッピング
  userEmail  String   @unique
  role      UserRole @default(GUEST)
  createdAt DateTime @default(now())
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

```
---

## 3. Enum 候補
コード スニペット
enum UserRole {
  ADMIN
  GUEST
}
---

## 4. リレーション案（未確定事項）
現状、Achievement や Skill に対する作成者の紐付け（User との 1:N リレーション）はMVP要件に含まれていません。

管理者が1名のみ（固定）の運用を想定しているため、現状は独立したテーブル群としてシンプルに構成します。必要に応じて将来拡張します。