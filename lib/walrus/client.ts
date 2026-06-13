import { SuiJsonRpcClient, getJsonRpcFullnodeUrl } from '@mysten/sui/jsonRpc';
import { walrus } from '@mysten/walrus';

const suiClient = new SuiJsonRpcClient({
  network: 'testnet',
  url: getJsonRpcFullnodeUrl('testnet'),
});

export { suiClient };
export const walrusClient = suiClient.$extend(walrus());
