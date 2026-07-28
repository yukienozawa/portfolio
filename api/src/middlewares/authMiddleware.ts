// ============================================================
// このファイルの責務：/admin配下のリクエストに対する認証・認可の一元管理
// 1. 認証（Authentication）：Firebase IDトークンが本物かどうかを検証する
// 2. 認可（Authorization）：トークンの持ち主がADMINロールかどうかを検証する
// どちらも満たさない場合は、管理画面の存在自体を隠すため一律404を返却する
// ============================================================

import { Request, Response, NextFunction } from 'express';
import { auth } from '../config/firebase';
import { DecodedIdToken } from 'firebase-admin/auth';
import { prisma } from '../lib/prisma';

export interface AuthRequest extends Request {
  user?: DecodedIdToken;
}

export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(404).json({ message: 'Not Found' });
    }

    const token = authHeader.split(' ')[1];
    const decodedToken = await auth.verifyIdToken(token);

    // 管理者権限（role === 'ADMIN'）のチェック
    const userRecord = await prisma.user.findUnique({
      where: { id: decodedToken.uid },
    });

    if (!userRecord || userRecord.role !== 'ADMIN') {
      // 🚨 セキュリティ要件：権限がない場合も一律404を返却
      return res.status(404).json({ message: 'Not Found' });
    }

    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('🔒 認証エラー:', error);
    return res.status(404).json({ message: 'Not Found' });
  }
};