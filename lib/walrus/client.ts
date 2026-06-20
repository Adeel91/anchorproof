import { SuiJsonRpcClient, getJsonRpcFullnodeUrl } from '@mysten/sui/jsonRpc';
import { walrus } from '@mysten/walrus';

type SupportedNetworks = 'testnet' | 'mainnet';
const activeNetwork = (process.env.NEXT_PUBLIC_SUI_NETWORK ??
  'testnet') as SupportedNetworks;

const suiClient = new SuiJsonRpcClient({
  network: activeNetwork,
  url: getJsonRpcFullnodeUrl(activeNetwork),
});

const walrusClient = suiClient.$extend(walrus());

const WALRUS_AGGREGATOR =
  activeNetwork === 'testnet'
    ? 'https://aggregator.walrus-testnet.walrus.space'
    : 'https://aggregator.walrus.mainnet.walrus.space';

const WALRUS_PUBLISHER =
  activeNetwork === 'testnet'
    ? 'https://publisher.walrus-testnet.walrus.space'
    : 'https://publisher.walrus.mainnet.walrus.space';

export async function fetchBlobDirectly(blobId: string): Promise<Uint8Array> {
  if (!blobId) {
    throw new Error('Blob ID is required');
  }

  const endpoints = [
    `${WALRUS_AGGREGATOR}/v1/blobs/${blobId}`,
    `${WALRUS_AGGREGATOR}/blobs/${blobId}`,
  ];

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint, {
        headers: {
          Accept: 'application/octet-stream',
        },
        signal: AbortSignal.timeout(15000),
      });

      if (response.ok) {
        const arrayBuffer = await response.arrayBuffer();
        if (arrayBuffer.byteLength === 0) {
          continue;
        }
        return new Uint8Array(arrayBuffer);
      }
    } catch (error) {
      console.error(`Error fetching from ${endpoint}:`, error);
    }
  }

  throw new Error(
    'No valid blob metadata could be retrieved from any storage node.'
  );
}

export {
  suiClient,
  walrusClient,
  activeNetwork,
  WALRUS_AGGREGATOR,
  WALRUS_PUBLISHER,
};