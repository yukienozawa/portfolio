// ============================================================
// このファイルの責務：ルーティングのエントリーポイントのみ
// 画面ロジックは components/TopPage.tsx に集約している
// ============================================================
 
import TopPage from "@/components/TopPage";
 
export default function Page() {
  // TopPage コンポーネントをそのまま返すだけ
  // このファイル自身はロジックを一切持たない
  return <TopPage />;
}