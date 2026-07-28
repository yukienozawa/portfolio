// ============================================================
// このファイルの責務：POST /api/contact のコントローラー層テストのみ
// contactService・contactSettingServiceはモック化し、
// バリデーション・メンテナンス判定のロジックのみを検証する
// ============================================================

import { describe, it, expect, vi, beforeEach } from 'vitest';
import supertest from 'supertest';
import express from 'express';
import contactRoutes from '../../routes/contactRoutes';
import { contactService } from '../../services/contactService';
import { contactSettingService } from '../../services/contactSettingService';

// 1. テスト用のExpressアプリをセットアップ
const app = express();
app.use(express.json());
app.use('/api', contactRoutes);

// 2. サービス層のモック化（DB操作や外部Webhook通信をシミュレート）
vi.mock('../../services/contactService', () => ({
  contactService: {
    createInquiry: vi.fn(),
  },
}));

// 3. お問い合わせ設定サービスのモック化（常に受付中の状態を返す）
vi.mock('../../services/contactSettingService', () => ({
  contactSettingService: {
    getSetting: vi.fn(),
  },
}));

describe('Contact APIのテスト', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // デフォルトでは「受付中」の状態としてテストする
    vi.mocked(contactSettingService.getSetting).mockResolvedValue({
      id: 1,
      isEnabled: true,
      updatedAt: new Date(),
    });
  });

  const validPayload = {
    name: '山田太郎',
    email: 'test@example.com',
    message: 'こんにちは、家計簿アプリについて質問です。',
  };

  // 1. 正常系
  it('必須項目がすべて正しく入力されている場合、DBに保存されて201 Createdが返ること', async () => {
    vi.mocked(contactService.createInquiry).mockResolvedValue({
      id: 'inquiry-uuid-123',
      name: '山田太郎',
      email: 'test@example.com',
      message: 'こんにちは、家計簿アプリについて質問です。',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const res = await supertest(app)
      .post('/api/contact')
      .send(validPayload);

    expect(res.status).toBe(201);
    expect(res.body.name).toBe('山田太郎');
    expect(res.body.email).toBe('test@example.com');
  });

  // 2. バリデーション検証
  it('【バリデーション検証】お名前が空の場合、400 Bad Requestが返ること', async () => {
    const invalidPayload = { ...validPayload, name: '' };

    const res = await supertest(app)
      .post('/api/contact')
      .send(invalidPayload);

    expect(res.status).toBe(400);
    expect(res.body.error).toContain('入力してください');
  });

  it('【バリデーション検証】メールアドレスの形式が不正な場合、400 Bad Requestが返ること', async () => {
    const invalidPayload = { ...validPayload, email: 'invalid-email-format' };

    const res = await supertest(app)
      .post('/api/contact')
      .send(invalidPayload);

    expect(res.status).toBe(400);
    expect(res.body.error).toContain('メールアドレスの形式が正しくありません');
  });

  // 3. メンテナンス機能の検証
  it('【メンテナンス検証】お問い合わせ機能がOFFの場合、403 Forbiddenが返ること', async () => {
    vi.mocked(contactSettingService.getSetting).mockResolvedValue({
      id: 1,
      isEnabled: false,
      updatedAt: new Date(),
    });

    const res = await supertest(app)
      .post('/api/contact')
      .send(validPayload);

    expect(res.status).toBe(403);
    expect(res.body.error).toContain('メンテナンス中');
  });

  // 4. サーバーエラー検証
  it('サービス層でエラーが発生した場合、500 Internal Server Errorが返ること', async () => {
    vi.mocked(contactService.createInquiry).mockRejectedValue(new Error('DB接続エラー'));

    const res = await supertest(app)
      .post('/api/contact')
      .send(validPayload);

    expect(res.status).toBe(500);
  });
});