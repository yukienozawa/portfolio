"use client";
 
import { useState } from "react";
 
// ============================================================
// 型定義
// ============================================================
 
interface ContactForm {
  senderName: string;
  senderEmail: string;
  messageContent: string;
}
 
type SubmitStatus = "idle" | "loading" | "success" | "error";
 
// ============================================================
// 定数
// ============================================================
 
const INITIAL_FORM: ContactForm = {
  senderName: "",
  senderEmail: "",
  messageContent: "",
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
    if (!form.senderName.trim()) return "お名前を入力してください。";
    if (!form.senderEmail.trim()) return "メールアドレスを入力してください。";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.senderEmail))
      return "正しいメールアドレスの形式で入力してください。";
    if (!form.messageContent.trim()) return "お問い合わせ内容を入力してください。";
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
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
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
        <div className="mb-8 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm text-center">
          ✅ お問い合わせを送信しました。ありがとうございます！
        </div>
      )}
 
      {/* エラーメッセージ */}
      {errorMessage && (
        <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm text-center">
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
          <label htmlFor="senderName" className="block text-sm font-semibold text-slate-700 mb-2">
            お名前 <span className="text-red-500">*</span>
          </label>
          <input
            id="senderName"
            name="senderName"
            type="text"
            value={form.senderName}
            onChange={handleChange}
            placeholder="山田 太郎"
            className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>
 
        {/* メールアドレス */}
        <div>
          <label htmlFor="senderEmail" className="block text-sm font-semibold text-slate-700 mb-2">
            メールアドレス <span className="text-red-500">*</span>
          </label>
          <input
            id="senderEmail"
            name="senderEmail"
            type="email"
            value={form.senderEmail}
            onChange={handleChange}
            placeholder="example@email.com"
            className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>
 
        {/* お問い合わせ内容 */}
        <div>
          <label htmlFor="messageContent" className="block text-sm font-semibold text-slate-700 mb-2">
            お問い合わせ内容 <span className="text-red-500">*</span>
          </label>
          <textarea
            id="messageContent"
            name="messageContent"
            value={form.messageContent}
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
    </main>
  );
}
 