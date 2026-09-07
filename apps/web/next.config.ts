import path from 'node:path';
import { loadEnvConfig } from '@next/env';
import type { NextConfig } from 'next';

const webDir = process.cwd();
const monorepoRoot = path.join(webDir, '..');

// Load monorepo root .env* so a single root .env works for `pnpm dev:web`.
loadEnvConfig(monorepoRoot);
loadEnvConfig(webDir);

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  output: process.env.NEXT_OUTPUT === 'standalone' ? 'standalone' : undefined,
  experimental: {
    serverActions: {
      // Featured images up to 5MB; keep headroom for form fields.
      bodySizeLimit: '8mb',
    },
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
      { protocol: 'http', hostname: '**' },
    ],
  },
  async rewrites() {
    const apiBase = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';
    const origin = apiBase.replace(/\/api\/?$/, '');
    return [
      {
        source: '/uploads/blog/:path*',
        destination: `${origin}/uploads/blog/:path*`,
      },
    ];
  },
};

export default nextConfig;
