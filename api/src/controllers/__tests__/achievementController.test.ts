// ============================================================
// このファイルの責務：実績（Achievement）コントローラーのテストのみ
// achievementService・authMiddlewareはモック化し、
// リクエスト内容に応じたステータスコードの分岐のみを検証する
// ============================================================

import { describe, it, expect, vi, beforeEach } from 'vitest';
import supertest from 'supertest';
import express, { Request, Response, NextFunction } from 'express'; // Expressの正規の型をインポート
import achievementRoutes from '../../routes/achievementRoutes';
import { achievementService } from '../../services/achievementService';

// 1. テスト用のExpressアプリを擬似的にセットアップ
const app = express();
app.use(express.json());
app.use('/api', achievementRoutes);
app.use('/api/admin', achievementRoutes);

// 2. サービス層をモック（ダミー化）する
vi.mock('../../services/achievementService', () => ({
  achievementService: {
    getAllAchievements: vi.fn(),
    createAchievement: vi.fn(),
    updateAchievement: vi.fn(),
  },
}));

// 3. authMiddleware をテスト用にモック（anyを完全に排除し、Expressの型を適用）
vi.mock('../../middlewares/authMiddleware', () => ({
  authMiddleware: (req: Request, res: Response, next: NextFunction) => {
    if (req.headers.authorization === 'Bearer valid-token') {
      // テスト用にユーザー情報を擬似セット（型拡張エラーを避けるためカスタムプロパティではなくヘッダー等で検証するか、今回はnextを通す仕様にします）
      return next();
    }
    // 存在隠蔽のため、未認証時は一律 404 Not Found
    return res.status(404).json({ error: 'Not Found' });
  },
}));

