// ============================================================
// このファイルの責務：全ページ共通のフッター表示のみ
// 管理画面へのリンクはここには含めない（露出面積を最小化するため、
// トップページのみに残す設計とした）
// データ取得は useProfile フックに完全委譲している
// ============================================================

"use client";

import { useProfile } from "@/hooks/useProfile";

export default function Footer() {
  const { profile } = useProfile();

  return (
    <footer className="w-full max-w-2xl mx-auto mt-12 pb-2 text-center select-none">
      <p className="text-[10px] tracking-widest text-slate-400">
        Connecting People and Technology | © 2026 {profile.name}. All rights reserved.
      </p>
    </footer>
  );
}