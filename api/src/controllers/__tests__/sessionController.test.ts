// ============================================================
// このファイルの責務：/adminセッション検証コントローラーのテストのみ
// Firebase Admin SDK（auth）はモック化し、
// リクエスト内容に応じたステータスコードの分岐のみを検証する
// ============================================================

import { describe, it, expect, vi, beforeEach } from 'vitest';
import supertest from 'supertest';
import express from 'express';
import sessionRoutes from '../../routes/sessionRoutes';
import { auth } from '../../config/firebase';

// テスト用のExpressアプリをセットアップ
const app = express();
app.use(express.json());
app.use('/api/admin', sessionRoutes);

// Firebase Admin SDKのauthをモック化
vi.mock('../../config/firebase', () => ({
  auth: {
    createSessionCookie: vi.fn(),
    verifySessionCookie: vi.fn(),
  },
}));

describe('Session APIのテスト', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/admin/create-session（ログイン時のセッションCookie作成）', () => {
    it('正しいIDトークンがある場合、セッションCookieが発行されて200が返ること', async () => {
      vi.mocked(auth.createSessionCookie).mockResolvedValue('mocked-session-cookie-jwt');

      const res = await supertest(app)
        .post('/api/admin/create-session')
        .send({ idToken: 'valid-id-token' });

      expect(res.status).toBe(200);
      expect(res.body.sessionCookie).toBe('mocked-session-cookie-jwt');
    });

    it('idTokenが送られてこない場合、400 Bad Requestが返ること', async () => {
      const res = await supertest(app)
        .post('/api/admin/create-session')
        .send({});

      expect(res.status).toBe(400);
    });

    it('Firebase側でセッションCookieの発行に失敗した場合、401 Unauthorizedが返ること', async () => {
      vi.mocked(auth.createSessionCookie).mockRejectedValue(new Error('Firebase発行エラー'));

      const res = await supertest(app)
        .post('/api/admin/create-session')
        .send({ idToken: 'invalid-id-token' });

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/admin/verify-session（/adminアクセス時のセッション検証）', () => {
    it('正しいセッションCookieがある場合、200が返ること', async () => {
      vi.mocked(auth.verifySessionCookie).mockResolvedValue({} as never);

      const res = await supertest(app)
        .get('/api/admin/verify-session')
        .set('Cookie', 'session=valid-session-cookie');

      expect(res.status).toBe(200);
    });

    it('【存在隠蔽の検証】Cookie自体が無い場合、404が返ること', async () => {
      const res = await supertest(app).get('/api/admin/verify-session');

      expect(res.status).toBe(404);
    });

    it('【存在隠蔽の検証】Cookieの中身が不正な場合、404が返ること', async () => {
      vi.mocked(auth.verifySessionCookie).mockRejectedValue(new Error('検証失敗'));

      const res = await supertest(app)
        .get('/api/admin/verify-session')
        .set('Cookie', 'session=invalid-session-cookie');

      expect(res.status).toBe(404);
    });
  });
});