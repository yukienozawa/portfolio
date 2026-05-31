// front/src/components/WorksPage.tsx

// ============================================================
// このファイルの責務：UIの表示のみ
// データ取得は useWorks フックに完全委譲している
// API・fetch・useState・useEffect はこのファイルに書かない
// ============================================================

"use client";

import Image from "next/image";
import Link from "next/link";
import { useWorks } from "@/hooks/useWorks";

// ============================================================
// 型定義
// ============================================================

interface Achievement {
  id: string;
  title: string;
  description: string;
  imageUrl: string | null;
}

// ============================================================
// 子コンポーネント（UIパーツ）
// ✅ コンポーネントは function 宣言で定義する
//    コンポーネント内部の処理は const アロー関数で書く
// ============================================================

/** 実績カード：画像・タイトル・説明文を横並びで表示 */
function AchievementCard({ achievement }: { achievement: Achievement }) {
  return (
    <li className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow">
      <article className="flex flex-col md:flex-row">

        {/* 左側：画像エリア
            スマホ：横幅いっぱい・高さ56（224px）
            タブレット以上：幅1/3固定・高さ自動（テキストに合わせて伸びる） */}
        <div className="w-full md:w-1/3 flex-shrink-0">
          <div className="relative w-full h-56 md:h-full min-h-[280px] bg-slate-50 flex items-center justify-center text-slate-400 overflow-hidden">
            {achievement.imageUrl ? (
              // 画像URLがある場合：Next.js Image で最適化表示
              <Image
                src={achievement.imageUrl}
                alt={achievement.title}
                fill
                className="object-cover"
                unoptimized
              />
            ) : (
              // 画像URLがない場合：フォルダアイコンを表示
              <span className="text-4xl">📁</span>
            )}
          </div>
        </div>

        {/* 右側：テキスト領域（文章量に合わせて自然に伸びる） */}
        <div className="p-6 md:p-8 lg:p-10 flex-1 flex flex-col justify-center space-y-4">

          {/* タイトル：セリフ体・インディゴの左ボーダーで強調
              スマホ：xl、タブレット：2xl、PC：3xl とスケール */}
          <h2 className="font-serif text-xl md:text-2xl lg:text-3xl font-black text-slate-800 border-l-4 border-indigo-500 pl-3 leading-snug">
            {achievement.title}
          </h2>

          {/* 説明文：セリフ体・グレー
              スマホ：sm、タブレット以上：base とスケール */}
          <p className="font-serif text-sm md:text-base text-slate-600 leading-relaxed whitespace-pre-wrap">
            {achievement.description}
          </p>
        </div>
      </article>
    </li>
  );
}

// ============================================================
// メインコンポーネント
// 責務：useWorks からデータを受け取り、子コンポーネントに配るだけ
// ============================================================

export default function WorksPage() {
  // useWorks フックからデータ・ローディング状態・エラー状態を受け取る
  // このコンポーネント自身は fetch も useState も書かない
  const { achievements, isLoading, isError } = useWorks();

  return (
    // max-w-5xl：PC大画面でもカードが広く使えるよう幅を拡張
    <main className="max-w-5xl mx-auto px-4 py-12">

      {/* ページヘッダー */}
      <header className="text-center mb-16">
        <h1 className="font-serif text-4xl md:text-5xl font-bold text-slate-800 mb-4">WORKS</h1>
        <p className="font-serif text-slate-600 text-lg">これまでに作ったプロダクトたち</p>
        <div className="w-16 h-1 bg-indigo-600 mx-auto mt-4" />
      </header>

      {/* ローディング中 */}
      {isLoading && (
        <div className="text-center text-slate-400 text-sm py-20">
          実績データを読み込み中...
        </div>
      )}

      {/* エラー時 */}
      {isError && (
        <div className="text-center text-red-500 text-sm py-20">
          ⚠️ データの取得中にエラーが発生しました。バックエンドサーバーが起動しているか確認してください。
        </div>
      )}

      {/* データなし */}
      {!isLoading && !isError && achievements.length === 0 && (
        <div className="text-center text-slate-400 text-sm py-20 bg-white rounded-2xl border border-slate-100 shadow-sm">
          現在、公開できる実績データはありません。<br />
          <span className="text-xs text-indigo-500 block mt-2">管理画面から新しく追加してみてください！</span>
        </div>
      )}

      {/* 実績一覧（カードを縦に1列・gap-10で余裕のある間隔） */}
      {!isLoading && !isError && achievements.length > 0 && (
        <section aria-label="制作実績一覧">
          <ul className="grid grid-cols-1 gap-10 p-0 list-none">
            {achievements.map((achievement) => (
              <AchievementCard key={achievement.id} achievement={achievement} />
            ))}
          </ul>
        </section>
      )}

      {/* トップへ戻るボタン */}
      <div className="mt-16 text-center">
        <Link
          href="/"
          className="px-6 py-3 border border-slate-300 text-slate-700 font-semibold rounded-xl hover:bg-slate-100 transition-colors text-sm inline-block"
        >
          トップページへ戻る
        </Link>
      </div>
    </main>
  );
}