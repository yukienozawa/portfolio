// ============================================================
// このファイルの責務：ルーティングのエントリーポイントのみ
// 画面ロジックは components/ProfilePage.tsx に集約している
// ============================================================

import ProfilePage from "@/components/ProfilePage";
 
export default function Page() {
  // ProfilePage コンポーネントをそのまま返すだけ
  // このファイル自身はロジックを一切持たない
  return <ProfilePage />;
}