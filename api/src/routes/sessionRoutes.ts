// ============================================================
// このファイルの責務：/admin配下のセッションCookie検証に関するルーティング定義のみ
// 既存のBearerトークン方式（authMiddleware）とは異なる認証方式のため、
// 意図的にauthMiddlewareを通さない構成にしている
// ============================================================

import { Router } from 'express';
import { createSession, verifySession } from '../controllers/sessionController';

const router = Router();

// POST /api/admin/create-session（ログイン時：IDトークン→セッションCookie変換）
router.post('/create-session', createSession);

// GET /api/admin/verify-session（/adminアクセス時：セッションCookie検証）
router.get('/verify-session', verifySession);

export default router;