// 🚀 Expressサーバーの起動ファイル (エントリーポイント)
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import achievementRoutes from './routes/achievementRoutes'; 
import contactRoutes from './routes/contactRoutes';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// 基礎的な動作確認用ルート
app.get('/', (req, res) => {
  res.send('Backend Server is running');
});

// 🛠️ ルーティングの登録（★追加）
// 1. 公開用API群（/api/achievements など）
app.use('/api', achievementRoutes);
app.use('/api', contactRoutes); // 問い合わせAPIのルートを追加

// 2. 管理画面用API群（/api/admin/achievements など）
// ※router側で authMiddleware を挟んでいるため、未認証ならここで404を返して存在を隠蔽します
app.use('/api/admin', achievementRoutes);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});