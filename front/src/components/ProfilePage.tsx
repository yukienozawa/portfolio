// ============================================================
// このファイルの責務：UIの表示のみ
// データの取得や状態管理は一切行わない（useProfile カスタムフックに完全委譲）
// ============================================================
 
"use client";
 
import React from "react";
import Image from "next/image";
import { useProfile } from "@/hooks/useProfile";
 
// ============================================================
// ⚠️ 重要：プロフィール画面の管理方針について
// ============================================================
// 【1】「拠点」「所属」「ライフスタイルブランド」「趣味・ライフスタイル」について
//    これらは頻繁に変更されない固定情報であるため、管理画面（/admin）のフォーム化はあえて行わず、
//    開発スピードとDB設計のシンプルさを優先して、本ファイル内の「定数データ（以下）」で直接管理しています。
//    もし拠点の変更や、趣味の追加・文言修正を行いたい場合は、本ファイルの定数配列（PROFILE_ITEMS / HOBBY_ITEMS）
//    のテキストを直接書き換えるだけで、一瞬で安全に反映できます。
//
// 【2】「名前」「アイコン画像」「自己紹介文」について
//    これらは状況に応じて更新頻度が高いため、管理画面（MySQLデータベース）と完全連動しています。
// ============================================================
 
// ============================================================
// 型定義
// ============================================================
 
interface ProfileItem {
  label: string;
  value: string;
}
 
interface HobbyItem {
  icon: string;
  title: string;
  description: string;
}
 
// ============================================================
// 定数データ
// ============================================================
 
// 基本情報リスト（追加・変更はここだけでOK）
const PROFILE_ITEMS: ProfileItem[] = [
  { label: "拠点", value: "新潟県上越市" },
  { label: "現在の所属", value: "Ms.Engineer フルスタックエンジニアリングコース" },
  { label: "ライフスタイルブランド", value: "NatuLife" },
];
 
// 趣味・ライフスタイルリスト（追加・変更はここだけでOK）
const HOBBY_ITEMS: HobbyItem[] = [
  {
    icon: "🛠️",
    title: "DIY・木工家具製作",
    description: "1x4や2x4の木材を使い、ワトコオイルやウレタンニスで仕上げる本格的な家具作りが好きです。",
  },
  {
    icon: "🐕",
    title: "愛犬との暮らし",
    description: "白いポメラニアンと一緒に暮らしています。ペットフレンドリーなライフスタイルや旅行の計画を立てるのが日課です。",
  },
  {
    icon: "🌶️",
    title: "激辛グルメの探求",
    description: "突き抜けた辛さの中に旨味がある激辛料理が大好きで、美味しいお店の開拓を楽しんでいます。",
  },
  {
    icon: "💻",
    title: "AIドリブン開発",
    description: "CursorなどのAIエディタを活用し、効率的でスピーディーなモダンWeb開発の手法を模索しています。",
  },
];
 
// ============================================================
// 子コンポーネント（UIパーツ）
// ✅ コンポーネントは function 宣言で定義する
//    コンポーネント内部の処理は const アロー関数で書く
// ============================================================
 
/** セクション見出し（インジケーター付き） */
function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-2xl font-bold text-slate-800 mb-6 flex items-center border-b border-slate-100 pb-3 font-serif">
      <span className="w-1 h-6 bg-indigo-600 rounded-full mr-3" />
      {children}
    </h3>
  );
}
 
