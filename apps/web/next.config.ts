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
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
      { protocol: 'http', hostname: '**' },
    ],
  },
};

export default nextConfig;
