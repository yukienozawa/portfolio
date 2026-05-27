//🛡️ 認可等のミドルウェア (Issue #4で作成済)

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // 💡 【TODO】Phase 2の後半で、本物のFirebaseログイン状態（セッション）の判定に差し替えます
  // 現時点では、動作確認できるようにダミーのフラグにしておきます
  // レビュー確認のため、一時的に false（未認証）に設定
  const isAuthenticated = false; // 管理画面を確認したい時は true、404隠蔽をテストしたい時は false に切り替える

  // 管理画面（/admin）へのアクセスで、かつ未認証の場合
  if (request.nextUrl.pathname.startsWith('/admin') && !isAuthenticated) {
    // ➔ URLはそのまま（/admin のまま）で、中身だけ404ページを表示して存在を隠蔽する！
    return NextResponse.rewrite(new URL('/404', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/admin/:path*',
};