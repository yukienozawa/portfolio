// ============================================================
// このファイルの責務：UIの表示のみ
// データの取得や状態管理は一切行わない（useProfile カスタムフックに完全委譲）
// ------------------------------------------------------------
// 【設計メモ】本来はページの実体を app/ 配下や features/ 等に
// 配置するのが望ましいが、途中でのリファクタリングコストを
// 踏まえ、意図的に components フォルダへの配置を継続している
// ============================================================

"use client";

import React from "react";
import Image from "next/image";
import { useProfile } from "@/hooks/useProfile";
import PageNav from "@/components/PageNav";
import Footer from "@/components/Footer";


// ============================================================
// ⚠️ 重要：プロフィール画面の管理方針について
// ============================================================
// 【1】「拠点」「経歴タイムライン」「趣味・ライフスタイル」について
//    これらは頻繁に変更されない固定情報であるため、管理画面（/admin）のフォーム化はあえて行わず、
//    開発スピードとDB設計のシンプルさを優先して、本ファイル内の「定数データ（以下）」で直接管理しています。
//    もし拠点の変更や、経歴・趣味の追加・文言修正を行いたい場合は、本ファイルの定数配列（PROFILE_ITEMS / HISTORY_ITEMS / HOBBY_ITEMS）
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

interface HistoryItem {
  date: string;
  event: string;
}

interface HobbyItem {
  icon: "diy" | "dog" | "spicy" | "code";
  title: string;
  description: string;
}

// ============================================================
// 定数データ
// ============================================================

// 基本情報リスト（追加・変更はここだけでOK）
const PROFILE_ITEMS: ProfileItem[] = [
  { label: "LOCATION", value: "新潟県上越市" },
];

// 経歴タイムライン（追加・変更はここだけでOK）
const HISTORY_ITEMS: HistoryItem[] = [
  { date: "Jan 2026", event: "Ms.Engineerコーディングブートキャンプ超集中コース受講開始" },
  { date: "Feb 2026", event: "24年務めた会社を退職" },
  { date: "Jul 2026", event: "Ms.Engineerコーディングブートキャンプ超集中コース修了" },
];

// 趣味・ライフスタイルリスト（追加・変更はここだけでOK）
const HOBBY_ITEMS: HobbyItem[] = [
  {
    icon: "diy",
    title: "DIY木工製作",
    description: "主に1×4・2×4材を使って、家具や遊具などを作るのが好きです。ホームセンターの資材売り場に行くとワクワクします。",
  },
  {
    icon: "dog",
    title: "愛犬との暮らし",
    description: "白いポメラニアンと一緒に暮らしています。ペットフレンドリーなライフスタイルや旅行の計画を立てるのが日課です。",
  },
  {
    icon: "spicy",
    title: "激辛グルメの探求",
    description: "突き抜けた辛さの中に旨味がある激辛料理が大好きで、美味しいお店の開拓を楽しんでいます。",
  },
  {
    icon: "code",
    title: "AIドリブン開発へ",
    description: "ClaudeなどのAIと相談・壁打ちしながら開発し、生成コードは自分で検証してから採用しています。これから「AIにどう開発させるか」を学び、AIドリブン開発を身につけたいと考えています。",
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
    <h3 className="font-display text-2xl font-bold text-slate-800 mb-6 flex items-center border-b border-slate-100 pb-3 uppercase tracking-[0.15em]">
      <span className="w-1 h-6 bg-indigo-600 rounded-full mr-3" />
      {children}
    </h3>
  );
}

