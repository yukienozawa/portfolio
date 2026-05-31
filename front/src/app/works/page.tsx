// ============================================================
// このファイルの責務：ルーティングのエントリーポイントのみ
// 画面ロジックは components/WorksPage.tsx に集約している
// ============================================================

import WorksPage from "@/components/WorksPage";
 
export default function Page() {
  // WorksPage コンポーネントをそのまま返すだけ
  // このファイル自身はロジックを一切持たない
  return <WorksPage />;
}