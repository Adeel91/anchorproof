import { walrusClient } from '@/lib/walrus/client';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { fromBase64 } from '@mysten/bcs';

export interface StoreOnWalrusResult {
  blobId: string;
  walrusExplorerUrl: string;
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

  return {
    blobId: result.blobId,
    walrusExplorerUrl: `https://explorer.walrus.site/blob/${result.blobId}`,
  };
}
