"use client";

import { useState, useEffect, useRef } from "react";
import { getAuth } from "firebase/auth";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { notFound } from "next/navigation";

// ============================================================
// 型定義
// ============================================================

interface EditForm {
  achievementTitle: string;
  description: string;
  imageData: string; // Base64文字列
}

type SubmitStatus = "idle" | "loading" | "success" | "error";

// ============================================================
// 定数
// ============================================================

const INITIAL_FORM: EditForm = {
  achievementTitle: "",
  description: "",
  imageData: "",
};

// ============================================================
// メインコンポーネント
// ============================================================

export default function AdminEditPage() {
  const [form, setForm] = useState<EditForm>(INITIAL_FORM);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isAuthChecked, setIsAuthChecked] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("id");
  const auth = getAuth();

  // ============================================================
  // 認証チェック ＆ 既存データ取得
  // ============================================================
  useEffect(() => {
    // 関数を useEffect の中に引っ越しさせてローカル化！
    const fetchExistingData = async (id: string) => {
      try {
        const idToken = await auth.currentUser?.getIdToken();
        const response = await fetch(`/api/achievements/${id}`, {
          headers: { Authorization: `Bearer ${idToken}` },
        });

        if (!response.ok) throw new Error("データの取得に失敗しました。");

        const data: EditForm = await response.json();
        setForm(data);
        if (data.imageData) setPreviewUrl(data.imageData);
      } catch (error: unknown) {
        console.error("既存データ取得エラー:", error);
        setErrorMessage("データの取得に失敗しました。");
      }
    };

    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        notFound();
        return;
      }
      setIsAuthChecked(true);

      if (editId) {
        fetchExistingData(editId);
      }
    });

    return () => unsubscribe();
    // 依存関係に auth も追加して、ESLintのルールに完全準拠！
  }, [editId, auth]);

  // ============================================================
  // テキスト入力の更新
  // ============================================================
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // ============================================================
  // 画像選択 → Base64変換
  // ============================================================
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setForm((prev) => ({ ...prev, imageData: base64 }));
      setPreviewUrl(base64);
    };
    reader.readAsDataURL(file);
  };

  // ============================================================
  // バリデーション
  // ============================================================
  const validate = (): string | null => {
    if (!form.achievementTitle.trim()) return "実績名を入力してください。";
    if (!form.description.trim()) return "説明文を入力してください。";
    return null;
  };

  // ============================================================
  // 送信処理（新規登録 or 更新）
  // ============================================================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    const validationError = validate();
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    setStatus("loading");

    try {
      const idToken = await auth.currentUser?.getIdToken();
      const url = editId ? `/api/achievements/${editId}` : "/api/achievements";
      const method = editId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify(form),
      });

      if (!response.ok) throw new Error("保存に失敗しました。");

      setStatus("success");
      router.push("/admin");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "予期しないエラーが発生しました。";
      setErrorMessage(message);
      setStatus("error");
    }
  };

  if (!isAuthChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-400">
        認証確認中...
      </div>
    );
  }

  return (
    <main className="max-w-2xl mx-auto px-4 py-12">
      {/* ページヘッダー */}
      <header className="mb-10">
        <h1 className="text-3xl font-bold text-slate-800">
          {editId ? "実績を編集" : "実績を新規登録"}
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          {editId ? "内容を変更して保存してください。" : "新しい実績を登録します。"}
        </p>
      </header>

      {/* エラーメッセージ */}
      {errorMessage && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
          ⚠️ {errorMessage}
        </div>
      )}

      {/* フォーム */}
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 space-y-6"
      >
        {/* 実績名 */}
        <div>
          <label
            htmlFor="achievementTitle"
            className="block text-sm font-semibold text-slate-700 mb-2"
          >
            実績名 <span className="text-red-500">*</span>
          </label>
          <input
            id="achievementTitle"
            name="achievementTitle"
            type="text"
            value={form.achievementTitle}
            onChange={handleChange}
            placeholder="例：家計簿アプリ（BlueGold）"
            className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>

        {/* 説明文 */}
        <div>
          <label
            htmlFor="description"
            className="block text-sm font-semibold text-slate-700 mb-2"
          >
            説明文 <span className="text-red-500">*</span>
          </label>
          <textarea
            id="description"
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="実績の概要や使用技術を記入してください"
            rows={5}
            className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
          />
        </div>

        {/* 画像アップロード */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            サムネイル画像
          </label>

          {/* プレビュー */}
          {previewUrl && (
            <div className="relative mb-3 w-full h-48 rounded-xl overflow-hidden border border-slate-200">
              <Image
                src={previewUrl}
                alt="プレビュー"
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          )}

          {/* ファイル選択ボタン */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 border border-slate-300 text-slate-600 text-sm rounded-xl hover:bg-slate-50 transition-colors"
          >
            {previewUrl ? "画像を変更する" : "画像を選択する"}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />
          <p className="text-xs text-slate-400 mt-2">
            選択された画像はBase64形式に変換してAPIへ送信されます。
          </p>
        </div>

        {/* ボタン群 */}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={status === "loading"}
            className="flex-1 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {status === "loading" ? "保存中..." : editId ? "変更を保存する" : "登録する"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/admin")}
            className="px-6 py-3 border border-slate-300 text-slate-600 font-semibold rounded-xl hover:bg-slate-100 transition-colors"
          >
            キャンセル
          </button>
        </div>
      </form>
    </main>
  );
}