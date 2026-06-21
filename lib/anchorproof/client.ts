import { AnchorProofClient } from '@/packages/sdk/src/client';

export function getAnchorProofClient() {
  AnchorProofClient.configure({
    apiBaseUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  });

  return new AnchorProofClient({
    apiKey: process.env.DEMO_API_KEY!,
    publicKey: process.env.DEMO_PUBLIC_KEY!,
    privateKey: process.env.DEMO_PRIVATE_KEY!,
  });
}
