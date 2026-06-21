import { AnchorProofClient } from '@/packages/sdk/src/client';

const apiKey = process.env.DEMO_API_KEY || 'demo_public_key_12345';
const publicKey = process.env.DEMO_PUBLIC_KEY || 'demo_public_key_12345';
const privateKey = process.env.DEMO_PRIVATE_KEY || 'demo_private_key';

console.log('🔍 Environment:', process.env.NODE_ENV);
console.log('🔑 DEMO_API_KEY:', apiKey);
console.log('🔑 DEMO_PUBLIC_KEY:', publicKey);
console.log('🔑 DEMO_PRIVATE_KEY:', privateKey.slice(0, 5) + '...');

AnchorProofClient.configure({
  apiBaseUrl:
    process.env.NEXT_PUBLIC_API_URL || 'https://anchorproof.vercel.app',
});

export const anchorProofClient = new AnchorProofClient({
  apiKey,
  publicKey,
  privateKey,
});
