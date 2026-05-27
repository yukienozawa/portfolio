import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const achievementService = {
  /**
   * すべての実績を最新順（createdAtの降順）で取得する
   */
  async getAllAchievements() {
    return await prisma.achievement.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  },

  /**
   * 新しい実績をデータベースに登録する
   */
  async createAchievement(data: {
    achievementTitle: string;
    description: string;
    imageData: string;
  }) {
    return await prisma.achievement.create({
      data: {
        title: data.achievementTitle, // スキーマの title にマッピング
        description: data.description, // スキーマの description にマッピング
        imageUrl: data.imageData,       // スキーマの imageUrl にBase64文字列を格納
        category: 'WEB_APP',           // デフォルト値
        isPublished: true,             // フロントから登録されたら即公開
      },
    });
  },
};