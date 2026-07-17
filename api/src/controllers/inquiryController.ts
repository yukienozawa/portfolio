import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const inquiryController = {
  /**
   * お問い合わせ一覧取得（管理者専用API：要Firebase認証）
   * 管理画面の受信箱タブに表示するため、最新のメッセージが上に来るよう降順（desc）で取得します。
   */
  getInquiries: async (req: Request, res: Response): Promise<void> => {
    try {
      const inquiries = await prisma.inquiry.findMany({
        orderBy: {
          createdAt: 'desc',
        },
      });

      res.status(200).json(inquiries);
    } catch (error) {
      console.error('お問い合わせ取得エラー:', error);
      res.status(500).json({ error: 'サーバーエラーが発生しました。' });
    }
  },
};