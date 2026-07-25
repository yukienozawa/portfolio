// ============================================================
// このファイルの責務：実績（Achievement）に関するルーティング定義のみ
// 公開API（一覧取得）と管理者専用API（詳細取得・新規登録・更新）が混在するため、
// 管理者専用のルートには必ずauthMiddlewareを挟んで保護する
// ============================================================

import { Router } from 'express';
import { achievementController } from '../controllers/achievementController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

/**
 * 1. 実績一覧取得（一般公開API）
 * 認証は不要で、誰でも実績を見ることができます。
 */
router.get('/achievements', achievementController.getAchievements);

// 【MVPスコープ外・未使用】下書き機能（isPublished出し分け）を実装する場合の管理者専用ルート案
// 現状はgetAchievementsが認証有無を見ずに常に同じ結果を返す実装のため、
// 上の公開APIと同じパスで登録するとExpressのルーティング上ここには到達しない。
// 下書き機能を使う場合は、パスを /admin/achievements に分け、
// isPublished:false も含めて返す専用ハンドラーを別途実装すること。
// router.get('/achievements', authMiddleware, achievementController.getAchievements);

/**
 * 2. 特定の実績を1件だけ取得（編集画面の読み込み用・管理者専用API）
 * 編集画面を開いたときに、指定されたID（:id）のデータを1件だけフォームに吸い出します。
 */
router.get('/achievements/:id', authMiddleware, achievementController.getAchievementById);

/**
 * 3. 実績の更新（編集後の保存用・管理者専用API）
 * 編集画面から「変更を保存する」ボタンが押されたときのPUT通信を受け止め、MySQLのデータを上書きします。
 */
router.put('/achievements/:id', authMiddleware, achievementController.updateAchievement);

/**
 * 4. 実績新規登録（管理者専用API）
 * URLの先頭に /admin は付けず、インデックス側で合流させるため '/achievements' とします。
 * 代わりに、コントローラーを呼び出す直前に `authMiddleware` を挟むことで、
 * トークンがない・不正な場合は、手前で一律「404 Not Found」を返してエンドポイントを隠蔽します。
 */
router.post('/achievements', authMiddleware, achievementController.createAchievement);

export default router;