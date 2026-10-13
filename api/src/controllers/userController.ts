// ============================================================
// このファイルの責務：管理者ユーザー（User）に関するHTTPリクエスト処理のみ
// ------------------------------------------------------------
// 【重要】ADMINレコードの自動作成ロジックは削除済み（セキュリティ対応）
// 理由：以前はFirebase認証さえ通れば、MySQL側にレコードがない場合に
//       自動でrole: 'ADMIN'としてユーザーを新規作成していた。
//       authMiddlewareの認可チェック実装に伴い、この自動作成が
//       「初めてログインした人が誰でもADMINになれる」抜け道になるため廃止。
//       ADMINユーザーは、Prisma Studio等を使って手動で1件だけ作成する運用とする。
// ============================================================

import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

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
      const user = await prisma.user.findUnique({
        where: { id: uid },
      });

      // レコードが存在しない場合は、自動作成せずそのままエラーを返す
      // （authMiddlewareを通過している時点でADMINレコードは存在しているはずだが、
      //   万が一存在しない場合は、想定外の状態として明示的にエラーを返す）
      if (!user) {
        res.status(404).json({ error: 'ユーザー情報が見つかりません。' });
        return;
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
          avatarUrl,
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
        select: {
          name: true,
          bio: true,
          avatarUrl: true,
          githubUrl: true,
        },
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