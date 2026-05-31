// ==========================================================================
// このファイルの責務：ルーティングとページの設定（エントリーポイント）
// 画面ロジックは components/SkillsPage.tsx に集約している
// =========================================================================

import { SkillsPage } from "@/components/SkillsPage";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Skills | ポートフォリオ",
  description: "習得中・習得済みの技術スタック一覧です。",
};

const Page = () => {
  return <SkillsPage />;
};

export default Page;