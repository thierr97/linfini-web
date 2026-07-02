import type { NextConfig } from 'next'
const nextConfig: NextConfig = {
  transpilePackages: ['@linfini/db'],
  serverExternalPackages: ['pdfkit', 'fontkit', 'iconv-lite'],
}
export default nextConfig
