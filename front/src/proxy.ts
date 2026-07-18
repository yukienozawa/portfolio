//🛡️ 管理画面（/admin）へのアクセスを監視・保護するルーティングプロキシ

import { NextRequest, NextResponse } from "next/server";

// ============================================================
// ⚠️ 【重要・設計意図】/admin のルーティング保護について
// ============================================================
// [セキュリティ要件]
//   未認証ユーザーが /admin へアクセスした場合、ログイン画面へリダイレクト
//   させてはならない。リダイレクトは /admin の「存在」を暴露するため。
//   代わりに NextResponse.rewrite() で 404 画面を描画し、
//   管理画面の存在自体を完全に隠蔽する。
//
// [認証方式]
//   Firebase が発行するセッションCookie（"session"）を検証する。
//   サーバーサイド（proxy）でCookieの有無を確認し、
//   厳密な検証は /admin/page.tsx 側でも行う。
// ============================================================

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // /admin 配下へのアクセスを監視
  if (pathname.startsWith("/admin")) {
    const sessionCookie = request.cookies.get("session");

    // 未認証の場合：リダイレクトせず 404 を描画して存在を隠蔽
    if (!sessionCookie) {
      const notFoundUrl = request.nextUrl.clone();
      // ⭕ アンダースコアを付けるのがNext.jsの裏ルール！
      notFoundUrl.pathname = "/_not-found";
      //NextResponse.rewrite => URLを変えずに中身だけ404にする
      return NextResponse.rewrite(notFoundUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};