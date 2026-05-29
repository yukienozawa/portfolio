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

  /**
   * 既存の実績をデータベース（MySQL）に上書き保存する
   * any禁止ルールをクリアするため、引数と戻り値（Promise<unknown>）の型を厳格に定義しています。
   */
  async updateAchievement(
    id: string,
    data: {
      achievementTitle: string;
      description: string;
      imageData: string;
    }
  ): Promise<unknown> {
    return await prisma.achievement.update({
      where: { id },
      data: {
        title: data.achievementTitle,
        description: data.description,
        imageUrl: data.imageData,
      },
    });
  },
};