describe('Achievement APIのテスト', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/achievements (実績一覧取得)', () => {
    it('最新順に並んだ実績リストをステータス200で返却すること', async () => {
      const mockData = [
        {
          id: '1',
          title: 'テスト用実績',
          description: 'React開発',
          imageUrl: 'base64...',
          category: 'WEB_APP',
          effortPoint: null,
          siteUrl: null,
          githubUrl: null,
          techStack: null,
          isPublished: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      vi.mocked(achievementService.getAllAchievements).mockResolvedValue(mockData);

      const res = await supertest(app).get('/api/achievements');

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0].title).toBe('テスト用実績');
    });

    it('サービス層でエラーが発生した場合、500が返ること', async () => {
      vi.mocked(achievementService.getAllAchievements).mockRejectedValue(new Error('DB接続エラー'));

      const res = await supertest(app).get('/api/achievements');

      expect(res.status).toBe(500);
    });
  });

  describe('GET /api/admin/achievements/:id (実績1件取得)', () => {
    const mockAchievement = {
      id: 'abc-123',
      title: 'テスト用実績',
      description: 'テスト用の説明文です',
      imageUrl: 'base64...',
      category: 'WEB_APP',
      effortPoint: null,
      siteUrl: null,
      githubUrl: null,
      techStack: null,
      isPublished: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('存在するIDの場合、フロント向けに整形されたデータと200が返ること', async () => {
      vi.mocked(achievementService.getAllAchievements).mockResolvedValue([mockAchievement]);

      const res = await supertest(app)
        .get('/api/admin/achievements/abc-123')
        .set('Authorization', 'Bearer valid-token');

      expect(res.status).toBe(200);
      expect(res.body.id).toBe('abc-123');
      expect(res.body.title).toBe('テスト用実績');
    });

    it('存在しないIDの場合、404が返ること', async () => {
      vi.mocked(achievementService.getAllAchievements).mockResolvedValue([mockAchievement]);

      const res = await supertest(app)
        .get('/api/admin/achievements/not-exist-id')
        .set('Authorization', 'Bearer valid-token');

      expect(res.status).toBe(404);
    });

    it('【存在隠蔽の検証】認証トークンが無い場合、404が返ること', async () => {
      const res = await supertest(app).get('/api/admin/achievements/abc-123');

      expect(res.status).toBe(404);
    });

    it('サービス層でエラーが発生した場合、500が返ること', async () => {
      vi.mocked(achievementService.getAllAchievements).mockRejectedValue(new Error('DB接続エラー'));

      const res = await supertest(app)
        .get('/api/admin/achievements/abc-123')
        .set('Authorization', 'Bearer valid-token');

      expect(res.status).toBe(500);
    });
  });

  describe('PUT /api/admin/achievements/:id (実績更新)', () => {
    const validPayload = {
      achievementTitle: '更新後のテスト用実績',
      description: '更新後の説明文です',
      imageData: 'data:image/png;base64...',
    };

    it('正しい認証トークンがある場合、更新されて200が返ること', async () => {
      vi.mocked(achievementService.updateAchievement).mockResolvedValue({
        id: 'abc-123',
        title: '更新後のテスト用実績',
        description: '更新後の説明文です',
        imageUrl: 'data:image/png;base64...',
        category: 'WEB_APP',
        effortPoint: null,
        siteUrl: null,
        githubUrl: null,
        techStack: null,
        isPublished: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const res = await supertest(app)
        .put('/api/admin/achievements/abc-123')
        .set('Authorization', 'Bearer valid-token')
        .send(validPayload);

      expect(res.status).toBe(200);
      expect(achievementService.updateAchievement).toHaveBeenCalledWith('abc-123', {
        achievementTitle: '更新後のテスト用実績',
        description: '更新後の説明文です',
        imageData: 'data:image/png;base64...',
      });
    });

    it('タイトルが空の場合、400 Bad Requestが返ること', async () => {
      const res = await supertest(app)
        .put('/api/admin/achievements/abc-123')
        .set('Authorization', 'Bearer valid-token')
        .send({ ...validPayload, achievementTitle: '' });

      expect(res.status).toBe(400);
    });

    it('【存在隠蔽の検証】認証トークンが無い場合、404が返ること', async () => {
      const res = await supertest(app)
        .put('/api/admin/achievements/abc-123')
        .send(validPayload);

      expect(res.status).toBe(404);
    });

    it('サービス層でエラーが発生した場合、500が返ること', async () => {
      vi.mocked(achievementService.updateAchievement).mockRejectedValue(new Error('DB接続エラー'));

      const res = await supertest(app)
        .put('/api/admin/achievements/abc-123')
        .set('Authorization', 'Bearer valid-token')
        .send(validPayload);

      expect(res.status).toBe(500);
    });
  });

  describe('POST /api/admin/achievements (実績新規登録)', () => {
    const validPayload = {
      achievementTitle: 'テスト用実績',
      description: '説明文',
      imageData: 'data:image/png;base64...',
    };

    it('正しい認証トークンがある場合、データが保存されて201が返ること', async () => {
      vi.mocked(achievementService.createAchievement).mockResolvedValue({
        id: '2',
        title: 'テスト用実績',
        description: '説明文',
        imageUrl: 'data:image/png;base64...',
        category: 'WEB_APP',
        effortPoint: null,
        siteUrl: null,
        githubUrl: null,
        techStack: null,
        isPublished: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const res = await supertest(app)
        .post('/api/admin/achievements')
        .set('Authorization', 'Bearer valid-token')
        .send(validPayload);

      expect(res.status).toBe(201);
      expect(res.body.title).toBe('テスト用実績');
    });

    it('【存在隠蔽の検証】トークンが無い、または不正な場合、401や403ではなく「404」が返ること', async () => {
      const res = await supertest(app)
        .post('/api/admin/achievements')
        .send(validPayload);

      // 存在隠蔽（セキュリティガード）の検証
      expect(res.status).toBe(404);
    });

    it('サービス層でエラーが発生した場合、500が返ること', async () => {
      vi.mocked(achievementService.createAchievement).mockRejectedValue(new Error('DB接続エラー'));

      const res = await supertest(app)
        .post('/api/admin/achievements')
        .set('Authorization', 'Bearer valid-token')
        .send(validPayload);

      expect(res.status).toBe(500);
    });

    it('タイトルが空の場合、400 Bad Requestが返ること', async () => {
      const res = await supertest(app)
        .post('/api/admin/achievements')
        .set('Authorization', 'Bearer valid-token')
        .send({ ...validPayload, achievementTitle: '' });

      expect(res.status).toBe(400);
    });
  });
});