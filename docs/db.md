---
name: Database Schema Design
about: Prisma を使用した MySQL テーブル構造とモデルの定義
title: '[Doc] DB設計およびPrisma Schema'
labels: 'scope: docs, type: setup'
assignees: ''
---

## 1. データベース方針
- **ORM**: Prisma を使用。
- **命名規則**: MDN推奨のキャメルケースを適用。
- **画像保持**: MVPフェーズではURL文字列（`imageUrl`）として保持する（当初案の「MySQL内にBase64/Blobを直接格納」からは変更されている点に注意。将来的に画像そのものを外部ストレージに置き、URLだけをDBに持たせる方針に寄せている）。
- **本番DB**: Aiven for MySQL（Free Plan）。詳細は `デプロイsetup.md` を参照。

> ⚠️ 以前のバージョンの本ドキュメントとは、モデル名・フィールド名・型がいくつか変更されています。差分は各モデルの説明を参照してください。

---

## 2. Prisma Schema（現状）

`api/prisma/schema.prisma` の実際の内容は以下の通りです。

```prisma
datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

// 1. ユーザー情報を管理するテーブル
model User {
  id        String   @id // Firebase Authenticationのuidをそのまま格納します
  email     String   @unique
  name      String?
  role      String   @default("USER") // "USER" または "ADMIN" (管理画面の隠蔽判定に使用)

  // 未来の拡張用（使わなくても空っぽでOKな器たち）
  avatarUrl   String?  // プロフィール画像（アイコン）のURL
  bio         String?  @db.Text // 自己紹介文・キャッチコピー（長文対応）
  githubUrl   String?  // あなた自身のGitHubリンク

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

// 2. 実績（ポートフォリオや成果物）を管理するテーブル
model Achievement {
  id          String   @id @default(uuid())
  title       String
  description String?  @db.Text
  imageUrl    String?  @db.LongText

  // アピール・カテゴリ拡張用
  category    String   @default("WEB_APP") // "WEB_APP", "CAREER", "CREATIVE" など
  effortPoint String?  @db.Text            // 工夫した点・学んだこと

  // 未来の拡張用
  siteUrl     String?
  githubUrl   String?
  techStack   String?
  isPublished Boolean  @default(false) // 公開フラグ（下書き保存に対応）

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

// 3. お問い合わせ情報を管理するテーブル
model Inquiry {
  id        String   @id @default(uuid())
  name      String
  email     String
  message   String   @db.Text
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

// 4. お問い合わせ機能のON/OFF設定を管理するテーブル
// 常に1行だけを更新して使う想定（新規行は基本的に増やさない）
model ContactSetting {
  id        Int      @id @default(autoincrement())
  isEnabled Boolean  @default(true) // true: 受付中 / false: メンテナンス中（送信停止）
  updatedAt DateTime @updatedAt
}
```

---

## 3. 旧バージョンからの主な変更点

| モデル | 変更内容 |
|---|---|
| `User` | `id`をautoincrementの`Int`ではなく、Firebase Authenticationの`uid`を直接`String`型の主キーとして採用。`firebaseId`という別カラムは廃止。`role`は`enum UserRole`ではなく`String`（`"USER"` / `"ADMIN"`）に変更。プロフィール表示用に`avatarUrl`・`bio`・`githubUrl`を追加。 |
| `Achievement` | `achievementTitle`→`title`、`imageData`(Base64/Blob想定)→`imageUrl`(URL文字列)にリネーム・方針変更。`category`・`effortPoint`・`siteUrl`・`githubUrl`・`techStack`・`isPublished`（下書き機能用フィールド）を新規追加。**`isPublished`はMVPスコープでは未使用と正式決定**。`createAchievement`実装でも`true`固定で登録され、公開/非公開の出し分けロジックは実装しない。フィールド自体は将来の拡張余地として残す。 |
| `Inquiry` | `senderName`→`name`、`senderEmail`→`email`、`messageContent`→`message`にリネーム。`receivedAt`は廃止し、`createdAt`/`updatedAt`の標準ペアに統一。 |
| `ContactSetting` | **新規追加**。お問い合わせフォームのON/OFF（メンテナンスモード）を管理する、常に1行のみのテーブル。 |
| `Skill` | **意図的に非採用（確認済み）**。`screens.md`では「スキル一覧表示」ページ（`/skills`）が設計されているが、`front/src/components/SkillsPage.tsx`を確認した結果、スキル情報はコンポーネント内にハードコードされた静的データ（`SKILL_CATEGORIES`定数）として管理されており、DBは一切使用していない。頻繁に変更する情報ではないため、DB管理化の必要性が薄いと判断し、意図的に静的データのまま運用している。将来的にスキル情報を管理画面から編集できるようにする場合は、`Skill`モデルの追加を検討する。 |

---

## 4. 命名規則についての補足

`rules.md`の命名規則（MDN準拠のセマンティックな命名）とは若干異なり、`title`・`name`・`email`・`message`のように短い一般名詞をそのまま使っている箇所があります（旧設計の`achievementTitle`・`senderName`等の「重複を避けた具体的な命名」からは後退している）。実害はありませんが、チーム開発や採用面接での説明時に一貫性の観点で聞かれる可能性があるため、意図的な変更であることを認識しておくとよいです。