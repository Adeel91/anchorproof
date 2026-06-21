import {
  activeNetwork,
  WALRUS_AGGREGATOR,
  WALRUS_PUBLISHER,
} from '@/lib/walrus/client';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { fromBase64 } from '@mysten/bcs';
import { decodeSuiPrivateKey } from '@mysten/sui/cryptography';

export interface StoreBlobOnWalrusResult {
  blobId: string;
  suiTxHash: string;
  walrusExplorerUrl: string;
  suiExplorerUrl: string;
  suiObjectId: string;
}

export async function storeBlobOnWalrus(
  encryptedBlob: string,
  retries: number = 3
): Promise<StoreBlobOnWalrusResult> {
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

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const blobBytes = new TextEncoder().encode(encryptedBlob);
      const signature = await serverKeypair.sign(blobBytes);
      const url = `${WALRUS_PUBLISHER}/v1/blobs`;
      const publicKey = serverKeypair.getPublicKey().toSuiAddress();

      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/octet-stream',
          'X-Signature': Buffer.from(signature).toString('base64'),
          'X-Public-Key': publicKey,
        },
        body: blobBytes,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();

      const blobId =
        result.blobId ||
        result.newlyCreated?.blobObject?.blobId ||
        result.alreadyCertified?.blobObject?.blobId;

      if (!blobId) {
        throw new Error('No blobId returned from Walrus');
      }

      const suiObjectId =
        result.blobObject?.id ||
        result.newlyCreated?.blobObject?.id ||
        result.alreadyCertified?.blobObject?.id ||
        'unknown';

      return {
        blobId,
        suiTxHash: suiObjectId !== 'unknown' ? suiObjectId : 'walrus-stored',
        walrusExplorerUrl: `https://walruscan.com/${activeNetwork}/blob/${blobId}`,
        suiExplorerUrl:
          suiObjectId !== 'unknown'
            ? `https://suiscan.xyz/${activeNetwork}/object/${suiObjectId}`
            : '',
        suiObjectId,
      };
    } catch (error) {
      lastError = error as Error;

      if (attempt < retries) {
        const waitTime = attempt * 2000;
        await new Promise((resolve) => setTimeout(resolve, waitTime));
      }
    }
  }

  throw lastError || new Error('Walrus upload failed after all retries');
}

export async function fetchBlobFromWalrus(blobId: string): Promise<Uint8Array> {
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
