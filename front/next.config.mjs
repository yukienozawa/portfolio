/** @type {import('next').NextConfig} */
const nextConfig = {
  devIndicators: false,

  allowedDevOrigins: [process.env.NEXT_PUBLIC_ALLOWED_DEV_ORIGIN || 'localhost:3000'],

  // 👥 外部のサイト（GitHub）の画像を <Image /> タグで表示するための安全許可設定
  images: {
    domains: ['github.com'],
  },

  // 🔌 3000番に来た通信を、3001番のExpressに丸投げする中継設定
  async rewrites() {
    return [
      {
        // 👈 【超重要】/api/admin/... に来た通信を、3001番の Express側の /api/admin/... にそのまま転送する設定
        source: '/api/admin/:path*',
        destination: 'http://localhost:3001/api/admin/:path*',
      },
      {
        // 👈 一般公開用の /api/... も今まで通り3001番に転送
        source: '/api/:path*',
        destination: 'http://localhost:3001/api/:path*',
      },
    ];
  },
};

export default nextConfig;