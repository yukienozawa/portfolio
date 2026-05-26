import { PrismaClient } from "@prisma/client";

// テスト用DBへ接続
const prisma = new PrismaClient({
  datasources: {
    db: { url: "mysql://admin:password@localhost:3307/bluegold_test" },
  },
});

async function main() {
  // 全テーブルをクリア
  // ※外部キー制約に引っかかる場合は、子→親の順序で削除してください
  await prisma.$transaction([
    prisma.transaction.deleteMany(),
    prisma.category.deleteMany(),
    // 必要であれば他のテーブルも追加
  ]);

  // 初期データを投入
  await prisma.category.createMany({
    data: [
      { name: "食費", type: 1, sortOrder: 1 },
      { name: "交通費", type: 1, sortOrder: 2 },
    ],
  });

  console.log("✅ DB seed completed");
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
