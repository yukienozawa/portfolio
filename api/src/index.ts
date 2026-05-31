// 🚀 Expressサーバーの起動ファイル (エントリーポイント)
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import achievementRoutes from './routes/achievementRoutes'; 
import inquiryRoutes from './routes/inquiryRoutes';
import userRoutes from './routes/userRoutes';

dotenv.config();

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
app.use('/api', inquiryRoutes);     // POST /api/inquiries (ダブりを削ってここに一本化！)
app.use('/api', userRoutes);        // GET /api/profile, PUT /api/profile

// 2. 管理画面用API群（/api/admin/...）➔ 門番（authMiddleware）で保護
app.use('/api/admin', achievementRoutes); // GET /api/admin/achievements
app.use('/api/admin', inquiryRoutes);     // GET /api/admin/inquiries
app.use('/api/admin', userRoutes);        // GET /api/admin/profile, PUT /api/admin/profile
// ⬆️ 関連するものを近くに並べることで、URLの足し算構造がパッと見て分かるようになります！

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});