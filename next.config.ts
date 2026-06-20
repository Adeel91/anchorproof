import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  serverExternalPackages: ['@mysten/walrus-wasm', '@mysten/walrus'],
};

export default nextConfig;
