import { Router } from 'express';
import { contactController } from '../controllers/contactController';

const router = Router();

/**
 * 問い合わせ送信API（一般公開API）
 * ユーザーが入力したお名前、メールアドレス、本文を受け取り、DB保存とWebhook通知をトリガーします。
 */
router.post('/contact', contactController.createInquiry);

export default router;