import admin from 'firebase-admin';

// サーバーが再起動したときなどに、二重に初期化されてエラーになるのを防ぐチェック
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        // 環境変数から読み込む際、改行コード（\n）がバグらないように調整しています
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
    console.log('🔥 Firebase Admin SDK の初期化に成功しました！');
  } catch (error) {
    console.error('❌ Firebase Admin SDK の初期化でエラーが発生しました:', error);
  }
}

// 他のファイル（middlewareなど）で認証チェックをするために、auth機能をエクスポート
export const auth = admin.auth();