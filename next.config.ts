import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Tells Turbopack to step aside and let native Node resolution handle these packages
  serverExternalPackages: ['@mysten/walrus-wasm', '@mysten/walrus'],
};

export default nextConfig;
