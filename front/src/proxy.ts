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
//   Firebase が発行するセッションCookie（"session"）の「存在」だけでなく、
//   api/側の Firebase Admin SDK で「中身の正当性」も検証する。
//   （Cookie名が一致するだけの偽装アクセスを防ぐため）
// ============================================================

const API_INTERNAL_URL = process.env.API_INTERNAL_URL || "http://localhost:3001";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // /admin 配下へのアクセスを監視
  if (pathname.startsWith("/admin")) {
    const sessionCookie = request.cookies.get("session");
    let isVerified = false;

    if (sessionCookie) {
      try {
        // api側の検証エンドポイントにCookieを転送し、中身の正当性を確認する
        const verifyRes = await fetch(`${API_INTERNAL_URL}/api/admin/verify-session`, {
          headers: { Cookie: `session=${sessionCookie.value}` },
          cache: "no-store",
        });
        isVerified = verifyRes.ok;
      } catch (error) {
        console.error("🔒 セッション検証APIへの接続に失敗:", error);
        // フェイルクローズ：API呼び出しに失敗した場合も未認証扱いとする
      }
    }

    // 未検証の場合：リダイレクトせず 404 を描画して存在を隠蔽
    if (!isVerified) {
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