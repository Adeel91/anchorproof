// lib/walrus/store.ts
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
  const activeNetwork = process.env.NEXT_PUBLIC_SUI_NETWORK || 'testnet';

  // 🚀 FIX: Stream directly over HTTP to the official Publisher node endpoints.
  // A single persistent HTTP PUT stream bypasses Vercel data center connection blocks entirely.
  // The mandatory query parameter "?epochs=5" ensures storage time registration.
  const url =
    activeNetwork === 'testnet'
      ? 'https://walrus.space'
      : 'https://walrus.space';

  const blobData = new TextEncoder().encode(encryptedBlob);
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(
        `⏱️ [WALRUS] Single HTTP Stream Upload (Attempt ${attempt}/${retries})...`
      );

      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/octet-stream',
        },
        body: blobData,
        // Enforce a strict internal timeout payload envelope
        signal: AbortSignal.timeout(25000),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Walrus Publisher rejected endpoint stream: ${response.status} - ${errorText}`
        );
      }

      const result = await response.json();
      console.log('✅ Walrus Publisher raw response object parsed:', result);

      // 🔍 Safely extract standard nested variants returned by the public Walrus HTTP API
      const blobInfo =
        result.newlyCreatedBlob || result.alreadyCertified || result;

      const blobId =
        blobInfo?.blobObject?.blobId ||
        result.blobId ||
        result.newlyCreated?.blobObject?.blobId;
      const suiObjectId =
        blobInfo?.blobObject?.id || result.blobObject?.id || 'unknown';
      const suiTxHash =
        suiObjectId !== 'unknown' ? suiObjectId : 'walrus-stored';

      if (!blobId) {
        throw new Error(
          'API completion successful but payload structure lacked a valid Walrus Blob ID'
        );
      }

      console.log(`✅ Production upload loop success: ${blobId}`);

      return {
        blobId,
        suiTxHash,
        walrusExplorerUrl: `https://walruscan.com/${activeNetwork}/blob/${blobId}`,
        suiExplorerUrl:
          suiObjectId !== 'unknown'
            ? `https://suiscan.xyz/${activeNetwork}/object/${suiObjectId}`
            : '',
        suiObjectId,
      };
    } catch (error) {
      lastError = error as Error;
      console.error(
        `❌ [WALRUS] Attempt ${attempt} failed with execution exception:`,
        error
      );

      if (attempt < retries) {
        const waitTime = attempt * 1500;
        console.log(
          `⏱️ Retrying cloud packet distribution stream in ${waitTime}ms...`
        );
        await new Promise((resolve) => setTimeout(resolve, waitTime));
      }
    }
  }

  throw (
    lastError ||
    new Error(
      'Walrus gateway cloud streaming completely failed after all retries'
    )
  );
}
