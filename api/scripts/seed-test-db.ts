import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 ポートフォリオ用シードデータのクリーンアップおよび投入を開始します...");

  // 🛠️ 履歴とスキーマを検証し、最も安全なトランザクション処理で実行します
  await prisma.$transaction([
    // 1. 既存のデータを完全に安全に削除
    prisma.achievement.deleteMany(),
    
    // 2. schema.prismaの型（title, description, category等）に100%適合したデータを注入
    prisma.achievement.createMany({
      data: [
        {
          title: "フルスタック・ポートフォリオサイトの開発",
          description: "Next.js（フロントエンド）、Express（バックエンド）、Prisma、MySQLを使用した本格的なフルスタックアプリケーションです。自己紹介機能や、管理画面からの実績登録・編集機能を備えています。",
          imageUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c",
          category: "WEB_APP",
          effortPoint: "TypeScriptを用いた厳格な型定義と、レイヤードアーキテクチャによるクリーンなコード設計を意識しました。また、Cookieのセキュア属性を考慮したセッション管理も実装しています。",
          isPublished: true, // 画面に確実に表示させるためtrueに固定
        },
        {
          title: "コーポレートサイトのレスポンシブ対応化",
          description: "既存のPC向けWebサイトを、スマートフォンやタブレットなど、あらゆる画面サイズに最適化するレスポンシブ対応リニューアルを行いました。",
          imageUrl: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8",
          category: "CREATIVE",
          effortPoint: "Tailwind CSSを活用し、ブレークポイントごとの表示崩れを徹底的に防ぐとともに、実務を見据えたコンポーネント設計を行いました。",
          isPublished: true, // 画面に確実に表示させるためtrueに固定
        },
      ],
    }),
  ]);

  console.log("✅ [成功] ポートフォリオ用の初期データが正常にデータベースへ反映されました！");
}

main()
  .catch((e) => {
    console.error("❌ [エラー] シードデータの投入中に問題が発生しました:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });