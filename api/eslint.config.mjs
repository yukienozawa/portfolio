import js from "@eslint/js";
import prettier from "eslint-config-prettier";
import tseslint from "typescript-eslint";

const config = [
  // =========================
  // JavaScript公式推奨
  // =========================
  js.configs.recommended,

  // =========================
  // TypeScript公式推奨
  // =========================
  ...tseslint.configs.recommended,

  // =========================
  // プロジェクト独自ルール
  // =========================
  {
    rules: {
      // API側は厳格
      "@typescript-eslint/no-explicit-any": "error",

      // 未使用変数
      "@typescript-eslint/no-unused-vars": "warn",

      // JS側と競合するためOFF
      "no-unused-vars": "off",
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
      "node_modules/**",
      "dist/**",
      "db.json",
      "prisma/seed.js",
      "prisma/seed.ts",
    ],
  },
];

export default config;