import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Enable service worker registration via headers
  async headers() {
    return [
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
          {
            key: 'Service-Worker-Allowed',
            value: '/',
          },
        ],
      },
    ]
  },
  // Experimental features
  experimental: {
    // serverComponentsExternalPackages moved to top level in Next.js 15
  },
  serverExternalPackages: ['@libsql/client'],
}

export default nextConfig
