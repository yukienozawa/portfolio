import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier";

const config = [
  // =========================
  // Next.js公式推奨ルール
  // =========================
  ...nextVitals,
  ...nextTs,

  // =========================
  // プロジェクト独自ルール
  // =========================
  {
    rules: {
      // anyは警告（AIコード対策）
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },

  // =========================
  // Prettier競合回避
  // =========================
  prettier,

  // =========================
  // 除外設定
  // =========================
  {
    ignores: [
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },
];

export default config;