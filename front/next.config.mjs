/** @type {import('next').NextConfig} */
const nextConfig = {
  devIndicators: false,

  allowedDevOrigins: [process.env.NEXT_PUBLIC_ALLOWED_DEV_ORIGIN || 'localhost:3000'],

  // 👥 将来的に外部URL（GitHub等）の画像を <Image /> タグで表示する場合に備えた許可設定
  // 現在はプロジェクト内のローカル画像（/images/profile.jpg 等）を使用しているため必須ではないが、
  // 外部URLに戻す可能性を考慮し、非推奨の domains ではなく remotePatterns で維持する
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'github.com',
      },
    ],
  },

  // 🔌 3000番に来た通信を、3001番のExpressに丸投げする中継設定
  async rewrites() {
    return [
      {
        source: '/api/admin/:path*',
        destination: 'http://localhost:3001/api/admin/:path*',
      },
      {
        source: '/api/:path*',
        destination: 'http://localhost:3001/api/:path*',
      },
    ];
  },
};

export default nextConfig;