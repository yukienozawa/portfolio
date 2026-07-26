// ============================================================
// このファイルの責務：お問い合わせフォームのUI表示と送信処理
// メンテナンス設定の取得はマウント時に行い、OFF時はフォームの代わりに
// メンテナンス表示を出し、送信自体もできないようにする
// ============================================================

"use client";

import { useState, useEffect } from "react";
import PageNav from "@/components/PageNav";
import { AlertTriangleIcon, WrenchIcon } from "@/components/Icon";
import Footer from "@/components/Footer";

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

  // 🔧 お問い合わせ機能のON/OFF状態（メンテナンス判定）
  const [isContactEnabled, setIsContactEnabled] = useState<boolean>(true);
  const [isCheckingSetting, setIsCheckingSetting] = useState<boolean>(true);

  // ============================================================
  // マウント時：お問い合わせ機能が受付中かどうかを確認
  // ============================================================
  useEffect(() => {
    const fetchContactSetting = async () => {
      try {
        const res = await fetch("/api/contact-setting");
        if (!res.ok) throw new Error("設定の取得に失敗しました。");

        const data = await res.json();
        setIsContactEnabled(data.isEnabled);
      } catch (error) {
        // 取得に失敗した場合は、安全側に倒して「受付中」のまま扱う
        console.error("お問い合わせ設定取得エラー:", error);
      } finally {
        setIsCheckingSetting(false);
      }
    };

    fetchContactSetting();
  }, []);

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
      // ➔ 開通済みのプロキシ（/api）経由で、Expressの /api/contact に一本化して叩きます
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
    <main className="max-w-5xl mx-auto px-4 py-6 pb-24 bg-slate-50 min-h-screen">

      {/* ナビゲーションタブ（共通コンポーネント、現在地を自動判定） */}
      <PageNav />

      <div className="max-w-2xl mx-auto">

        {/* ページヘッダー：Contactページは中央寄せ・上部余白多め */}
        <header className="mb-16 mt-20 text-center">
          <h1 className="font-display text-6xl md:text-8xl font-bold text-slate-800 uppercase tracking-tight leading-none">
            Contact
          </h1>
          <p className="font-body text-[#3c3fbc] text-lg font-medium tracking-wide mt-3">
            お気軽にお問い合わせください
          </p>
        </header>

        {/* メンテナンス中の表示（設定確認が終わり、かつOFFの場合のみ表示） */}
        {!isCheckingSetting && !isContactEnabled && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-10 text-center flex flex-col items-center gap-3">
            <WrenchIcon className="w-8 h-8 text-slate-400" />
            <p className="text-slate-600 font-semibold">
              現在メンテナンス中のため利用できません
            </p>
          </div>
        )}

        {/* 送信完了メッセージ */}
        {isContactEnabled && status === "success" && (
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

        {isContactEnabled && errorMessage && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm text-center font-medium flex items-center justify-center gap-2">
            <AlertTriangleIcon className="w-4 h-4 flex-shrink-0" />
            {errorMessage}
          </div>
        )}

        {/* お問い合わせフォーム：受付中（isContactEnabled）の場合のみ表示 */}
        {isContactEnabled && (
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 space-y-6 hover:shadow-md transition-shadow"
            noValidate
          >
            {/* お名前 */}
            <div>
              <label htmlFor="name" className="font-body block text-sm font-semibold text-slate-700 mb-2">
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
              <label htmlFor="email" className="font-body block text-sm font-semibold text-slate-700 mb-2">
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
              <label htmlFor="message" className="font-body block text-sm font-semibold text-slate-700 mb-2">
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
        )}
      </div>
      <Footer />
    </main>
  );
}