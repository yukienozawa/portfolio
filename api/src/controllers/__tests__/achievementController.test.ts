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
          title: '家計簿アプリ',
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
      expect(res.body[0].title).toBe('家計簿アプリ');
    });
  });

  describe('POST /api/admin/achievements (実績新規登録)', () => {
    const validPayload = {
      achievementTitle: '新規実績',
      description: '説明文',
      imageData: 'data:image/png;base64...',
    };

    it('正しい認証トークンがある場合、データが保存されて201が返ること', async () => {
      vi.mocked(achievementService.createAchievement).mockResolvedValue({
        id: '2',
        title: '新規実績',
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
      expect(res.body.title).toBe('新規実績');
    });

    it('【存在隠蔽の検証】トークンが無い、または不正な場合、401や403ではなく「404」が返ること', async () => {
      const res = await supertest(app)
        .post('/api/admin/achievements')
        .send(validPayload);

      // 存在隠蔽（セキュリティガード）の検証
      expect(res.status).toBe(404);
    });
  });
});