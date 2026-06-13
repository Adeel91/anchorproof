import { walrusClient } from '@/lib/walrus/client';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { fromBase64 } from '@mysten/bcs';

export interface StoreOnWalrusResult {
  blobId: string;
  suiTxHash: string;
  walrusExplorerUrl: string;
  suiExplorerUrl: string;
}

export async function storeOnWalrus(
  encryptedBlob: string,
  privateKeyBase64: string
): Promise<StoreOnWalrusResult> {
  const privateKeyBytes = fromBase64(privateKeyBase64);
  const keypair = Ed25519Keypair.fromSecretKey(privateKeyBytes);

  const result = await walrusClient.walrus.writeBlob({
    blob: new TextEncoder().encode(encryptedBlob),
    deletable: false,
    epochs: 10,
    signer: keypair,
  });

  let suiTxHash = 'unknown';
  if (result && typeof result === 'object') {
    const rawResult = result as Record<string, unknown>;
    if ('digest' in rawResult && typeof rawResult.digest === 'string') {
      suiTxHash = rawResult.digest;
    } else if (
      'transactionDigest' in rawResult &&
      typeof rawResult.transactionDigest === 'string'
    ) {
      suiTxHash = rawResult.transactionDigest;
    }
  }

  return {
    blobId: result.blobId,
    suiTxHash: suiTxHash,
    walrusExplorerUrl: `https://explorer.walrus.site/blob/${result.blobId}`,
    suiExplorerUrl:
      suiTxHash !== 'unknown'
        ? `https://suiscan.xyz/testnet/tx/${suiTxHash}`
        : '',
  };
}
