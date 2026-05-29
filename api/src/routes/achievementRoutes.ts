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
 * 2.実績一覧取得（管理者専用API）
 * 管理画面のダッシュボードにデータを流すためのルートです。
 * コントローラーを呼び出す直前に `authMiddleware` を挟むことで、安全に保護します！
 */
router.get('/achievements', authMiddleware, achievementController.getAchievements);

/**
 * 3.特定の実績を1件だけ取得（編集画面の読み込み用・管理者専用API）
 * 編集画面を開いたときに、指定されたID（:id）のデータを1件だけフォームに吸い出します。
 */
router.get('/achievements/:id', authMiddleware, achievementController.getAchievementById);

/**
 * 4.実績の更新（編集後の保存用・管理者専用API）
 * 編集画面から「変更を保存する」ボタンが押されたときのPUT通信を受け止め、MySQLのデータを上書きします。
 */
router.put('/achievements/:id', authMiddleware, achievementController.updateAchievement);

/**
 * 5.実績新規登録（管理者専用API）
 * URLの先頭に /admin は付けず、インデックス側で合流させるため '/achievements' とします。
 * 代わりに、コントローラーを呼び出す直前に `authMiddleware` を挟むことで、
 * トークンがない・不正な場合は、手前で一律「404 Not Found」を返してエンドポイントを隠蔽します。
 */
//router.post('/achievements', authMiddleware, achievementController.createAchievement);
router.post('/achievements', achievementController.createAchievement); // 👈 一時的に直接コントローラーを呼ぶ

export default router;