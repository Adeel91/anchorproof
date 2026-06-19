import { SealClient } from '@mysten/seal';
import { suiClient } from '@/lib/walrus/client';
import { SUI_PACKAGE_ID } from '../sui/contract';

const SEAL_KEY_SERVERS = [
  {
    objectId: process.env.SEAL_KEY_SERVER_1_ID!,
    weight: 1,
  },
  {
    objectId: process.env.SEAL_KEY_SERVER_2_ID!,
    weight: 1,
  },
];

export const sealClient = new SealClient({
  suiClient,
  serverConfigs: SEAL_KEY_SERVERS,
  verifyKeyServers: false,
});

export const SEAL_SYSTEM_PACKAGE_ID = SUI_PACKAGE_ID;
