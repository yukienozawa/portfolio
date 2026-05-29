"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image"; // 👈 1. Next.jsの高性能Imageをインポート

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

// 👥 一般公開用プロフィールの型定義
interface PublicProfile {
  name: string;
  bio: string;
  avatarUrl: string;
}

// ============================================================
// 定数データ
// ============================================================

const PROFILE_ITEMS: ProfileItem[] = [
  { label: "拠点", value: "新潟県上越市" },
  { label: "現在の所属", value: "Ms.Engineer フルスタックエンジニアリングコース" },
  { label: "ライフスタイルブランド", value: "NatuLife" },
];

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
// 子コンポーネント（表示に必要なデータをプロパティ(props)で受け取るように進化）
// ============================================================

/** セクション見出し（インジケーター付き） */
const SectionHeading = ({ children }: { children: React.ReactNode }) => (
  <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center border-b border-slate-100 pb-2">
    <span className="w-2 h-5 bg-indigo-600 rounded-full mr-2" />
    {children}
  </h3>
);

/** カード共通ラッパー */
const Card = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-white rounded-2xl shadow-sm border border-slate-100 ${className}`}>
    {children}
  </div>
);

/** 左カラム：基本情報（DBから届いた名前と画像URLを反映！） */
const ProfileCard = ({ name, avatarUrl }: { name: string; avatarUrl: string }) => (
  <Card className="p-6 h-full">
    {/* アバター */}
    <div className="text-center mb-6">
      <div className="relative w-32 h-32 mx-auto mb-4">
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
      <h2 className="text-2xl font-bold text-slate-800">{name}</h2>
      <p className="text-sm text-indigo-600 font-medium mt-1">Full-Stack Developer Student</p>
    </div>

    <hr className="border-slate-100 my-6" />

    {/* 基本情報リスト */}
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

/** 自己紹介文（DBから届いた最新の紹介文を反映！） */
const AboutCard = ({ bio }: { bio: string }) => (
  <Card className="p-8">
    <SectionHeading>自己紹介</SectionHeading>
    {/* whitespace-pre-wrap を入れることで、管理画面で打った改行がそのまま綺麗に反映されます */}
    <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">
      {bio}
    </p>
  </Card>
);

/** 趣味・ライフスタイル */
const HobbiesCard = () => (
  <Card className="p-8">
    <SectionHeading>趣味・ライフスタイル</SectionHeading>
    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-slate-600">
      {HOBBY_ITEMS.map(({ icon, title, description }) => (
        <li key={title} className="flex items-start">
          <span className="text-indigo-600 mr-2 text-base">{icon}</span>
          <div>
            <strong className="text-slate-800 block">{title}</strong>
            <span className="text-sm">{description}</span>
          </div>
        </li>
      ))}
    </ul>
  </Card>
);

// ============================================================
// メインコンポーネント（大元でAPIからデータを取得して子へ配る）
// ============================================================

export default function ProfilePage() {
  // 初期値として、もしDB接続が遅くても違和感のないデフォルト値をセット
  const [profile, setProfile] = useState<PublicProfile>({
    name: "Yukie Nozawa",
    bio: "長年にわたり、組織のバックボーンを支えるセールスアドミニストレーターおよび調達マネージャーとしてキャリアを築いてきました。業務効率化やプロセス改善に深く携わる中で、「テクノロジーの力で、日常の隠れた不便をもっと本質的に解決したい」という強い想いが芽生え、エンジニアへの転身を決意しました。\n\n現在はフルスタックブートキャンプにて、React、Next.js、TypeScript、Expressなどの現代的なWeb技術を猛勉強中です。日々の暮らしの中にある「本質的な価値（NatuLife）」を形にするアプリケーション開発を目指しています。",
    avatarUrl: "",
  });

  // 🔌 データベースから一般公開用のプロフィールを自動取得
  useEffect(() => {
    const fetchPublicProfile = async () => {
      try {
        const res = await fetch("/api/profile/public");
        if (res.ok) {
          const data = await res.json();
          if (data) {
            setProfile({
              name: data.name,
              bio: data.bio,
              avatarUrl: data.avatarUrl || "",
            });
          }
        }
      } catch (error) {
        console.error("プロフィール取得エラー:", error);
      }
    };
    fetchPublicProfile();
  }, []);

  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      {/* ページヘッダー */}
      <header className="text-center mb-16">
        <h1 className="text-4xl font-bold text-slate-800 mb-4">PROFILE</h1>
        <p className="text-slate-600 text-lg">私についてと、大切にしている価値観</p>
        <div className="w-16 h-1 bg-indigo-600 mx-auto mt-4" />
      </header>

      {/* コンテンツグリッド */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 items-stretch">
        {/* 左カラム：基本情報（状態管理している名前と画像URLを渡す） */}
        <section className="md:col-span-1 h-full">
          <ProfileCard name={profile.name} avatarUrl={profile.avatarUrl} />
        </section>

        {/* 右カラム：自己紹介・趣味（状態管理している自己紹介文を渡す） */}
        <section className="md:col-span-2 space-y-8">
          <AboutCard bio={profile.bio} />
          <HobbiesCard />
        </section>
      </div>
    </main>
  );
}