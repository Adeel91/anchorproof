import { WALRUS_PUBLISHER } from '@/lib/walrus/client';
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
  encryptedBlob: string,
  retries: number = 3
): Promise<StoreOnWalrusResult> {
  console.log('⏱️ [WALRUS] 🚀 Starting Walrus upload...');
  console.log(`⏱️ [WALRUS] Blob size: ${encryptedBlob.length} bytes`);
  console.log(`⏱️ [WALRUS] Max retries: ${retries}`);

  const serverKeyBase64 = process.env.DEDICATED_WALLET_PRIVATE_KEY;
  if (!serverKeyBase64) {
    console.error('❌ [WALRUS] Missing DEDICATED_WALLET_PRIVATE_KEY');
    throw new Error(
      'Walrus Upload Engine Error: Missing DEDICATED_WALLET_PRIVATE_KEY'
    );
  }

  console.log(
    `⏱️ [WALRUS] Private key exists, length: ${serverKeyBase64.length}`
  );

  let privateKeyBytes: Uint8Array;
  if (serverKeyBase64.startsWith('suiprivkey')) {
    console.log('⏱️ [WALRUS] Decoding suiprivkey format...');
    const decoded = decodeSuiPrivateKey(serverKeyBase64);
    privateKeyBytes = decoded.secretKey;
  } else {
    console.log('⏱️ [WALRUS] Decoding base64 format...');
    privateKeyBytes = fromBase64(serverKeyBase64);
  }

  const serverKeypair = Ed25519Keypair.fromSecretKey(privateKeyBytes);
  const activeNetwork = process.env.NEXT_PUBLIC_SUI_NETWORK || 'testnet';

  console.log(`⏱️ [WALRUS] Network: ${activeNetwork}`);
  console.log(`⏱️ [WALRUS] Publisher URL: ${WALRUS_PUBLISHER}`);

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`⏱️ [WALRUS] 🔄 Attempt ${attempt}/${retries}...`);
      const attemptStart = Date.now();

      // Convert blob to bytes
      const blobBytes = new TextEncoder().encode(encryptedBlob);
      console.log(`⏱️ [WALRUS] Blob bytes size: ${blobBytes.length} bytes`);

      // Sign the blob
      console.log('⏱️ [WALRUS] Signing blob...');
      const signature = await serverKeypair.sign(blobBytes);
      console.log(`⏱️ [WALRUS] Signature generated: ${signature.length} bytes`);

      // Use direct HTTP upload with PUBLISHER
      const url = `${WALRUS_PUBLISHER}/v1/blobs`;
      console.log(`⏱️ [WALRUS] 📤 Uploading to: ${url}`);

      const publicKey = serverKeypair.getPublicKey().toSuiAddress();
      console.log(`⏱️ [WALRUS] Public key: ${publicKey.slice(0, 10)}...`);

      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/octet-stream',
          'X-Signature': Buffer.from(signature).toString('base64'),
          'X-Public-Key': publicKey,
        },
        body: blobBytes,
      });

      const elapsed = Date.now() - attemptStart;
      console.log(
        `⏱️ [WALRUS] Response status: ${response.status} (${elapsed}ms)`
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`⏱️ [WALRUS] ❌ HTTP ${response.status}: ${errorText}`);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      console.log(
        '⏱️ [WALRUS] 📦 Response received:',
        JSON.stringify(result).slice(0, 200) + '...'
      );

      // Extract blobId from response
      const blobId =
        result.blobId ||
        result.newlyCreated?.blobObject?.blobId ||
        result.alreadyCertified?.blobObject?.blobId;

      if (!blobId) {
        console.error('⏱️ [WALRUS] ❌ No blobId in response:', result);
        throw new Error('No blobId returned from Walrus');
      }

      const suiObjectId =
        result.blobObject?.id ||
        result.newlyCreated?.blobObject?.id ||
        result.alreadyCertified?.blobObject?.id ||
        'unknown';

      console.log(`⏱️ [WALRUS] ✅ Upload successful!`);
      console.log(`⏱️ [WALRUS] Blob ID: ${blobId}`);
      console.log(`⏱️ [WALRUS] SUI Object ID: ${suiObjectId}`);
      console.log(`⏱️ [WALRUS] Total time: ${elapsed}ms`);

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
      lastError = error as Error;
      console.error(`⏱️ [WALRUS] ❌ Attempt ${attempt} failed:`, error);

      if (attempt < retries) {
        const waitTime = attempt * 2000;
        console.log(`⏱️ [WALRUS] ⏳ Retrying in ${waitTime}ms...`);
        await new Promise((resolve) => setTimeout(resolve, waitTime));
      }
    }
  }

  console.error('⏱️ [WALRUS] ❌ All attempts failed');
  console.error('⏱️ [WALRUS] Last error:', lastError);
  throw lastError || new Error('Walrus upload failed after all retries');
}
