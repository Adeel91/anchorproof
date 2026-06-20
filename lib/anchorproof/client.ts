import { AnchorProofClient } from '@/packages/sdk/src/client';

console.log('🔍 Environment:', process.env.NODE_ENV);
console.log('🔑 DEMO_API_KEY exists:', !!process.env.DEMO_API_KEY);
console.log('🔑 DEMO_PUBLIC_KEY exists:', !!process.env.DEMO_PUBLIC_KEY);
console.log('🔑 DEMO_PRIVATE_KEY exists:', !!process.env.DEMO_PRIVATE_KEY);
console.log(
  '🔑 DEMO_API_KEY value:',
  process.env.DEMO_API_KEY?.slice(0, 10) + '...'
);

AnchorProofClient.configure({
  apiBaseUrl:
    process.env.NEXT_PUBLIC_API_URL || 'https://anchorproof.vercel.app',
});

export const anchorProofClient = new AnchorProofClient({
  apiKey: process.env.DEMO_API_KEY!,
  publicKey: process.env.DEMO_PUBLIC_KEY!,
  privateKey: process.env.DEMO_PRIVATE_KEY!,
});
