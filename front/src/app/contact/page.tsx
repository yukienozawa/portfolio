//問い合わせフォーム

"use client";

import { useState } from "react";
import Link from "next/link";

// ============================================================
// 型定義（PrismaのInquiryモデルのフィールド名に完全準拠させます）
// 📍このページの責務分離は次のステップアップで実装予定です。
// ============================================================
interface ContactForm {
  name: string;    // senderName から変更
  email: string;   // senderEmail から変更
  message: string; // messageContent から変更
}

type SubmitStatus = "idle" | "loading" | "success" | "error";

// ============================================================
// 定数
// ============================================================
const INITIAL_FORM: ContactForm = {
  name: "",
  email: "",
  message: "",
};

// ============================================================
// メインコンポーネント
// ============================================================
export default function ContactPage() {
  const [form, setForm] = useState<ContactForm>(INITIAL_FORM);
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");

  // 入力値の更新
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // バリデーション
  const validate = (): string | null => {
    if (!form.name.trim()) return "お名前を入力してください。";
    if (!form.email.trim()) return "メールアドレスを入力してください。";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      return "正しいメールアドレスの形式で入力してください。";
    if (!form.message.trim()) return "お問い合わせ内容を入力してください。";
    return null;
  };

  // 送信処理
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
      // ➔ 開通済みのプロキシ（/api）経由で、Expressの /api/inquiries に一本化して叩きます
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form), // { name, email, message } がそのままバックエンドへ届きます
      });

      if (!response.ok) throw new Error("送信に失敗しました。");

      setStatus("success");
      setForm(INITIAL_FORM);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "予期しないエラーが発生しました。";
      setErrorMessage(message);
      setStatus("error");
    }
  };

  return (
    <main className="max-w-2xl mx-auto px-4 py-12">
      {/* ページヘッダー */}
      <header className="text-center mb-16">
        <h1 className="text-4xl font-bold text-slate-800 mb-4">CONTACT</h1>
        <p className="text-slate-600 text-lg">お気軽にお問い合わせください</p>
        <div className="w-16 h-1 bg-indigo-600 mx-auto mt-4" />
      </header>

      {/* 送信完了メッセージ */}
      {status === "success" && (
        <div className="mb-8 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm text-center font-medium flex flex-col items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          <span>
            お問い合わせを送信しました。ありがとうございます。
            <br />
            内容を確認のうえ、改めてご連絡いたします。
          </span>
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 17a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2Z" />
            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
          </svg>
        </div>
      )}

      {errorMessage && (
        <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm text-center font-medium">
          ⚠️ {errorMessage}
        </div>
      )}

      {/* お問い合わせフォーム */}
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 space-y-6"
        noValidate
      >
        {/* お名前 */}
        <div>
          <label htmlFor="name" className="block text-sm font-semibold text-slate-700 mb-2">
            お名前 <span className="text-red-500">*</span>
          </label>
          <input
            id="name"
            name="name" // 👈 form.name にバインド
            type="text"
            value={form.name}
            onChange={handleChange}
            placeholder="山田 太郎"
            className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>

        {/* メールアドレス */}
        <div>
          <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-2">
            メールアドレス <span className="text-red-500">*</span>
          </label>
          <input
            id="email"
            name="email" // 👈 form.email にバインド
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="example@email.com"
            className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>

        {/* お問い合わせ内容 */}
        <div>
          <label htmlFor="message" className="block text-sm font-semibold text-slate-700 mb-2">
            お問い合わせ内容 <span className="text-red-500">*</span>
          </label>
          <textarea
            id="message"
            name="message" // 👈 form.message にバインド
            value={form.message}
            onChange={handleChange}
            placeholder="お問い合わせ内容をご記入ください"
            rows={6}
            className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
          />
        </div>

        {/* 送信ボタン */}
        <button
          type="submit"
          disabled={status === "loading"}
          className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {status === "loading" ? "送信中..." : "送信する"}
        </button>
      </form>

      {/* トップページへ戻るリンク */}
      <div className="mt-10 text-center">
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
 