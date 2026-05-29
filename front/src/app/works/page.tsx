"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

// ============================================================
// 型定義 (MySQL / Prismaの生のモデル構造に完全一致)
// ============================================================
interface Achievement {
  id: string;
  title: string;
  description: string;
  imageUrl: string | null;
}

// ============================================================
// 子コンポーネント
// ============================================================
const AchievementCard = ({ achievement }: { achievement: Achievement }) => (
  <article className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow flex flex-col h-full">
    {/* サムネイル */}
    <div className="relative w-full h-48 bg-slate-50 flex items-center justify-center text-slate-400 border-b border-slate-100">
      {achievement.imageUrl ? (
        <Image
          src={achievement.imageUrl}
          alt={achievement.title}
          fill
          className="object-cover"
          unoptimized
        />
      ) : (
        <span className="text-3xl font-light">📁</span>
      )}
    </div>

    {/* テキスト */}
    <div className="p-6 flex flex-col flex-1 justify-between">
      <div className="space-y-2">
        <h2 className="text-lg font-bold text-slate-800 line-clamp-1">
          {achievement.title}
        </h2>
        <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap line-clamp-4">
          {achievement.description}
        </p>
      </div>
    </div>
  </article>
);

// ============================================================
// メインコンポーネント
// ============================================================
export default function WorksPage() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);

  useEffect(() => {
    const fetchPublicAchievements = async () => {
      try {
        const res = await fetch("/api/achievements");
        
        if (!res.ok) {
          throw new Error("実績データの取得に失敗しました。");
        }

        const data = await res.json();
        setAchievements(data);
      } catch (error) {
        console.error("実績データ取得エラー:", error);
        setIsError(true);
      } finally {
        // isLoading(false) から setIsLoading(false) に修正
        setIsLoading(false);
      }
    };

    fetchPublicAchievements();
  }, []);

  return (
    <main className="max-w-5xl mx-auto px-4 py-12">
      <header className="text-center mb-16">
        <h1 className="text-4xl font-bold text-slate-800 mb-4">WORKS</h1>
        <p className="text-slate-600 text-lg">これまでに作ったプロダクトたち</p>
        <div className="w-16 h-1 bg-indigo-600 mx-auto mt-4" />
      </header>

      {isLoading ? (
        <div className="text-center text-slate-400 text-sm py-20">
          実績データを読み込み中...
        </div>
      ) : isError ? (
        <div className="text-center text-red-500 text-sm py-20">
          ⚠️ データの取得中にエラーが発生しました。バックエンドサーバーが起動しているか確認してください。
        </div>
      ) : achievements.length === 0 ? (
        <div className="text-center text-slate-400 text-sm py-20 bg-white rounded-2xl border border-slate-100 shadow-sm">
          現在、公開できる実績データはありません。<br />
          <span className="text-xs text-indigo-500 block mt-2">管理画面から新しく追加してみてください！</span>
        </div>
      ) : (
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {achievements.map((achievement) => (
            <AchievementCard key={achievement.id} achievement={achievement} />
          ))}
        </section>
      )}

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