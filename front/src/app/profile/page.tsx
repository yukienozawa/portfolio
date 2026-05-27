import React from "react";
 
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
// 子コンポーネント
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
 
/** 左カラム：基本情報 */
const ProfileCard = () => (
  <Card className="p-6 h-full">
    {/* アバター */}
    <div className="text-center mb-6">
      <div className="w-32 h-32 bg-slate-200 rounded-full mx-auto mb-4 flex items-center justify-center text-slate-400">
        <span className="text-sm">No Image</span>
      </div>
      <h2 className="text-2xl font-bold text-slate-800">Yukie Nozawa</h2>
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
 
/** 自己紹介文 */
const AboutCard = () => (
  <Card className="p-8">
    <SectionHeading>自己紹介</SectionHeading>
    <p className="text-slate-600 leading-relaxed mb-4">
      長年にわたり、組織のバックボーンを支えるセールスアドミニストレーターおよび調達マネージャーとしてキャリアを築いてきました。業務効率化やプロセス改善に深く携わる中で、「テクノロジーの力で、日常の隠れた不便をもっと本質的に解決したい」という強い想いが芽生え、エンジニアへの転身を決意しました。
    </p>
    <p className="text-slate-600 leading-relaxed">
      現在はフルスタックブートキャンプにて、React、Next.js、TypeScript、Expressなどの現代的なWeb技術を猛勉強中です。日々の暮らしの中にある「本質的な価値（NatuLife）」を形にするアプリケーション開発を目指しています。
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
          <span className="text-indigo-600 mr-2">{icon}</span>
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
// メインコンポーネント
// ============================================================
 
export default function ProfilePage() {
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
        {/* 左カラム：基本情報 */}
        <section className="md:col-span-1 h-full">
          <ProfileCard />
        </section>
 
        {/* 右カラム：自己紹介・趣味 */}
        <section className="md:col-span-2 space-y-8">
          <AboutCard />
          <HobbiesCard />
        </section>
      </div>
    </main>
  );
}
 