// ============================================================
// このファイルの責務：実績（Achievement）に関するHTTPリクエスト処理のみ
// 実際のDB操作はachievementService.tsに完全委譲する
// ============================================================

import { Request, Response } from 'express';
import { achievementService } from '../services/achievementService';

// Prismaが返す実績データの型構造を安全に扱うためのインターフェース定義（any回避）
interface PrismaAchievement {
  id: string;
  title: string;
  description: string;
  imageUrl: string | null;
  category: string;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const achievementController = {
  /**
   * 1. GET /api/achievements
   * 実績一覧を最新順で取得（公開API）
   */
  async getAchievements(req: Request, res: Response) {
    try {
      const achievements = await achievementService.getAllAchievements();
      res.status(200).json(achievements);
    } catch (error) {
      console.error('Get achievements error:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  },

  /**
   * 2. GET /api/admin/achievements/:id
   * 編集画面を開いたときに、指定されたIDのデータを1件だけ取得する（管理者専用）
   */
  async getAchievementById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      // 💡 any禁止！Prismaの型（PrismaAchievement[]）として安全にキャストして検索します
      const rawData = await achievementService.getAllAchievements();
      const achievements = rawData as unknown as PrismaAchievement[];
      const rawAchievement = achievements.find((item) => item.id === id);
      
      if (!rawAchievement) {
        return res.status(404).json({ error: 'Achievement not found' });
      }

      // フロント（Next.js）のフォームが期待する項目名（achievementTitleなど）に綺麗に変換
      const targetAchievement = {
        id: rawAchievement.id,
        title: rawAchievement.title, 
        description: rawAchievement.description,
        imageUrl: rawAchievement.imageUrl || '',
      };

      res.status(200).json(targetAchievement);
    } catch (error) {
      console.error('Get achievement by id error:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  },

  /**
   * 3. PUT /api/admin/achievements/:id
   * 編集画面から送られてきた画像（Base64）と文章を、MySQLへガチ上書き保存する（管理者専用）
   */
  async updateAchievement(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { achievementTitle, description, imageData } = req.body;

      if (!achievementTitle) {
        return res.status(400).json({ error: 'Title is required' });
      }

      // 🚀 サービス層に新設した「本物の上書き関数」を真っ直ぐ呼び出します！
      const updated = await achievementService.updateAchievement(id, { achievementTitle, description, imageData });
      res.status(200).json(updated);
    } catch (error) {
      console.error('Update achievement error:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  },

  /**
   * 4. POST /api/admin/achievements
   * 実績の新規登録（Admin専用API）
   */
  async createAchievement(req: Request, res: Response) {
    try {
      const { achievementTitle, description, imageData } = req.body;

      if (!achievementTitle) {
        return res.status(400).json({ error: 'Title is required' });
      }

      const newAchievement = await achievementService.createAchievement({
        achievementTitle,
        description,
        imageData,
      });

      res.status(201).json(newAchievement);
    } catch (error) {
      console.error('Create achievement error:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  },
};