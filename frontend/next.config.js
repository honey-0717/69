const path = require('path');
const BACKEND_URL = process.env.BACKEND_INTERNAL_URL || process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'https://69-production-8508.up.railway.app';

const nextConfig = {
  turbopack: {
    root: path.resolve(__dirname, '..'),
  },
  images: { unoptimized: true },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${BACKEND_URL}/api/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
