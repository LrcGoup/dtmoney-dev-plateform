import type { NextConfig } from 'next'

const apiOrigin = process.env.API_PROXY_TARGET ?? 'http://localhost:4017'

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  async rewrites() {
    return [
      {
        source: '/api/v2/:path*',
        destination: `${apiOrigin}/api/v2/:path*`,
      },
      {
        source: '/api/docs/:path*',
        destination: `${apiOrigin}/api/docs/:path*`,
      },
    ]
  },
}

export default nextConfig
