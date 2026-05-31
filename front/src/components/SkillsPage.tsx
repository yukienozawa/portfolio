import React from "react";
// ============================================================
// このファイルの責務：UIの構築・デザインの表現（プレゼンテーション）
// ルーティングやシステム的な設定には一切関与しない
// 渡されたデータ（または内部の定数データ）をセマンティックなHTMLで描画することに特化する
// ============================================================

// ============================================================
// 型定義・定数データ
// ============================================================
export interface SkillItem {
  name: string;
  level: number; // 1〜5
}

export interface SkillCategory {
  category: string;
  icon: string;
  skills: SkillItem[];
}

const SKILL_CATEGORIES: SkillCategory[] = [
  {
    category: "Frontend",
    icon: "🖥️",
    skills: [
      { name: "React", level: 4 },
      { name: "Next.js", level: 3 },
      { name: "TypeScript", level: 3 },
      { name: "Tailwind CSS", level: 4 },
    ],
  },
  {
    category: "Backend",
    icon: "⚙️",
    skills: [
      { name: "Node.js", level: 3 },
      { name: "Express", level: 3 },
      { name: "Prisma", level: 3 },
      { name: "MySQL", level: 3 },
    ],
  },
  {
    category: "Tools & Others",
    icon: "🛠️",
    skills: [
      { name: "Git / GitHub", level: 4 },
      { name: "Docker", level: 2 },
      { name: "Firebase", level: 3 },
      { name: "Cursor (AI Editor)", level: 4 },
    ],
  },
];

// ============================================================
// 子コンポーネント
// ============================================================

/** スキルレベルバー */
const SkillBar: React.FC<SkillItem> = ({ name, level }) => (
  <li>
    <div className="flex justify-between text-sm mb-1">
      <span className="text-slate-700 font-medium">{name}</span>
      <span className="text-slate-400">{level}/5</span>
    </div>
    <div className="w-full bg-slate-100 rounded-full h-2" role="progressbar" aria-valuenow={level} aria-valuemin={0} aria-valuemax={5}>
      <div
        className="bg-indigo-500 h-2 rounded-full transition-all"
        style={{ width: `${(level / 5) * 100}%` }}
      />
    </div>
  </li>
);

/** スキルカテゴリカード */
const SkillCategoryCard: React.FC<SkillCategory> = ({ category, icon, skills }) => (
  <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
    <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
      <span aria-hidden="true">{icon}</span>
      {category}
    </h2>
    {/* div連発を避けるため、スキル一覧はul/li構造に最適化 */}
    <ul className="space-y-4">
      {skills.map((skill) => (
        <SkillBar key={skill.name} {...skill} />
      ))}
    </ul>
  </section>
);

// ============================================================
// メインUIコンポーネント
// ============================================================
export const SkillsPage: React.FC = () => {
  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      {/* ページヘッダー */}
      <header className="text-center mb-16">
        <h1 className="text-4xl font-bold text-slate-800 mb-4">SKILLS</h1>
        <p className="text-slate-600 text-lg">習得中・習得済みの技術スタック</p>
        <div className="w-16 h-1 bg-indigo-600 mx-auto mt-4" aria-hidden="true" />
      </header>

      {/* スキルカードグリッド */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {SKILL_CATEGORIES.map((category) => (
          <SkillCategoryCard key={category.category} {...category} />
        ))}
      </div>
    </main>
  );
};