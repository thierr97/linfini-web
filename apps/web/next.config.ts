import type { NextConfig } from 'next'
const nextConfig: NextConfig = {
  transpilePackages: ['@linfini/db'],
  serverExternalPackages: ['pdfkit', 'fontkit', 'iconv-lite'],
  async redirects() {
    return [
      { source: '/tarifs', destination: '/pro#tarifs', permanent: true },
    ]
  },
}
export default nextConfig
