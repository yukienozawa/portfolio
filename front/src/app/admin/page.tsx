"use client";

import { useState, useEffect } from "react";
import { getAuth } from "firebase/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { notFound } from "next/navigation";

// ============================================================
// 型定義
// ============================================================

interface Achievement {
  id: string;
  achievementTitle: string;
  description: string;
}

// ============================================================
// メインコンポーネント
// ============================================================

export default function AdminDashboardPage() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [isAuthChecked, setIsAuthChecked] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const auth = getAuth();
  const router = useRouter();

  // ============================================================
  // 認証チェック ＆ データ取得（まとめてひとつの useEffect 内で処理）
  // ============================================================
  useEffect(() => {
    // 💡 関数を useEffect の中に引っ越しさせてエラーを完全消去！
    const fetchAchievements = async () => {
      try {
        const idToken = await auth.currentUser?.getIdToken();
        const response = await fetch("/api/achievements", {
          headers: { Authorization: `Bearer ${idToken}` },
        });

        if (!response.ok) throw new Error("実績データの取得に失敗しました。");

        const data: Achievement[] = await response.json();
        setAchievements(data);
      } catch (error: unknown) {
        console.error("データ取得エラー:", error);
        setErrorMessage("データの取得に失敗しました。");
      } finally {
        setIsLoading(false);
      }
    };

    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        // 未ログイン時はリダイレクトせず、直接404画面を呼び出して隠蔽！
        notFound();
        return;
      }
      setIsAuthChecked(true);
      fetchAchievements();
    });

    return () => unsubscribe();
  }, [auth]); // 💡 依存関係には auth のみを指定して完全準拠

  // ============================================================
  // ログアウト処理
  // ============================================================
  const handleLogout = async () => {
    try {
      await auth.signOut();
      router.push("/");
    } catch (error: unknown) {
      console.error("ログアウトエラー:", error);
    }
  };

  // 認証確認中の表示
  if (!isAuthChecked || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-400 text-sm">
        管理者認証を確認中...
      </div>
    );
  }

  return (
    <main className="max-w-6xl mx-auto px-4 py-12">
      {/* ダッシュボードヘッダー */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-6 mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">管理者ダッシュボード</h1>
          <p className="text-sm text-slate-500 mt-1">実績データの追加・編集・削除が行えます。</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/admin/edit"
            className="px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-colors text-center"
          >
            ➕ 新規実績登録
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="px-4 py-2 border border-slate-300 text-slate-600 text-sm font-semibold rounded-xl hover:bg-slate-100 transition-colors"
          >
            ログアウト
          </button>
        </div>
      </header>

      {/* エラーメッセージ */}
      {errorMessage && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
          ⚠️ {errorMessage}
        </div>
      )}

      {/* 実績一覧管理テーブル */}
      <section className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {achievements.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            登録された実績データがありません。「新規実績登録」から追加してください。
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-xs font-semibold uppercase tracking-wider">
                  <th className="px-6 py-4">実績名</th>
                  <th className="px-6 py-4">説明文概要</th>
                  <th className="px-6 py-4 text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-600">
                {achievements.map((achievement) => (
                  <tr key={achievement.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-800 whitespace-nowrap">
                      {achievement.achievementTitle}
                    </td>
                    <td className="px-6 py-4 max-w-md truncate">
                      {achievement.description}
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/admin/edit?id=${achievement.id}`}
                          className="px-3 py-1.5 border border-slate-200 text-indigo-600 font-medium rounded-lg hover:bg-indigo-50 hover:border-indigo-200 transition-colors text-xs"
                        >
                          編集
                        </Link>
                        <button
                          type="button"
                          className="px-3 py-1.5 border border-slate-200 text-red-600 font-medium rounded-lg hover:bg-red-50 hover:border-red-200 transition-colors text-xs"
                        >
                          削除
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}