// 管理者専用のログイン画面コンポーネント（Firebase Authentication連携）
'use client';

import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { FirebaseError } from 'firebase/app';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie'; // 💡 Cookieを操作する道具をインポートしました！

export default function AdminLoginPage() {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (email !== 'yukien0313@gmail.com') {
      setError('管理者権限のないアカウントです。');
      setLoading(false);
      return;
    }

    try {
      // 🚀 Firebaseの認証を実行
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 💡 通行手形（IDトークン）を取得
      const idToken = await user.getIdToken();

      // 💡 現在のURLが「localhost」のときは secure を false に、本番（HTTPS）のときは true に自動で切り替えます
      const isSecure = window.location.hostname !== 'localhost';
      // 💡 ミドルウェアがチェックしている「session」という名前でCookieに保存します（有効期限1日）
      Cookies.set('session', idToken, { expires: 1, secure: isSecure, sameSite: 'strict' });

      // ✨ 通行手形を持った状態で、満を持して管理画面へ突入！
      router.push('/admin');
    } catch (err) {
      if (err instanceof FirebaseError) {
        console.error('Firebase Auth Error:', err.code, err.message);
        setError('ログインに失敗しました。メールアドレスまたはパスワードが正しくありません。');
      } else {
        console.error('Unknown Error:', err);
        setError('予期せぬエラーが発生しました。');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-xl shadow-md">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            管理者ログイン
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            ポートフォリオ管理画面（裏口）
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          {error && (
            <div className="rounded-md bg-red-50 p-4 text-sm text-red-700 font-medium">
              {error}
            </div>
          )}
          
          <div className="-space-y-px rounded-md shadow-sm">
            <div>
              <label htmlFor="email-address" className="sr-only">メールアドレス</label>
              <input
                id="email-address"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                className="relative block w-full rounded-t-md border-0 py-2.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                placeholder="yukien0313@gmail.com"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">パスワード</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                className="relative block w-full rounded-b-md border-0 py-2.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                placeholder="パスワード"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative flex w-full justify-center rounded-md bg-indigo-600 py-2.5 px-3 text-sm font-semibold text-white hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:bg-indigo-400"
            >
              {loading ? 'ログイン中...' : 'ログイン'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}