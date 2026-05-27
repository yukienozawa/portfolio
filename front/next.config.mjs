/** @type {import('next').NextConfig} */
const nextConfig = {
  // 💡 最新Next.jsのルール通り、ルート直下に綺麗に配置しています
  allowedDevOrigins: [process.env.NEXT_PUBLIC_ALLOWED_DEV_ORIGIN || 'localhost:3000'],
};

export default nextConfig;