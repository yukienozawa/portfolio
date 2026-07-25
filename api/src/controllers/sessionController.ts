// ============================================================
// このファイルの責務：/admin配下のセッションCookie検証に関するHTTPリクエスト処理のみ
// Firebase Admin SDKを使った実際の検証ロジックはこのファイル内で完結させる
// ------------------------------------------------------------
// 【重要・修正履歴】verifySessionにrole確認を追加
// 以前はFirebaseセッションが本物かどうか（認証）のみをチェックしており、
// role === 'ADMIN'かどうか（認可）を見ていなかった。
// authMiddleware側は認可チェック済みだが、/adminページの表示可否を
// 判定するproxy.ts側の入り口（このverifySession）にも同様のチェックが
// 必要なため、authMiddlewareと同じ基準を追加した。
// ============================================================

import { Request, Response } from 'express';
import { auth } from '../config/firebase';
import { prisma } from '../lib/prisma';

// セッションCookieの有効期限：14日間（Firebaseの上限）
const SESSION_EXPIRES_IN = 14 * 24 * 60 * 60 * 1000;

// Cookieヘッダーから session の値だけを取り出す簡易パーサー
const extractSessionCookie = (cookieHeader?: string): string | undefined => {
  const target = cookieHeader
    ?.split(';')
    .map((c) => c.trim())
    .find((c) => c.startsWith('session='));

  return target?.slice('session='.length);
};

/**
 * ログイン時：IDトークンを受け取り、正式なセッションCookie（JWT文字列）に変換して返す
 */
export const createSession = async (req: Request, res: Response) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({ message: 'idToken is required' });
    }

    const sessionCookie = await auth.createSessionCookie(idToken, {
      expiresIn: SESSION_EXPIRES_IN,
    });

    return res.status(200).json({ sessionCookie });
  } catch (error) {
    console.error('🔒 セッションCookie作成エラー:', error);
    return res.status(401).json({ message: 'Unauthorized' });
  }
};

/**
 * /admin アクセス時：セッションCookieの中身を検証する（proxy.tsから呼ばれる）
 * 認証（Firebaseセッションが本物か）に加えて、認可（role === 'ADMIN'か）も確認する
 */
export const verifySession = async (req: Request, res: Response) => {
  try {
    const sessionCookie = extractSessionCookie(req.headers.cookie);

    if (!sessionCookie) {
      return res.status(404).json({ message: 'Not Found' });
    }

    // 1. 認証：checkRevoked: true でログアウト済み・失効セッションも弾く
    const decodedToken = await auth.verifySessionCookie(sessionCookie, true);

    // 2. 認可：MySQL側でADMINロールかどうかを確認
    const userRecord = await prisma.user.findUnique({
      where: { id: decodedToken.uid },
    });

    if (!userRecord || userRecord.role !== 'ADMIN') {
      return res.status(404).json({ message: 'Not Found' });
    }

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error('🔒 セッション検証エラー:', error);
    return res.status(404).json({ message: 'Not Found' });
  }
};