import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// 👇 Firebaseの画面からコピーした「firebaseConfig」をここに上書き
const firebaseConfig = {
  apiKey: "AIzaSyDqDN8zvS6QSzhK5N_FNhKz2XWaf3fdz2o",
  authDomain: "yukie-portfolio.firebaseapp.com",
  projectId: "yukie-portfolio",
  storageBucket: "yukie-portfolio.firebasestorage.app",
  messagingSenderId: "92926356323",
  appId: "1:92926356323:web:14b9a2c2ae79b1eb440156",
  measurementId: "G-3EWWFX4CC3"
};


// サーバーサイドとクライアントサイドでの二重初期化を防ぐための安全装置
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// アプリ全体で使い回す「認証（Auth）」の機能を出荷する
export const auth = getAuth(app);