// lib/walrus/client.ts
import { SuiJsonRpcClient, getJsonRpcFullnodeUrl } from '@mysten/sui/jsonRpc';
import { walrus } from '@mysten/walrus';

type SupportedNetworks = 'testnet' | 'mainnet';
const activeNetwork = (process.env.NEXT_PUBLIC_SUI_NETWORK ?? 'testnet') as SupportedNetworks;

const suiClient = new SuiJsonRpcClient({
  network: activeNetwork,
  url: getJsonRpcFullnodeUrl(activeNetwork),
});

export { suiClient };
export const walrusClient = suiClient.$extend(walrus());
