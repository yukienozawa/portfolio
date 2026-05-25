### `docs/db.md` 
# データベース設計書（Prisma/MySQL）

Prisma ORMによるMySQLのスキーマ定義、およびリレーション構造を厳格に定義します。

## 1. モデル定義

### 📄 Transaction（取引テーブル）
レシート単位の親データを管理します。
- `id` (String): 主キー（UUID等）。
- `type` (Int): 収支タイプ。`0`: 収入 / `1`: 支出。
- `date` (String): 取引日。`YYYY-MM-DD` 形式。
- `storeId` (String?): 暫定的にオプショナル。マスター移行後はStoreモデルとリレーション。
- `accountId` (String): 口座マスター（Account）への外部キー。
- `totalAmount` (Int): 全明細の合計金額。
- `createdAt` (DateTime): 作成日時。デフォルトは `now()`。
- `updatedAt` (DateTime): 更新日時。`@updatedAt` による自動更新。

### 📄 TransactionDetail（取引明細テーブル）
取引に紐づく1行ごとの品目データを管理します。
- `id` (String): 主キー。
- `transactionId` (String): 取引（Transaction）への外部キー。
- `itemName` (String): 品目名。
- `categoryId` (String): カテゴリマスター（Category）への外部キー。
- `amount` (Int): 単価（正の整数）。
- `quantity` (Int): 数量。初期値は `1`。
- `memo` (String?): 備考。最大30文字以内。

### 📄 Category（カテゴリマスター）
- `id` (String): 主キー。
- `name` (String): カテゴリ名。
- `type` (Int): 収支タイプ。`0`: 収入 / `1`: 支出。
- `sortOrder` (Int): 並び順。数値が小さいほど上位表示。

### 📄 Account（口座マスター）
- `id` (String): 主キー。
- `name` (String): 口座名。
- `sortOrder` (Int): 並び順。数値が小さいほど上位表示。

## 2. リレーション案（Prisma定義ベース）

- **Transaction と TransactionDetail**: `1 : 複（一対多）`
  - 取引（親）が削除された場合、紐づく明細（子）も連動して自動削除される（`onDelete: Cascade`）。
- **Account と Transaction**: `1 : 複（一対多）`
  - 口座は複数の取引に紐づきます。
- **Category と TransactionDetail**: `1 : 複（一対多）`
  - 各明細は必ず1つのカテゴリに属します。

## 3. enum案 (Prismaにおける制約)
MySQLのパフォーマンスと厳格な型安全を両立するため、アプリケーション側では以下の整数値（`Int`）としてマッピングします。
- **収支タイプ（Type）**:
  - `0`: 収入 (INCOME)
  - `1`: 支出 (EXPENSE)