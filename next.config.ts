import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  serverExternalPackages: ['@mysten/walrus-wasm', '@mysten/walrus'],
  output: 'standalone',
  outputFileTracingRoot: path.join(__dirname, './'),
};

export default nextConfig;