/** カード共通ラッパー：マウスオーバーで軽く浮き上がる効果付き */
function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-2xl shadow-sm border border-slate-100 hover:shadow-md hover:-translate-y-0.5 transition-all ${className}`}>
      {children}
    </div>
  );
}

/** 趣味アイコン：種類に応じたSVGアイコンを表示 */
function HobbyIcon({ type }: { type: HobbyItem["icon"] }) {
  const commonProps = {
    width: 20,
    height: 20,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  switch (type) {
    case "diy":
      return (
        <svg {...commonProps}>
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
        </svg>
      );
    case "dog":
      return (
        <svg {...commonProps}>
          <circle cx="11" cy="4" r="2" />
          <circle cx="18" cy="8" r="2" />
          <circle cx="20" cy="16" r="2" />
          <path d="M9 10a5 5 0 0 1 5 5v3.5a3.5 3.5 0 0 1-6.84 1.045Q6.52 17.48 4.46 16.84A3.5 3.5 0 0 1 5.5 10Z" />
        </svg>
      );
    case "spicy":
      return (
        <svg {...commonProps}>
          <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
        </svg>
      );
    case "code":
      return (
        <svg {...commonProps}>
          <polyline points="16 18 22 12 16 6" />
          <polyline points="8 6 2 12 8 18" />
        </svg>
      );
  }
}

/** 左カラム：基本情報（名前と画像URLを props で受け取る） */
function ProfileCard({ name, avatarUrl }: { name: string; avatarUrl: string }) {
  return (
    <Card className="p-6 h-full">
      {/* アバター */}
      <div className="mb-6">
        <div className="relative w-32 h-32 mb-4">
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt={name}
              fill
              priority
              sizes="128px"
              className="rounded-full shadow-md border-4 border-slate-50 object-cover"
            />
          ) : (
            <div className="w-full h-full rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 shadow-md flex items-center justify-center text-white text-4xl font-bold">
              {name.charAt(0)}
            </div>
          )}
        </div>
        <h2 className="font-display text-3xl font-bold text-[#3c3fbc] uppercase tracking-[0.3em]">{name}</h2>
                <p className="font-body text-sm text-slate-600 font-medium tracking-widest uppercase mt-2">
          OPERATIONS × WEB DEVELOPMENT
        </p>
        <p className="font-body text-xs text-slate-600 font-medium tracking-widest uppercase mt-1">
          User-Centered, Always.
        </p>
      </div>

      <hr className="border-slate-100 my-6" />

      {/* Location */}
      <dl className="space-y-4 text-sm text-slate-600 font-body">
        {PROFILE_ITEMS.map(({ label, value }) => (
          <div key={label}>
            <dt className="font-display text-sm font-bold text-slate-800 uppercase tracking-[0.15em]">{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>

      {/* HISTORY：経歴タイムライン */}
      <div className="mt-6">
        <h3 className="font-display text-sm font-bold text-slate-800 uppercase tracking-[0.15em] mb-3">
          History
        </h3>
        <ul className="space-y-3 text-sm text-slate-600 font-body border-l-2 border-slate-100 pl-4">
          {HISTORY_ITEMS.map(({ date, event }) => (
            <li key={date}>
              <span className="block text-xs text-indigo-800 font-semibold">{date}</span>
              <span>{event}</span>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
}

/** 自己紹介文（bio を props で受け取る） */
function AboutCard({ bio }: { bio: string }) {
  return (
    <Card className="p-8">
      <SectionHeading>About Me</SectionHeading>
      <p className="text-slate-600 leading-relaxed whitespace-pre-wrap font-body">{bio}</p>
    </Card>
  );
}

/** 趣味・ライフスタイル（固定データのため props 不要） */
function HobbiesCard() {
  return (
    <Card className="p-8">
      <SectionHeading>Hobbies &amp; Lifestyle</SectionHeading>
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-slate-600 font-body">
        {HOBBY_ITEMS.map(({ icon, title, description }) => (
          <li key={title} className="flex items-start">
            <span className="text-indigo-600 mr-2 mt-0.5 flex-shrink-0">
              <HobbyIcon type={icon} />
            </span>
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
  const { profile, isLoading, isError } = useProfile();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-400">
        読み込み中...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-400">
        プロフィールの読み込みに失敗しました。
      </div>
    );
  }

  return (
    <main className="max-w-5xl mx-auto px-4 py-6 bg-slate-50 min-h-screen">

      {/* ナビゲーションタブ（共通コンポーネント、現在地を自動判定） */}
      <PageNav />

      {/* ページヘッダー */}
      <header className="mb-16">
        <h1 className="font-display text-6xl md:text-8xl font-bold text-slate-800 uppercase tracking-tight leading-none">
          Profile
        </h1>
        <p className="font-body text-slate-500 text-lg font-medium tracking-wide mt-3 pl-2">
          私についてと、大切にしている価値観
        </p>
      </header>

      {/* 3カラムグリッド：左1・右2の比率で配置 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 items-stretch">

        <section className="md:col-span-1 h-full">
          <ProfileCard name={profile.name} avatarUrl={profile.avatarUrl} />
        </section>

        <section className="md:col-span-2 space-y-8">
          <AboutCard bio={profile.bio} />
          <HobbiesCard />
        </section>
      </div>

      <Footer />
    </main>
  );
}