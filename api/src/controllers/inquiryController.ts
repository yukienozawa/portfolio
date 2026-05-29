import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const inquiryController = {
  /**
   * 1. お問い合わせの新規登録（一般公開API：誰でも送信可能）
   * フロントのフォームから送られてくる name, email, message を受け取ってMySQLに保存します。
   */
  createInquiry: async (req: Request, res: Response): Promise<void> => {
    try {
      const { name, email, message } = req.body;

      // 必須入力チェック（Prismaの型に準拠）
      if (!name || !email || !message) {
        res.status(400).json({ error: 'すべての項目を入力してください。' });
        return;
      }

      // MySQLのInquiryテーブルにレコードを作成
      const newInquiry = await prisma.inquiry.create({
        data: {
          name,
          email,
          message,
        },
      });

      res.status(201).json({ message: 'お問い合わせを送信しました。', data: newInquiry });
    } catch (error) {
      console.error('お問い合わせ登録エラー:', error);
      res.status(500).json({ error: 'サーバーエラーが発生しました。' });
    }
  },

  /**
   * 2. お問い合わせ一覧取得（管理者専用API：要Firebase認証）
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