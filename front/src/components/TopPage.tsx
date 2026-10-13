// ============================================================
// このファイルの責務：UIの表示のみ
// データ取得は useProfile フックに完全委譲している
// API・fetch・useState・useEffect はこのファイルに書かない
// ------------------------------------------------------------
// 【設計メモ】本来はページの実体を app/ 配下や features/ 等に
// 配置するのが望ましいが、途中でのリファクタリングコストを
// 踏まえ、意図的に components フォルダへの配置を継続している
// ============================================================

"use client";

import Link from "next/link";
import Image from "next/image";
import { useProfile } from "@/hooks/useProfile";
import PageNav from "@/components/PageNav";
import Footer from "@/components/Footer";

// ============================================================
// 定数データ（追加・変更はここだけでOK）
// ============================================================

const DEFAULT_AVATAR_URL = "/images/profile.jpg";

const TECH_STACK = [
  "JavaScript", "TypeScript", "React", "Next.js", "Tailwind CSS", "Chakra UI",
  "Express.js", "Prisma", "MySQL", "PostgreSQL", "Supabase",
  "Docker", "AWS", "Render", "Stripe", "LINE API",
];

// ============================================================
// 子コンポーネント（UIパーツ）
// ============================================================

/** 技術スタックバッジ：技術名をタグ風に表示 */
function TechBadge({ tech }: { tech: string }) {
  return (
    <span className="px-4 py-1.5 bg-white border border-slate-200 rounded-full shadow-[0_1px_2px_rgba(0,0,0,0.03)] font-sans text-xs font-semibold tracking-wide">
      <span className="text-slate-500">{tech}</span>
    </span>
  );
}

// ============================================================
// メインコンポーネント
// 責務：useProfile から名前・画像だけ受け取り、子コンポーネントに配るだけ
//       bio はDBから取得せず BIO_TEXT を直書きで使用する
// ============================================================

export default function TopPage() {
  const { profile, isLoading } = useProfile();

  return (
    <main className="min-h-screen flex flex-col items-center px-4 pt-6 pb-8 bg-slate-50 font-sans antialiased text-slate-800">

      {/* メインコンテンツ：編集デザイン風に左寄せで統一 */}
      <article className="text-left w-full max-w-5xl flex flex-col items-start">

        {/* 1. ナビゲーションタブ（共通コンポーネント、現在地を自動判定） */}
        <PageNav />

        {/* 2. プロフィール画像 */}
        <div className="relative w-full h-[450px] md:h-[520px] mb-8 rounded-2xl overflow-hidden shadow-sm border border-slate-100 bg-indigo-100 flex items-center justify-center">
          {isLoading || profile.avatarUrl ? (
            <Image
              src={profile.avatarUrl || DEFAULT_AVATAR_URL}
              alt={profile.name}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 1024px"
              className="object-cover object-[center_60%]"
              unoptimized
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white text-5xl font-bold select-none">
              {profile.name.charAt(0)}
            </div>
          )}
        </div>

        {/* 3〜4. テキスト要素は幅を絞って読みやすい行幅に */}
        <div className="w-full max-w-2xl">

          {/* 3. メイン挨拶 */}
          <div className="mb-8">
            <h2 className="font-display text-6xl md:text-8xl font-bold text-slate-800 uppercase tracking-tight leading-none">
              Portfolio
            </h2>
            <p className="font-display text-base md:text-xl font-bold text-[#3c3fbc] uppercase tracking-[0.3em] mt-3 pl-2">
              {profile.name}
            </p>
          </div>

          {/* 4. 技術スタック */}
          <section className="text-left">
            <h3 className="text-xs font-bold text-slate-400 tracking-[0.2em] uppercase mb-4 pl-2">
              Tech Stack
            </h3>
            <div className="flex flex-wrap gap-2.5">
              {TECH_STACK.map((tech) => (
                <TechBadge key={tech} tech={tech} />
              ))}
            </div>
          </section>
        </div>

        {/* 共通フッター（著作権表示） */}
        <Footer />

        {/* 管理画面への導線（露出を抑えるため、トップページのみに設置） */}
        <div className="flex items-center justify-center gap-3 max-w-xs mt-3 text-[9px] mx-auto">
          <div className="h-[1px] w-8 bg-slate-200/30" />
          <Link
            href="/secret-login"
            className="text-slate-300/30 hover:text-indigo-500/40 transition-colors tracking-[0.2em] font-light cursor-default"
          >
            2026 2nd-STAGE
          </Link>
          <div className="h-[1px] w-8 bg-slate-200/30" />
        </div>
      </article>
    </main>
  );
}