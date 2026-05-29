import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// authMiddlewareによってreq.userにFirebaseのユーザー情報が格納されている想定の拡張型
interface AuthenticatedRequest extends Request {
  user?: {
    uid: string;
    email?: string;
  };
}

export const userController = {
  /**
   * 1. ログイン中の管理者プロフィールの取得（GET）
   */
  getProfile: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const uid = req.user?.uid;

      if (!uid) {
        res.status(401).json({ error: '認証情報がありません。' });
        return;
      }

      // Firebaseのuidを主キー(id)としてMySQLから検索
      let user = await prisma.user.findUnique({
        where: { id: uid },
      });

      // 💡 もしMySQL側にまだあなたのレコード（器）がなければ、その場でお試し初期データを作成
      if (!user) {
        user = await prisma.user.create({
          data: {
            id: uid,
            email: req.user?.email || '',
            name: '管理者',
            bio: 'ここに自己紹介文を入力してください。',
            role: 'ADMIN',
            avatarUrl: '', // 初期状態は空文字（後からGitHubのURLを入れます）
            githubUrl: '',
          },
        });
      }

      res.status(200).json(user);
    } catch (error) {
      console.error('プロフィール取得エラー:', error);
      res.status(500).json({ error: 'サーバーエラーが発生しました。' });
    }
  },

  /**
   * 2. プロフィールの更新（PUT）
   */
  updateProfile: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const uid = req.user?.uid;
      const { name, bio, avatarUrl, githubUrl } = req.body;

      if (!uid) {
        res.status(401).json({ error: '認証情報がありません。' });
        return;
      }

      // ログイン中の本人のレコードだけを安全に更新
      const updatedUser = await prisma.user.update({
        where: { id: uid },
        data: {
          name,
          bio,
          avatarUrl, // フロントから送られてきたGitHubの画像URLがここに書き込まれます
          githubUrl,
        },
      });

      res.status(200).json({ message: 'プロフィールを更新しました。', data: updatedUser });
    } catch (error) {
      console.error('プロフィール更新エラー:', error);
      res.status(500).json({ error: 'サーバーエラーが発生しました。' });
    }
  },

  /**
   * 3. 一般公開用のプロフィール取得（GET：認証なし）
   * 表側のトップページに表示するために、特定の管理者データをIDなしで1件だけ引っ張ってきます
   */
  getPublicProfile: async (req: Request, res: Response): Promise<void> => {
    try {
      const adminUser = await prisma.user.findFirst({
        where: { role: 'ADMIN' },
      });

      if (!adminUser) {
        res.status(404).json({ error: 'プロフィールが見つかりません。' });
        return;
      }

      res.status(200).json(adminUser);
    } catch (error) {
      console.error('公開プロフィール取得エラー:', error);
      res.status(500).json({ error: 'サーバーエラーが発生しました。' });
    }
  },
};