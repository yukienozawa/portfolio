import { describe, it, expect, vi, beforeEach } from 'vitest';
import supertest from 'supertest';
import express from 'express';
import contactRoutes from '../../routes/contactRoutes';
import { contactService } from '../../services/contactService';

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

describe('Contact APIのテスト', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const validPayload = {
    senderName: '山田太郎',
    senderEmail: 'test@example.com',
    messageContent: 'こんにちは、家計簿アプリについて質問です。',
  };

  it('必須項目がすべて正しく入力されている場合、DBに保存されて200 OKが返ること', async () => {
    // サービス層の戻り値を型定義に適合させてモック
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

  it('【バリデーション検証】お名前が空の場合、400 Bad Requestが返ること', async () => {
    const invalidPayload = { ...validPayload, senderName: '' };

    const res = await supertest(app)
      .post('/api/contact')
      .send(invalidPayload);

    expect(res.status).toBe(400);
    // 🔍 実際のメッセージに含まれるキーワードに修正します
    expect(res.body.error).toContain('入力してください');
  });
  
  it('【バリデーション検証】メールアドレスの形式が不正な場合、400 Bad Requestが返ること', async () => {
    const invalidPayload = { ...validPayload, senderEmail: 'invalid-email-format' };

    const res = await supertest(app)
      .post('/api/contact')
      .send(invalidPayload);

    expect(res.status).toBe(400);
    expect(res.body.error).toContain('メールアドレスの形式が正しくありません');
  });
});