/** カード共通ラッパー */
function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-2xl shadow-sm border border-slate-100 ${className}`}>
      {children}
    </div>
  );
}
 
/** 左カラム：基本情報（名前と画像URLを props で受け取る） */
function ProfileCard({ name, avatarUrl }: { name: string; avatarUrl: string }) {
  return (
    <Card className="p-6 h-full">
      {/* アバター */}
      <div className="text-center mb-6">
        <div className="relative w-32 h-32 mx-auto mb-4">
          {avatarUrl ? (
            // 画像URLがある場合：Next.js Image で最適化表示
            <Image
              src={avatarUrl}
              alt={name}
              fill
              priority
              sizes="128px"
              className="rounded-full shadow-md border-4 border-slate-50 object-cover"
            />
          ) : (
            // 画像URLがない場合：名前の頭文字をグラデーション背景で表示
            <div className="w-full h-full rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 shadow-md flex items-center justify-center text-white text-4xl font-bold">
              {name.charAt(0)}
            </div>
          )}
        </div>
        <h2 className="text-3xl font-black text-slate-800 font-serif">{name}</h2>
        <p className="text-sm text-slate-500 font-medium tracking-widest uppercase mt-2">
          Full-Stack Developer Student
        </p>
      </div>
 
      <hr className="border-slate-100 my-6" />
 
      {/* PROFILE_ITEMS 配列をループして基本情報を表示 */}
      <dl className="space-y-4 text-sm text-slate-600">
        {PROFILE_ITEMS.map(({ label, value }) => (
          <div key={label}>
            <dt className="font-semibold text-slate-800">{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
    </Card>
  );
}
 
/** 自己紹介文（bio を props で受け取る） */
function AboutCard({ bio }: { bio: string }) {
  return (
    <Card className="p-8">
      <SectionHeading>自己紹介</SectionHeading>
      {/* whitespace-pre-wrap：管理画面で打った改行がそのまま反映される */}
      <p className="text-slate-600 leading-relaxed whitespace-pre-wrap font-serif">{bio}</p>
    </Card>
  );
}
 
/** 趣味・ライフスタイル（固定データのため props 不要） */
function HobbiesCard() {
  return (
    <Card className="p-8">
      <SectionHeading>趣味・ライフスタイル</SectionHeading>
      {/* HOBBY_ITEMS 配列をループして2カラムグリッドで表示 */}
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-slate-600 font-serif">
        {HOBBY_ITEMS.map(({ icon, title, description }) => (
          <li key={title} className="flex items-start">
            <span className="text-indigo-600 mr-2 text-base">{icon}</span>
            <div>
              <strong className="text-slate-800 block mb-1 font-bold tracking-tight">
                {title}
              </strong>
              <span className="text-sm leading-relaxed text-slate-500">
                {description}
                </span>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}
 
// ============================================================
// メインコンポーネント
// 責務：useProfile からデータを受け取り、子コンポーネントに配るだけ
// ============================================================
 
export default function ProfilePage() {
  // useProfile フックからデータ・ローディング状態・エラー状態を受け取る
  // このコンポーネント自身は fetch も useState も書かない
  const { profile, isLoading, isError } = useProfile();
 
  // ローディング中の表示
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-400">
        読み込み中...
      </div>
    );
  }
 
  // エラー時の表示（デフォルト値で表示を維持するため通常は表示されない）
  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-400">
        プロフィールの読み込みに失敗しました。
      </div>
    );
  }
 
  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
 
      {/* ページヘッダー */}
      <header className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-4 text-[#3c3fbc]">PROFILE</h1>
        <p className="text-slate-500 text-lg font-medium tracking-wide">私についてと、大切にしている価値観</p>
        <div className="w-16 h-1 bg-indigo-600 mx-auto mt-4" />
      </header>
 
      {/* 3カラムグリッド：左1・右2の比率で配置 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 items-stretch">
 
        {/* 左カラム（1/3幅）：名前と画像URLを props として渡す */}
        <section className="md:col-span-1 h-full">
          <ProfileCard name={profile.name} avatarUrl={profile.avatarUrl} />
        </section>
 
        {/* 右カラム（2/3幅）：自己紹介文を props として渡す */}
        <section className="md:col-span-2 space-y-8">
          <AboutCard bio={profile.bio} />
          <HobbiesCard />
        </section>
      </div>
    </main>
  );
}