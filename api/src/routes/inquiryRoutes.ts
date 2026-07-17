import { Router } from 'express';
import { inquiryController } from '../controllers/inquiryController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

// 管理画面用：届いたお問い合わせを一覧取得する（門番あり！）
router.get('/inquiries', authMiddleware, inquiryController.getInquiries);

export default router;