// ============================================================
// このファイルの責務：お問い合わせ機能ON/OFF設定に関するルーティング定義のみ
// 公開API（GET）と管理者専用API（PUT）が混在するため、
// このファイル内でauthMiddlewareの適用有無を使い分けている
// ============================================================

import { Router } from 'express';
import { contactSettingController } from '../controllers/contactSettingController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

// 1. GET /api/contact-setting（公開API：Contactページの表示切り替えに使用）
router.get('/contact-setting', contactSettingController.getSetting);

// 2. PUT /api/admin/contact-setting（管理者専用：ON/OFFを切り替える）
router.put('/contact-setting', authMiddleware, contactSettingController.updateSetting);

export default router;