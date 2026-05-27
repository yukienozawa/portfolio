import { Request, Response, NextFunction } from 'express';
import { auth } from '../config/firebase';
import { DecodedIdToken } from 'firebase-admin/auth';

// ExpressのRequest型を拡張して、Firebaseのデコード済みトークン（ユーザー情報）を保持できるようにします
export interface AuthRequest extends Request {
  user?: DecodedIdToken; // 👈 any から DecodedIdToken に変更！
}

export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // 1. ヘッダーから Authorization: Bearer <Token> を取得
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // 🚨 セキュリティ要件：未認証時は存在を隠すため一律 404 を返却！
      return res.status(404).json({ message: 'Not Found' });
    }

    const token = authHeader.split(' ')[1];

    // 2. Firebase Admin SDK でトークンが本物か検証
    const decodedToken = await auth.verifyIdToken(token);
    
    // 3. 【TODO】管理者権限（UserRole.ADMIN）のチェック
    // 現時点ではトークンが正常なら一旦通過させますが、将来的にここでロール確認を行います
    // もし管理者権限がない場合も、要件通り 404 を返却します
    
    // 認証成功：リクエストオブジェクトにユーザー情報を格納して次へ進む
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('🔒 認証エラー:', error);
    // 🚨 セキュリティ要件：トークンが無効・期限切れの場合も一律 404 を返却！
    return res.status(404).json({ message: 'Not Found' });
  }
};