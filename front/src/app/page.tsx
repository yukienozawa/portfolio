//🌐 トップページ
import Link from "next/link";
 
export default function TopPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-20 bg-slate-50">
      {/* ヒーローセクション */}
      <section className="text-center max-w-2xl">
        <p className="text-sm font-semibold text-indigo-600 tracking-widest uppercase mb-4">
          Portfolio
        </p>
        <h1 className="text-5xl font-bold text-slate-800 mb-6 leading-tight">
          Hi, I{"'"}m 
          <span className="text-indigo-600">Yukie Nozawa</span>
        </h1>
        <p className="text-lg text-slate-600 leading-relaxed mb-10">
          フルスタックエンジニアを目指して学習中です。
          <br />
          日々の暮らしの中にある「本質的な価値」を形にするアプリ開発を目指しています。
        </p>
 
        {/* ナビゲーションボタン */}
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href="/works"
            className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors"
          >
            Works を見る
          </Link>
          <Link
            href="/profile"
            className="px-6 py-3 border border-slate-300 text-slate-700 font-semibold rounded-xl hover:bg-slate-100 transition-colors"
          >
            Profile を見る
          </Link>
          <Link
            href="/contact"
            className="px-6 py-3 border border-slate-300 text-slate-700 font-semibold rounded-xl hover:bg-slate-100 transition-colors"
          >
            Contact
          </Link>
        </div>
      </section>
 
      {/* スキルバッジ */}
      <section className="mt-20 text-center">
        <p className="text-sm text-slate-400 mb-4">Tech Stack</p>
        <div className="flex flex-wrap justify-center gap-2">
          {["React", "Next.js", "TypeScript", "Chakra UI", "Express", "Prisma", "MySQL", "Tailwind CSS"].map(
            (tech) => (
              <span
                key={tech}
                className="px-3 py-1 bg-white border border-slate-200 text-slate-600 text-sm rounded-full shadow-sm"
              >
                {tech}
              </span>
            )
          )}
        </div>
      </section>
      {/* 🕵️‍♂️ 【秘密の裏口フッター】管理者画面ここに仕込む */}
      <footer className="mt-32 pb-8 text-center select-none">
        <p className="text-[10px] tracking-widest text-slate-400">
          © 2026 Yukie Nozawa. All rights reserved.
        </p>
        
        {/* 仕切り線に挟まれた隠しリンク（薄さはそのままキープ） */}
        <div className="flex items-center justify-center gap-3 max-w-xs mx-auto mt-4 text-[9px] text-slate-300/30">
          <div className="h-[1px] w-8 bg-slate-200/30"></div>
          <Link 
            href="/secret-login" 
            className="hover:text-indigo-500/40 transition-colors cursor-default tracking-[0.2em] font-light"
          >
            2026 2nd-STAGE
          </Link>
          <div className="h-[1px] w-8 bg-slate-200/30"></div>
        </div>
      </footer>
    </main>
  );
}
 