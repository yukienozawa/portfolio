import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authMiddleware, AuthRequest } from '../authMiddleware';
import { Response, NextFunction } from 'express';
import { auth } from '../../config/firebase';
import { DecodedIdToken } from 'firebase-admin/auth';

// 🔥 ここがポイント：「本物のFirebase」を見に行かないように身代わり（モック）を作ります
vi.mock('../../config/firebase', () => ({
  auth: {
    verifyIdToken: vi.fn(),
  },
}));

describe('authMiddleware (認可ミドルウェアのテスト)', () => {
  let req: Partial<AuthRequest>;
  let res: Partial<Response>;
  let next: NextFunction;

  // テストを1つ実行するたびに、毎回リクエストやレスポンスの状態をリセットする準備
  beforeEach(() => {
    req = {
      headers: {},
    };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
    next = vi.fn();
    vi.clearAllMocks(); // 身代わりの呼び出し履歴もきれいにリセット
  });

  it('✅ 正常なトークンがある場合、next() が呼ばれて次の処理へ進むこと', async () => {
    // 偽物の「正しいユーザー情報」を用意
    const mockUser = { uid: 'admin-user-123', email: 'admin@example.com' };
    req.headers!.authorization = 'Bearer valid-token-xyz';
    
    // Firebaseマシーンが「このトークンは本物だよ」と mockUser を返すように偽装
    vi.mocked(auth.verifyIdToken).mockResolvedValue(mockUser as DecodedIdToken);

    await authMiddleware(req as AuthRequest, res as Response, next);

    expect(auth.verifyIdToken).toHaveBeenCalledWith('valid-token-xyz');
    expect(req.user).toEqual(mockUser); // 型が安全なのでしっかり格納されているかチェック！
    expect(next).toHaveBeenCalled();    // 次の処理へ進む許可が出たか
    expect(res.status).not.toHaveBeenCalled(); // エラーは出ていないか
  });

  it('🚨 Authorization ヘッダーがそもそも無い場合、一律「404」を返すこと（隠蔽成功）', async () => {
    await authMiddleware(req as AuthRequest, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(404); // 401や403ではなく「404」！
    expect(res.json).toHaveBeenCalledWith({ message: 'Not Found' });
    expect(next).not.toHaveBeenCalled();          // 先には進ませない！
  });

  it('🚨 ヘッダーの形式が Bearer から始まらない場合、一律「404」を返すこと（隠蔽成功）', async () => {
    req.headers!.authorization = 'Basic invalid-format-token';

    await authMiddleware(req as AuthRequest, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(next).not.toHaveBeenCalled();
  });

  it('🚨 トークンが不正、または期限切れの場合、一律「404」を返すこと（隠蔽成功）', async () => {
    req.headers!.authorization = 'Bearer expired-token-123';
    
    // Firebaseマシーンが「エラー（無効なトークン！）」を起こした状態をシミュレート
    vi.mocked(auth.verifyIdToken).mockRejectedValue(new Error('Firebaseの検証エラー'));

    await authMiddleware(req as AuthRequest, res as Response, next);

    expect(auth.verifyIdToken).toHaveBeenCalledWith('expired-token-123');
    expect(res.status).toHaveBeenCalledWith(404); // エラーが起きても隠蔽のために404！
    expect(next).not.toHaveBeenCalled();
  });
});