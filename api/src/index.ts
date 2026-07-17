// 🚀 Expressサーバーの起動ファイル (エントリーポイント)
import 'dotenv/config'; // ⚠️最重要：他のどのimportよりも先に環境変数を読み込む
import express from 'express';
import cors from 'cors';
import achievementRoutes from './routes/achievementRoutes'; 
import contactRoutes from './routes/contactRoutes';
import inquiryRoutes from './routes/inquiryRoutes';
import userRoutes from './routes/userRoutes';

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
// ⚠️サーバーは一律「2MB」を超えるリクエストは絶対に受け付けないと宣言
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ limit: '2mb', extended: true }));

// 基礎的な動作確認用ルート
app.get('/', (req, res) => {
  res.send('Backend Server is running');
});

// ============================================================
// 🛠️ ルーティングの登録
// ============================================================
// 1. 公開用API群（/api/...）➔ 認証なしで誰でもOK
app.use('/api', achievementRoutes); // GET /api/achievements
app.use('/api', contactRoutes);     // POST /api/contact（新規送信はこちらに一本化）
app.use('/api', inquiryRoutes);     // GET /api/inquiries（管理画面の一覧取得のみ利用）
app.use('/api', userRoutes);        // GET /api/profile, PUT /api/profile

// 2. 管理画面用API群（/api/admin/...）➔ 門番（authMiddleware）で保護
app.use('/api/admin', achievementRoutes); // GET /api/admin/achievements
app.use('/api/admin', inquiryRoutes);     // GET /api/admin/inquiries
app.use('/api/admin', userRoutes);        // GET /api/admin/profile, PUT /api/admin/profile

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});