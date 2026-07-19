import { Request, Response } from 'express';
import { auth } from '../config/firebase';

// セッションCookieの有効期限：14日間（Firebaseの上限）
const SESSION_EXPIRES_IN = 14 * 24 * 60 * 60 * 1000;

// Cookieヘッダーから session の値だけを取り出す簡易パーサー
// （cookie-parser未導入のため自前実装。値に "=" を含んでいても壊れないよう、
//   最初の "=" だけで区切る）
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
 */
export const verifySession = async (req: Request, res: Response) => {
  try {
    const sessionCookie = extractSessionCookie(req.headers.cookie);

    if (!sessionCookie) {
      // 🚨 authMiddlewareと同じ方針：未認証は一律404
      return res.status(404).json({ message: 'Not Found' });
    }

    // checkRevoked: true でログアウト済み・失効セッションも弾く
    await auth.verifySessionCookie(sessionCookie, true);

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error('🔒 セッション検証エラー:', error);
    return res.status(404).json({ message: 'Not Found' });
  }
};