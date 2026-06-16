import { walrusClient } from '@/lib/walrus/client';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { fromBase64 } from '@mysten/bcs';
import { decodeSuiPrivateKey } from '@mysten/sui/cryptography';

export interface StoreOnWalrusResult {
  blobId: string;
  suiTxHash: string;
  walrusExplorerUrl: string;
  suiExplorerUrl: string;
  suiObjectId: string;
}

export async function storeOnWalrus(
  encryptedBlob: string
): Promise<StoreOnWalrusResult> {
  const serverKeyBase64 = process.env.DEDICATED_WALLET_PRIVATE_KEY;
  if (!serverKeyBase64) {
    throw new Error(
      'Walrus Upload Engine Error: Missing DEDICATED_WALLET_PRIVATE_KEY'
    );
  }

  let privateKeyBytes: Uint8Array;
  if (serverKeyBase64.startsWith('suiprivkey')) {
    const decoded = decodeSuiPrivateKey(serverKeyBase64);
    privateKeyBytes = decoded.secretKey;
  } else {
    privateKeyBytes = fromBase64(serverKeyBase64);
  }

  const serverKeypair = Ed25519Keypair.fromSecretKey(privateKeyBytes);
  console.log(
    `📡 Sending payload to Walrus via dedicated server identity: ${serverKeypair.getPublicKey().toSuiAddress()}`
  );

  const result = await walrusClient.walrus.writeBlob({
    blob: new TextEncoder().encode(encryptedBlob),
    deletable: false,
    epochs: 10,
    signer: serverKeypair,
  });

  const blobId = result.blobId;
  const suiObjectId = result.blobObject?.id || 'unknown';
  const activeNetwork = process.env.NEXT_PUBLIC_SUI_NETWORK || 'testnet';

  return {
    blobId: blobId,
    suiTxHash: 'walrus-stored',
    walrusExplorerUrl: `https://walruscan.com/${activeNetwork}/blob/${blobId}`,
    suiExplorerUrl:
      suiObjectId !== 'unknown'
        ? `https://suiscan.xyz/${activeNetwork}/object/${suiObjectId}`
        : '',
    suiObjectId: suiObjectId,
  };
}
