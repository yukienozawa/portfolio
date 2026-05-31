// ============================================================
// このファイルの責務：UIの表示のみ
// データ取得は useProfile フックに完全委譲している
// API・fetch・useState・useEffect はこのファイルに書かない
// ============================================================
 
"use client";
 
import Link from "next/link";
import Image from "next/image";
import { useProfile } from "@/hooks/useProfile";
 
// ============================================================
// 定数データ（追加・変更はここだけでOK）
// ============================================================
 
// トップページに直書きする説明文（DBから取得しない）
const BIO_TEXT = "現在、フルスタックブートキャンプにて、Next.js、TypeScript、ExpressなどのWeb技術を猛勉強中です。";
 
const TECH_STACK = [
  "React", "Next.js", "TypeScript", "Chakra UI",
  "Express", "Prisma", "MySQL", "Tailwind CSS",
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
  // useProfile フックから名前・画像URLのみ使用する
  // bio はトップページでは使用しない（直書きの BIO_TEXT を使う）
  const { profile } = useProfile();
 
  return (
    <main className="min-h-screen flex flex-col items-center px-4 pt-10 pb-8 bg-slate-50 font-sans antialiased text-slate-800">
 
      {/* メインコンテンツ */}
      <article className="text-center w-full max-w-5xl flex flex-col items-center mt-2">
 
        {/* 1. プロフィール画像 */}
        <div className="relative w-full h-[450px] md:h-[520px] mb-10 rounded-2xl overflow-hidden shadow-sm border border-slate-100 bg-slate-100 flex items-center justify-center">
          {profile.avatarUrl ? (
            // 画像URLがある場合：Next.js Image で最適化表示
            // object-[center_60%]：左下の桟橋の角までバランスよく映し出す
            <Image
              src={profile.avatarUrl}
              alt={profile.name}
              fill
              priority
              sizes="(max-w-5xl) 100vw, 1024px"
              className="object-cover object-[center_60%]"
              unoptimized
            />
          ) : (
            // 画像URLがない場合：名前の頭文字をグラデーション背景で表示
            <div className="w-full h-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white text-5xl font-bold select-none">
              {profile.name.charAt(0)}
            </div>
          )}
        </div>
 
        {/* 2. メイン挨拶 */}
        <h2 className="font-serif text-4xl md:text-5xl font-black text-slate-800 mb-5 tracking-tight leading-none">
          Hi, I{"'"}m <span className="text-[#3c3fbc] font-black">{profile.name}</span>
        </h2>
 
        {/* 3. 説明文（直書き・セリフ体・グレー） */}
        <p className="font-serif text-sm md:text-base text-slate-500 leading-relaxed mb-8 max-w-2xl tracking-wide font-medium px-2">
          {BIO_TEXT}
        </p>
 
        {/* 4. ナビゲーションボタン */}
        <div className="flex flex-row items-center justify-center gap-4 mb-12 w-full max-w-md px-4">
          {/* Profile ボタン（プライマリカラー） */}
          <Link
            href="/profile"
            className="flex-1 text-center py-2.5 bg-[#3c3fbc] text-white font-bold rounded-xl hover:bg-[#2e319c] transition-all shadow-sm text-sm tracking-wider"
          >
            Profile
          </Link>
 
          {/* Works ボタン（セカンダリカラー） */}
          <Link
            href="/works"
            className="flex-1 text-center py-2.5 bg-[#cbd4e1]/70 border border-[#b0becc]/60 text-[#1f2438] font-bold rounded-xl hover:bg-[#cbd4e1]/90 transition-all shadow-sm text-sm tracking-wider"
          >
            Works
          </Link>
 
          {/* Contact ボタン（セカンダリカラー） */}
          <Link
            href="/contact"
            className="flex-1 text-center py-2.5 bg-[#cbd4e1]/70 border border-[#b0becc]/60 text-[#1f2438] font-bold rounded-xl hover:bg-[#cbd4e1]/90 transition-all shadow-sm text-sm tracking-wider"
          >
            Contact
          </Link>
        </div>
 
        {/* 5. 技術スタック */}
        <section className="w-full text-center">
          <h3 className="text-xs font-bold text-slate-400 tracking-[0.2em] uppercase mb-4">
            Tech Stack
          </h3>
          {/* TECH_STACK 配列をループして TechBadge を生成 */}
          <div className="flex flex-wrap justify-center gap-2.5 max-w-3xl mx-auto">
            {TECH_STACK.map((tech) => (
              <TechBadge key={tech} tech={tech} />
            ))}
          </div>
        </section>
      </article>
 
      {/* フッター */}
      <footer className="w-full mt-12 pb-2 text-center select-none">
        <p className="text-[10px] tracking-widest text-slate-400">
          © 2026 {profile.name}. All rights reserved.
        </p>
        <div className="flex items-center justify-center gap-3 max-w-xs mx-auto mt-3 text-[9px]">
          <div className="h-[1px] w-8 bg-slate-200/30" />
          {/* secret-login へのリンク（意図的に目立たせない） */}
          <Link
            href="/secret-login"
            className="text-slate-300/30 hover:text-indigo-500/40 transition-colors tracking-[0.2em] font-light cursor-default"
          >
            2026 2nd-STAGE
          </Link>
          <div className="h-[1px] w-8 bg-slate-200/30" />
        </div>
      </footer>
    </main>
  );
}