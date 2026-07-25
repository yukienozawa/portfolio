// api/src/lib/prisma.ts
// ============================================================
// このファイルの責務：PrismaClientのシングルトンインスタンスを提供する
// サーバーレス環境（Vercel）での接続過多を防ぐため、
// アプリ全体でこの1つのインスタンスを共有する
// ============================================================

import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}