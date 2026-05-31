import { Router } from 'express';
import { inquiryController } from '../controllers/inquiryController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

// 一般公開用：フォームからの送信を受け付ける（門番なし）
router.post('/inquiries', inquiryController.createInquiry);

// 管理画面用：届いたお問い合わせを一覧取得する（門番あり！）
router.get('/inquiries', authMiddleware, inquiryController.getInquiries);

export default router;