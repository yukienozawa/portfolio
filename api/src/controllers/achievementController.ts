import { Request, Response } from 'express';
import { achievementService } from '../services/achievementService';

export const achievementController = {
  /**
   * GET /api/achievements
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
   * POST /api/admin/achievements
   * 実績の新規登録（Admin専用API）
   */
  async createAchievement(req: Request, res: Response) {
    try {
      const { achievementTitle, description, imageData } = req.body;

      // 簡単なバリデーション
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