import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authMiddleware, AuthRequest } from '../authMiddleware';
import { Response, NextFunction } from 'express';
import { auth } from '../../config/firebase';
import { prisma } from '../../lib/prisma';
import { DecodedIdToken } from 'firebase-admin/auth';

// 🔥 ここがポイント：「本物のFirebase」を見に行かないように身代わり（モック）を作ります
vi.mock('../../config/firebase', () => ({
  auth: {
    verifyIdToken: vi.fn(),
  },
}));

// 🔥 追加：「本物のPrisma（本物のDB）」を見に行かないように身代わりを作ります
// authMiddlewareがrole確認のためにprisma.user.findUnique()を呼ぶため必須
vi.mock('../../lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
  },
}));

describe('authMiddleware (認可ミドルウェアのテスト)', () => {
  let req: Partial<AuthRequest>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = {
      headers: {},
    };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
    next = vi.fn();
    vi.clearAllMocks();
  });

  it('✅ 正常なトークンがあり、かつADMINロールの場合、next() が呼ばれて次の処理へ進むこと', async () => {
    const mockUser = { uid: 'admin-user-123', email: 'admin@example.com' };
    req.headers!.authorization = 'Bearer valid-token-xyz';

    vi.mocked(auth.verifyIdToken).mockResolvedValue(mockUser as DecodedIdToken);

    // 🔥 追加：MySQL側にADMINロールのユーザーが存在する状態を偽装
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: 'admin-user-123',
      email: 'admin@example.com',
      name: 'Admin User',
      role: 'ADMIN',
      avatarUrl: null,
      bio: null,
      githubUrl: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await authMiddleware(req as AuthRequest, res as Response, next);

    expect(auth.verifyIdToken).toHaveBeenCalledWith('valid-token-xyz');
    expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { id: 'admin-user-123' } });
    expect(req.user).toEqual(mockUser);
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  // 🔥 新規追加：ADMINロールでない場合のテスト（今回の認可修正の核心部分）
  it('🚨 認証は成功するが、ADMINロールでない場合、一律「404」を返すこと（隠蔽成功）', async () => {
    const mockUser = { uid: 'general-user-456', email: 'user@example.com' };
    req.headers!.authorization = 'Bearer valid-token-but-not-admin';

    vi.mocked(auth.verifyIdToken).mockResolvedValue(mockUser as DecodedIdToken);

    // 🔥 MySQL側にレコードはあるが、ロールがUSER（ADMINではない）状態を偽装
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: 'general-user-456',
      email: 'user@example.com',
      name: 'General User',
      role: 'USER',
      avatarUrl: null,
      bio: null,
      githubUrl: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await authMiddleware(req as AuthRequest, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Not Found' });
    expect(next).not.toHaveBeenCalled();
  });

  // 🔥 新規追加：MySQL側にレコード自体が存在しない場合のテスト
  it('🚨 認証は成功するが、MySQL側にユーザーレコードが存在しない場合、一律「404」を返すこと', async () => {
    const mockUser = { uid: 'unknown-user-789', email: 'unknown@example.com' };
    req.headers!.authorization = 'Bearer valid-token-unknown-user';

    vi.mocked(auth.verifyIdToken).mockResolvedValue(mockUser as DecodedIdToken);
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

    await authMiddleware(req as AuthRequest, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(next).not.toHaveBeenCalled();
  });

  it('🚨 Authorization ヘッダーがそもそも無い場合、一律「404」を返すこと（隠蔽成功）', async () => {
    await authMiddleware(req as AuthRequest, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Not Found' });
    expect(next).not.toHaveBeenCalled();
  });

  it('🚨 ヘッダーの形式が Bearer から始まらない場合、一律「404」を返すこと（隠蔽成功）', async () => {
    req.headers!.authorization = 'Basic invalid-format-token';

    await authMiddleware(req as AuthRequest, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(next).not.toHaveBeenCalled();
  });

  it('🚨 トークンが不正、または期限切れの場合、一律「404」を返すこと（隠蔽成功）', async () => {
    req.headers!.authorization = 'Bearer expired-token-123';

    vi.mocked(auth.verifyIdToken).mockRejectedValue(new Error('Firebaseの検証エラー'));

    await authMiddleware(req as AuthRequest, res as Response, next);

    expect(auth.verifyIdToken).toHaveBeenCalledWith('expired-token-123');
    expect(res.status).toHaveBeenCalledWith(404);
    expect(next).not.toHaveBeenCalled();
  });
});