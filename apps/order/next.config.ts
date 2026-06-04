import type { NextConfig } from 'next'
const nextConfig: NextConfig = {
  transpilePackages: ['@linfini/db', '@linfini/notifications'],
}
export default nextConfig
