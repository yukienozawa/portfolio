// ============================================================
// このファイルの責務：お問い合わせ機能ON/OFF設定コントローラーのテストのみ
// contactSettingServiceはモック化し、
// リクエスト内容に応じたステータスコードの分岐のみを検証する
// ============================================================

import { describe, it, expect, vi, beforeEach } from 'vitest';
import supertest from 'supertest';
import express from 'express';
import contactSettingRoutes from '../../routes/contactSettingRoutes';
import { contactSettingService } from '../../services/contactSettingService';

// テスト用のExpressアプリをセットアップ
const app = express();
app.use(express.json());
app.use('/api', contactSettingRoutes);
app.use('/api/admin', contactSettingRoutes);

// サービス層のモック化
vi.mock('../../services/contactSettingService', () => ({
  contactSettingService: {
    getSetting: vi.fn(),
    updateSetting: vi.fn(),
  },
}));

// authMiddlewareをテスト用にモック（sessionControllerのテストとは無関係な既存の認可方式）
vi.mock('../../middlewares/authMiddleware', () => ({
  authMiddleware: (req: import('express').Request, res: import('express').Response, next: import('express').NextFunction) => {
    if (req.headers.authorization === 'Bearer valid-token') {
      return next();
    }
    return res.status(404).json({ error: 'Not Found' });
  },
}));

describe('ContactSetting APIのテスト', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/contact-setting（公開API：現在の受付状態を取得）', () => {
    it('設定が取得できた場合、isEnabledとともに200が返ること', async () => {
      vi.mocked(contactSettingService.getSetting).mockResolvedValue({
        id: 1,
        isEnabled: true,
        updatedAt: new Date(),
      });

      const res = await supertest(app).get('/api/contact-setting');

      expect(res.status).toBe(200);
      expect(res.body.isEnabled).toBe(true);
    });

    it('サービス層でエラーが発生した場合、500が返ること', async () => {
      vi.mocked(contactSettingService.getSetting).mockRejectedValue(new Error('DB接続エラー'));

      const res = await supertest(app).get('/api/contact-setting');

      expect(res.status).toBe(500);
    });
  });

  describe('PUT /api/admin/contact-setting（管理者専用：ON/OFFを切り替える）', () => {
    it('正しいisEnabledが送られてきた場合、更新されて200が返ること', async () => {
      vi.mocked(contactSettingService.updateSetting).mockResolvedValue({
        id: 1,
        isEnabled: false,
        updatedAt: new Date(),
      });

      const res = await supertest(app)
        .put('/api/admin/contact-setting')
        .set('Authorization', 'Bearer valid-token')
        .send({ isEnabled: false });

      expect(res.status).toBe(200);
      expect(res.body.isEnabled).toBe(false);
    });

    it('isEnabledがboolean型でない場合、400 Bad Requestが返ること', async () => {
      const res = await supertest(app)
        .put('/api/admin/contact-setting')
        .set('Authorization', 'Bearer valid-token')
        .send({ isEnabled: 'yes' });

      expect(res.status).toBe(400);
    });

    it('【存在隠蔽の検証】認証トークンが無い場合、404が返ること', async () => {
      const res = await supertest(app)
        .put('/api/admin/contact-setting')
        .send({ isEnabled: false });

      expect(res.status).toBe(404);
    });

    it('サービス層でエラーが発生した場合、500が返ること', async () => {
      vi.mocked(contactSettingService.updateSetting).mockRejectedValue(new Error('DB接続エラー'));

      const res = await supertest(app)
        .put('/api/admin/contact-setting')
        .set('Authorization', 'Bearer valid-token')
        .send({ isEnabled: true });

      expect(res.status).toBe(500);
    });
  });
});