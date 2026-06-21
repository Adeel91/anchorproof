// lib/walrus/store.ts

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

// ⚡ Check if running on Vercel
const IS_VERCEL = process.env.VERCEL === '1';

export async function storeOnWalrus(
  encryptedBlob: string,
  retries: number = 3
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

  // ⚡ If on Vercel, use the proxy route
  if (IS_VERCEL) {
    console.log('⚡ Vercel: Using Walrus proxy for upload');

    try {
      const blobBytes = new TextEncoder().encode(encryptedBlob);
      const blobBase64 = Buffer.from(blobBytes).toString('base64');

      const response = await fetch('/api/walrus/proxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ blob: blobBase64 }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Proxy upload failed: ${response.status} - ${errorText}`
        );
      }

      const result = await response.json();

      // Extract blobId from various response formats
      const blobId =
        result.blobId ||
        result.newlyCreatedBlob?.blobObject?.blobId ||
        result.alreadyCertified?.blobObject?.blobId ||
        result.blobObject?.blobId;

      const suiObjectId =
        result.blobObject?.id ||
        result.newlyCreatedBlob?.blobObject?.id ||
        result.alreadyCertified?.blobObject?.id ||
        'unknown';

      const activeNetwork = process.env.NEXT_PUBLIC_SUI_NETWORK || 'testnet';

      if (!blobId) {
        console.error('Proxy response:', result);
        throw new Error('No blobId returned from proxy');
      }

      console.log(`✅ Vercel proxy upload successful: ${blobId}`);

      return {
        blobId: blobId,
        suiTxHash: suiObjectId !== 'unknown' ? suiObjectId : 'walrus-stored',
        walrusExplorerUrl: `https://walruscan.com/${activeNetwork}/blob/${blobId}`,
        suiExplorerUrl:
          suiObjectId !== 'unknown'
            ? `https://suiscan.xyz/${activeNetwork}/object/${suiObjectId}`
            : '',
        suiObjectId: suiObjectId,
      };
    } catch (error) {
      console.error('Proxy Walrus upload failed:', error);
      throw error;
    }
  }

  // ⚡ Localhost: Use direct Walrus SDK
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`⏱️ [WALRUS] Attempt ${attempt}/${retries}...`);

      const result = await walrusClient.walrus.writeBlob({
        blob: new TextEncoder().encode(encryptedBlob),
        deletable: false,
        epochs: 5,
        signer: serverKeypair,
      });

      const blobId = result.blobId;
      const suiObjectId = result.blobObject?.id || 'unknown';
      const activeNetwork = process.env.NEXT_PUBLIC_SUI_NETWORK || 'testnet';

      const suiTxHash =
        suiObjectId !== 'unknown' ? suiObjectId : 'walrus-stored';

      console.log(`✅ Local Walrus upload successful: ${blobId}`);

      return {
        blobId: blobId,
        suiTxHash: suiTxHash,
        walrusExplorerUrl: `https://walruscan.com/${activeNetwork}/blob/${blobId}`,
        suiExplorerUrl:
          suiObjectId !== 'unknown'
            ? `https://suiscan.xyz/${activeNetwork}/object/${suiObjectId}`
            : '',
        suiObjectId: suiObjectId,
      };
    } catch (error) {
      lastError = error as Error;
      console.error(`⏱️ [WALRUS] Attempt ${attempt} failed:`, error);

      if (attempt < retries) {
        const waitTime = attempt * 2000;
        console.log(`⏱️ [WALRUS] Retrying in ${waitTime}ms...`);
        await new Promise((resolve) => setTimeout(resolve, waitTime));
      }
    }
  }

  console.error('⏱️ [WALRUS] ❌ All attempts failed');
  throw lastError || new Error('Walrus upload failed after all retries');
}
