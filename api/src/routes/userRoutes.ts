import { Router } from 'express';
import { userController } from '../controllers/userController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

// 1. 一般公開用：トップページが誰の認証もなくプロフィールを読み込むためのAPI（門番なし）
router.get('/profile/public', userController.getPublicProfile);

// 2. 管理画面用：ログイン中の管理者が自分のデータを取得・変更するためのAPI（門番あり！）
router.get('/profile', authMiddleware, userController.getProfile);
router.put('/profile', authMiddleware, userController.updateProfile);

export default router;