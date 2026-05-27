'use client';

import React from 'react';
import NextLink from 'next/link';

/**
 * 404 Not Found 共通画面（存在隠蔽リライト時の受け皿）
 * ※Tailwind CSS 仕様
 */
export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-6 py-16 text-center">
      <div className="max-w-md space-y-6">
        {/* 404の巨大グラデーションテキスト */}
        <h1 className="bg-gradient-to-r from-teal-400 to-teal-600 bg-clip-text text-6xl font-extrabold text-transparent">
          404
        </h1>
        
        {/* メインメッセージ */}
        <h2 className="text-2xl font-bold text-gray-800">
          ページが見つかりません
        </h2>
        
        {/* 説明テキスト */}
        <p className="text-gray-500">
          アクセスしようとしたページは削除されたか、URLが変更されたか、あるいは一時的に利用できない可能性があります。
        </p>

        {/* トップへ戻るボタン */}
        <div className="pt-2">
          <NextLink
            href="/"
            className="inline-block rounded-md bg-gradient-to-r from-teal-400 via-teal-500 to-teal-600 px-6 py-3 font-medium text-white shadow-sm transition-all duration-200 hover:from-teal-500 hover:to-teal-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
          >
            トップページへ戻る
          </NextLink>
        </div>
      </div>
    </div>
  );
}