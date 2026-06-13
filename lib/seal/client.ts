import { SealClient } from '@mysten/seal';
import { suiClient } from '@/lib/walrus/client';

export const SEAL_SYSTEM_PACKAGE_ID =
  '0x011ea3ad0697a221f7a0753f5df7e44ba58639e76fa94d3f76ae3fe4e99356db';

const SEAL_KEY_SERVERS = [
  {
    objectId:
      '0x73d05d62c18d9374e3ea529e8e0ed6161da1a141a94d3f76ae3fe4e99356db75',
    weight: 1,
    url: 'https://seal-key-server-testnet-1.mystenlabs.com',
  },
  {
    objectId:
      '0xf5d14a81a982144ae441cd7d64b09027f116a468bd36e7eca494f750591623c8',
    weight: 1,
    url: 'https://seal-key-server-testnet-2.mystenlabs.com',
  },
];

// ✅ Use 'new' keyword, not .create()
export const sealClient = new SealClient({
  suiClient,
  serverConfigs: SEAL_KEY_SERVERS,
});
