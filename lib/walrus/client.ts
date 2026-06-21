import { SuiJsonRpcClient, getJsonRpcFullnodeUrl } from '@mysten/sui/jsonRpc';
import { walrus } from '@mysten/walrus';

type SupportedNetworks = 'testnet' | 'mainnet';
const activeNetwork = (process.env.NEXT_PUBLIC_SUI_NETWORK ??
  'testnet') as SupportedNetworks;

const WALRUS_AGGREGATOR =
  activeNetwork === 'testnet'
    ? 'https://aggregator.walrus-testnet.walrus.space'
    : 'https://aggregator.walrus.mainnet.walrus.space';

const WALRUS_PUBLISHER =
  activeNetwork === 'testnet'
    ? 'https://publisher.walrus-testnet.walrus.space'
    : 'https://publisher.walrus.mainnet.walrus.space';

const suiClient = new SuiJsonRpcClient({
  network: activeNetwork,
  url: getJsonRpcFullnodeUrl(activeNetwork),
});

const walrusClient = suiClient.$extend(walrus());

export {
  suiClient,
  walrusClient,
  activeNetwork,
  WALRUS_AGGREGATOR,
  WALRUS_PUBLISHER,
};
