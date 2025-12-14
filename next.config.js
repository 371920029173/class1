/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export', // 静态导出，适合Cloudflare Pages
  images: {
    unoptimized: true, // Cloudflare Pages需要
  },
  trailingSlash: true,
  // Cloudflare Pages 兼容性
  experimental: {
    // 确保与Cloudflare兼容
  },
}

module.exports = nextConfig

