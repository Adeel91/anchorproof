import { AnchorProofClient } from '@/packages/sdk/src/client';

console.log('🔑 API Key loaded:', !!process.env.DEMO_API_KEY);

AnchorProofClient.configure({
  apiBaseUrl:
    process.env.NEXT_PUBLIC_API_URL || 'https://anchorproof.vercel.app',
});

export const anchorProofClient = new AnchorProofClient({
  apiKey: process.env.DEMO_API_KEY!,
  publicKey: process.env.DEMO_PUBLIC_KEY!,
  privateKey: process.env.DEMO_PRIVATE_KEY!,
});
