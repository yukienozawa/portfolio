import { Router } from 'express';
import { createSession, verifySession } from '../controllers/sessionController';

const router = Router();

// POST /api/admin/create-session（ログイン時：IDトークン→セッションCookie変換）
router.post('/create-session', createSession);

// GET /api/admin/verify-session（/adminアクセス時：セッションCookie検証）
router.get('/verify-session', verifySession);

export default router;