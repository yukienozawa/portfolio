import { Router } from 'express';
import { achievementController } from '../controllers/achievementController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

/**
 * 1. 実績一覧取得（一般公開API）
 * 認証は不要で、誰でも実績を見ることができます。
 */
router.get('/achievements', achievementController.getAchievements);

/**
 * 2. 実績新規登録（管理者専用API）
 * URLの先頭に /admin は付けず、インデックス側で合流させるため '/achievements' とします。
 * 代わりに、コントローラーを呼び出す直前に `authMiddleware` を挟むことで、
 * トークンがない・不正な場合は、手前で一律「404 Not Found」を返してエンドポイントを隠蔽します。
 */
router.post('/achievements', authMiddleware, achievementController.createAchievement);

export default router;