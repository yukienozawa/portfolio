//管理者ダッシュボードページ

"use client";

import { useState, useEffect } from "react";
import "@/lib/firebase";
import { auth } from "@/lib/firebase";
import Link from "next/link";
import { useRouter } from "next/navigation";

// ============================================================
// 型定義
// ============================================================
interface Achievement {
  id: string;
  Title: string;
  description: string;
}

interface Inquiry {
  id: string;
  name: string;
  email: string;
  message: string;
  createdAt: string;
}

interface UserProfile {
  id: string;
  name: string;
  email: string;
  bio: string;
  avatarUrl: string;
  githubUrl: string;
}

// ============================================================
// メインコンポーネント
// ============================================================
export default function AdminDashboardPage() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  
  // 👥 ユーザープロフィール用の状態管理
  const [profile, setProfile] = useState<UserProfile>({
    id: "",
    name: "",
    email: "",
    bio: "",
    avatarUrl: "",
    githubUrl: "",
  });
  
  // アクティブなタブを管理 ('achievements' | 'inquiries' | 'profile')
  const [activeTab, setActiveTab] = useState<"achievements" | "inquiries" | "profile">("achievements");
  
  const [isAuthChecked, setIsAuthChecked] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  const router = useRouter();

  // ============================================================
  // データ取得処理（実績・問い合わせ・プロフィールを一括並列取得）
  // ============================================================
  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const idToken = await auth.currentUser?.getIdToken();
        if (!idToken) return;

        // ① 実績、② お問い合わせ、③ プロフィールのAPIをすべて叩く
        const [resAchievements, resInquiries, resProfile] = await Promise.all([
          fetch("/api/admin/achievements", { headers: { Authorization: `Bearer ${idToken}` } }),
          fetch("/api/admin/inquiries", { headers: { Authorization: `Bearer ${idToken}` } }),
          fetch("/api/admin/profile", { headers: { Authorization: `Bearer ${idToken}` } }),
        ]);

        if (!resAchievements.ok || !resInquiries.ok || !resProfile.ok) {
          throw new Error("データの取得に失敗しました。");
        }

        const dataAchievements = await resAchievements.json();
        const dataInquiries = await resInquiries.json();
        const dataProfile = await resProfile.json();

        setAchievements(dataAchievements);
        setInquiries(dataInquiries);
        setProfile(dataProfile);
      } catch (error: unknown) {
        console.error("データ取得エラー:", error);
        setErrorMessage("データの取得に失敗しました。");
      } bits: {
        setIsLoading(false);
      }
    };

    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setIsAuthChecked(true);
        fetchAdminData();
      }
    });

    return () => unsubscribe();
  }, [router]);

  // ============================================================
  // プロフィール更新処理（PUT送信）
  // ============================================================
  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const idToken = await auth.currentUser?.getIdToken();
      if (!idToken) throw new Error("認証トークンの取得に失敗しました。");

      const response = await fetch("/api/admin/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          name: profile.name,
          bio: profile.bio,
          avatarUrl: profile.avatarUrl,
          githubUrl: profile.githubUrl,
        }),
      });

      if (!response.ok) throw new Error("プロフィールの更新に失敗しました。");

      setSuccessMessage("✨ プロフィールを更新しました！");
    } catch (error: unknown) {
      console.error("プロフィール更新エラー:", error);
      setErrorMessage("プロフィールの更新に失敗しました。");
    } finally {
      setIsUpdating(false);
    }
  };

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
          <p className="text-sm text-slate-500 mt-1">実績データ、お問い合わせ、プロフィール情報を一括管理できます。</p>
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

      {/* 通知メッセージ */}
      {errorMessage && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
          ⚠️ {errorMessage}
        </div>
      )}
      {successMessage && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm">
          {successMessage}
        </div>
      )}

      {/* 📂 3タブ切り替えメニュー */}
      <div className="flex border-b border-slate-200 mb-6 gap-2 overflow-x-auto">
        <button
          onClick={() => { setActiveTab("achievements"); setSuccessMessage(""); }}
          className={`px-4 py-2.5 font-semibold text-sm transition-all border-b-2 rounded-t-lg whitespace-nowrap ${
            activeTab === "achievements"
              ? "border-indigo-600 text-indigo-600 bg-indigo-50/40"
              : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50"
          }`}
        >
          📁 実績マネージャー ({achievements.length})
        </button>
        <button
          onClick={() => { setActiveTab("inquiries"); setSuccessMessage(""); }}
          className={`px-4 py-2.5 font-semibold text-sm transition-all border-b-2 rounded-t-lg whitespace-nowrap ${
            activeTab === "inquiries"
              ? "border-indigo-600 text-indigo-600 bg-indigo-50/40"
              : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50"
          }`}
        >
          ✉️ お問い合わせ受信箱 ({inquiries.length})
        </button>
        <button
          onClick={() => { setActiveTab("profile"); setSuccessMessage(""); }}
          className={`px-4 py-2.5 font-semibold text-sm transition-all border-b-2 rounded-t-lg whitespace-nowrap ${
            activeTab === "profile"
              ? "border-indigo-600 text-indigo-600 bg-indigo-50/40"
              : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50"
          }`}
        >
          👤 プロフィール設定
        </button>
      </div>

      {/* ============================================================
          メインコンテンツ表示（タブによって切り替え）
         ============================================================ */}
      <section className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        
        {/* 1. 実績一覧タブ */}
        {activeTab === "achievements" && (
          achievements.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-sm">
              登録された実績データがありません。
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
                        {achievement.Title}
                      </td>
                      <td className="px-6 py-4 max-w-md truncate">{achievement.description}</td>
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <div className="flex justify-end gap-2">
                          <Link href={`/admin/edit?id=${achievement.id}`} className="px-3 py-1.5 border border-slate-200 text-indigo-600 font-medium rounded-lg hover:bg-indigo-50 transition-colors text-xs">編集</Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}

        {/* 2. お問い合わせ受信箱タブ */}
        {activeTab === "inquiries" && (
          inquiries.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-sm">
              届いているお問い合わせメッセージはありません。
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-xs font-semibold uppercase tracking-wider">
                    <th className="px-6 py-4">送信者</th>
                    <th className="px-6 py-4">メールアドレス</th>
                    <th className="px-6 py-4">メッセージ</th>
                    <th className="px-6 py-4 text-right">受信日時</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm text-slate-600">
                  {inquiries.map((inquiry) => (
                    <tr key={inquiry.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-semibold text-slate-800 whitespace-nowrap">{inquiry.name}</td>
                      <td className="px-6 py-4 text-indigo-600 whitespace-nowrap">{inquiry.email}</td>
                      <td className="px-6 py-4 max-w-sm break-words whitespace-pre-wrap text-slate-700">{inquiry.message}</td>
                      <td className="px-6 py-4 text-right text-slate-400 text-xs whitespace-nowrap">{new Date(inquiry.createdAt).toLocaleString("ja-JP")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}

        {/* 👤 3. プロフィール設定タブ（新設・パターン1方式） */}
        {activeTab === "profile" && (
          <form onSubmit={handleProfileSubmit} className="p-8 space-y-6 max-w-2xl">
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-slate-700 mb-2">表示名</label>
              <input
                type="text"
                id="name"
                name="name"
                value={profile.name}
                onChange={handleProfileChange}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label htmlFor="avatarUrl" className="block text-sm font-semibold text-slate-700 mb-2">プロフィール画像 URL (GitHub等の画像URL)</label>
              <input
                type="text"
                id="avatarUrl"
                name="avatarUrl"
                value={profile.avatarUrl || ""}
                onChange={handleProfileChange}
                placeholder="https://github.com/your-username.png"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:border-indigo-500 font-mono"
              />
              <p className="text-xs text-slate-400 mt-1">※GitHubの「https://github.com/ユーザー名.png」を入れると自動でアイコン写真になります。</p>
            </div>

            <div>
              <label htmlFor="githubUrl" className="block text-sm font-semibold text-slate-700 mb-2">GitHub アカウント URL</label>
              <input
                type="text"
                id="githubUrl"
                name="githubUrl"
                value={profile.githubUrl || ""}
                onChange={handleProfileChange}
                placeholder="https://github.com/your-username"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>

            <div>
              <label htmlFor="bio" className="block text-sm font-semibold text-slate-700 mb-2">自己紹介文・強み（長文対応）</label>
              <textarea
                id="bio"
                name="bio"
                rows={6}
                value={profile.bio}
                onChange={handleProfileChange}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:border-indigo-500 resize-none leading-relaxed"
              />
            </div>

            <button
              type="submit"
              disabled={isUpdating}
              className="px-6 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              {isUpdating ? "更新中..." : "プロフィールを保存する"}
            </button>
          </form>
        )}

      </section>
    </main>
  );
}