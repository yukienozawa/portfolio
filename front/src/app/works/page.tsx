import Image from "next/image";
 
// ============================================================
// 型定義
// ============================================================
 
interface Achievement {
  id: string;
  achievementTitle: string;
  description: string;
  imageData: string | null;
}
 
// ============================================================
// 仮データ（API連携後に差し替える）
// ============================================================
 
const MOCK_ACHIEVEMENTS: Achievement[] = [
  {
    id: "1",
    achievementTitle: "家計簿アプリ（BlueGold）",
    description:
      "React + Express + MySQL を使った収支管理アプリ。カテゴリ・口座ごとの明細管理や、月次サマリーの可視化を実装。",
    imageData: null,
  },
  {
    id: "2",
    achievementTitle: "ポートフォリオサイト",
    description:
      "Next.js (App Router) + TypeScript + Tailwind CSS で構築した本サイト。Firebase認証による管理画面付き。",
    imageData: null,
  },
  {
    id: "3",
    achievementTitle: "TODO管理アプリ",
    description:
      "React Hooks を使ったシンプルなタスク管理アプリ。ドラッグ＆ドロップによる並び替えやフィルタリングを実装。",
    imageData: null,
  },
];
 
// ============================================================
// 子コンポーネント
// ============================================================
 
const AchievementCard = ({ achievement }: { achievement: Achievement }) => (
  <article className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow">
    {/* サムネイル */}
    <div className="relative w-full h-48 bg-slate-100 flex items-center justify-center text-slate-400">
      {achievement.imageData ? (
        // ✅ Base64画像は Next.js の最適化対象外のため unoptimized を指定
        <Image
          src={achievement.imageData}
          alt={achievement.achievementTitle}
          fill
          className="object-cover"
          unoptimized
        />
      ) : (
        <span className="text-sm">No Image</span>
      )}
    </div>
 
    {/* テキスト */}
    <div className="p-6">
      <h2 className="text-lg font-bold text-slate-800 mb-2">{achievement.achievementTitle}</h2>
      <p className="text-sm text-slate-600 leading-relaxed">{achievement.description}</p>
    </div>
  </article>
);
 
// ============================================================
// メインコンポーネント
// ============================================================
 
export default function WorksPage() {
  return (
    <main className="max-w-5xl mx-auto px-4 py-12">
      {/* ページヘッダー */}
      <header className="text-center mb-16">
        <h1 className="text-4xl font-bold text-slate-800 mb-4">WORKS</h1>
        <p className="text-slate-600 text-lg">これまでに作ったプロダクトたち</p>
        <div className="w-16 h-1 bg-indigo-600 mx-auto mt-4" />
      </header>
 
      {/* カードグリッド */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {MOCK_ACHIEVEMENTS.map((achievement) => (
          <AchievementCard key={achievement.id} achievement={achievement} />
        ))}
      </section>
    </main>
  );
}
 