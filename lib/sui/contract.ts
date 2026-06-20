import { Transaction } from '@mysten/sui/transactions';
import { suiClient } from '@/lib/walrus/client';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { fromBase64 } from '@mysten/bcs';
import { decodeSuiPrivateKey } from '@mysten/sui/cryptography';
import { prisma } from '@/lib/prisma';

export const SUI_PACKAGE_ID = process.env.SUI_PACKAGE_ID!;
export const SUI_LEGAL_REGISTRY_ID = process.env.SUI_LEGAL_REGISTRY_ID!;
export const SUI_CLOCK_ID = process.env.SUI_CLOCK_OBJECT_ID!;

interface RecordOnChainParams {
  blobId: string;
  conversationId: string;
  contentHash: string;
  suiTxHash: string;
  signature: string;
  tenantAddress?: string;
}

interface EventData {
  count?: number;
  [key: string]: unknown;
}

function getSigner(): Ed25519Keypair {
  const privateKeyBase64 = process.env.DEDICATED_WALLET_PRIVATE_KEY;
  if (!privateKeyBase64) {
    throw new Error(
      'Missing DEDICATED_WALLET_PRIVATE_KEY for signing transactions'
    );
  }

  let privateKeyBytes: Uint8Array;
  if (privateKeyBase64.startsWith('suiprivkey')) {
    const decoded = decodeSuiPrivateKey(privateKeyBase64);
    privateKeyBytes = decoded.secretKey;
  } else {
    privateKeyBytes = fromBase64(privateKeyBase64);
  }

  return Ed25519Keypair.fromSecretKey(privateKeyBytes);
}

// ⚡ OPTIMIZED: Async version that updates metadata
export async function recordOnChain(params: RecordOnChainParams) {
  const { blobId, conversationId, contentHash, suiTxHash, signature } = params;

  try {
    const contentHashBytes = Buffer.from(contentHash, 'hex');
    const signatureBytes = Buffer.from(signature, 'base64');
    const suiTxHashBytes = Buffer.from(
      suiTxHash.startsWith('0x') ? suiTxHash.slice(2) : suiTxHash,
      'hex'
    );

    const tx = new Transaction();
    const signer = getSigner();

    tx.moveCall({
      target: `${SUI_PACKAGE_ID}::anchorproof::verify_conversation`,
      arguments: [
        tx.object(SUI_LEGAL_REGISTRY_ID),
        tx.object(SUI_CLOCK_ID),
        tx.pure.string(blobId),
        tx.pure.string(conversationId),
        tx.pure.vector('u8', contentHashBytes),
        tx.pure.vector('u8', suiTxHashBytes),
        tx.pure.vector('u8', signatureBytes),
      ],
    });

    // ⚡ Use WaitForEffectsCert for faster execution
    const result = await suiClient.signAndExecuteTransaction({
      transaction: tx,
      signer: signer,
      options: {
        showEffects: true,
        showEvents: true,
      },
      requestType: 'WaitForEffectsCert',
    });

    const contractTxHash = result.digest || 'unknown';

    // ⚡ Update verification with contractTxHash in metadata
    await prisma.verification.updateMany({
      where: { blobId },
      data: {
        metadata: {
          contractTxHash: contractTxHash,
          suiStatus: 'verified',
          verifiedAt: new Date().toISOString(),
        },
      },
    });

    return {
      ...result,
      contractTxHash,
    };
  } catch (error) {
    console.error('On-chain recording failed:', error);
    
    // ⚡ Mark as failed in metadata
    try {
      await prisma.verification.updateMany({
        where: { blobId },
        data: {
          metadata: {
            suiStatus: 'failed',
            error: error instanceof Error ? error.message : 'Unknown error',
          },
        },
      });
    } catch (updateError) {
      console.error('Failed to update verification status:', updateError);
    }
    
    throw error;
  }
}

export async function sealApproveOnChain(
  blobId: string,
  viewer: string
): Promise<boolean> {
  try {
    const tx = new Transaction();
    const signer = getSigner();

    tx.moveCall({
      target: `${SUI_PACKAGE_ID}::anchorproof::seal_approve`,
      arguments: [
        tx.pure.vector('u8', Buffer.from(blobId)),
        tx.pure.address(viewer),
        tx.object(SUI_LEGAL_REGISTRY_ID),
      ],
    });

    const result = await suiClient.signAndExecuteTransaction({
      transaction: tx,
      signer: signer,
      options: {
        showEffects: true,
      },
      requestType: 'WaitForEffectsCert',
    });

    return result.effects?.status?.status === 'success';
  } catch (error) {
    console.error('SEAL approval failed:', error);
    return false;
  }
}

export async function isVerifiedOnChain(blobId: string): Promise<boolean> {
  try {
    const tx = new Transaction();
    const signer = getSigner();

    // ⚡ Get the latest object reference
    const registry = await suiClient.getObject({
      id: SUI_LEGAL_REGISTRY_ID,
      options: { showContent: true },
    });

    // ⚡ Use the latest version
    const version = registry.data?.version || '0';
    
    tx.moveCall({
      target: `${SUI_PACKAGE_ID}::anchorproof::is_verified`,
      arguments: [
        tx.object(SUI_LEGAL_REGISTRY_ID),
        tx.pure.string(blobId),
      ],
    });

    const result = await suiClient.signAndExecuteTransaction({
      transaction: tx,
      signer: signer,
      options: {
        showEffects: true,
      },
      requestType: 'WaitForEffectsCert',
    });

    return result.effects?.status?.status === 'success';
  } catch (error) {
    console.error('Failed to check verification:', error);
    return false;
  }
}

export async function getLegalRecord(blobId: string) {
  try {
    const tx = new Transaction();
    const signer = getSigner();

    tx.moveCall({
      target: `${SUI_PACKAGE_ID}::anchorproof::get_record`,
      arguments: [tx.object(SUI_LEGAL_REGISTRY_ID), tx.pure.string(blobId)],
    });

    const result = await suiClient.signAndExecuteTransaction({
      transaction: tx,
      signer: signer,
      options: {
        showEffects: true,
        showEvents: true,
      },
      requestType: 'WaitForEffectsCert',
    });

    return result;
  } catch (error) {
    console.error('Failed to get legal record:', error);
    return null;
  }
}

export async function getRecordsByVerifier(verifier: string) {
  try {
    const tx = new Transaction();
    const signer = getSigner();

    tx.moveCall({
      target: `${SUI_PACKAGE_ID}::anchorproof::get_records_by_verifier`,
      arguments: [tx.object(SUI_LEGAL_REGISTRY_ID), tx.pure.address(verifier)],
    });

    const result = await suiClient.signAndExecuteTransaction({
      transaction: tx,
      signer: signer,
      options: {
        showEffects: true,
        showEvents: true,
      },
      requestType: 'WaitForEffectsCert',
    });

    return result;
  } catch (error) {
    console.error('Failed to get records by verifier:', error);
    return null;
  }
}

export async function getRecordsByDate(
  fromTimestamp: number,
  toTimestamp: number
) {
  try {
    const tx = new Transaction();
    const signer = getSigner();

    tx.moveCall({
      target: `${SUI_PACKAGE_ID}::anchorproof::get_records_by_date`,
      arguments: [
        tx.object(SUI_LEGAL_REGISTRY_ID),
        tx.pure.u64(fromTimestamp),
        tx.pure.u64(toTimestamp),
      ],
    });

    const result = await suiClient.signAndExecuteTransaction({
      transaction: tx,
      signer: signer,
      options: {
        showEffects: true,
        showEvents: true,
      },
      requestType: 'WaitForEffectsCert',
    });

    return result;
  } catch (error) {
    console.error('Failed to get records by date:', error);
    return null;
  }
}

export async function markTamperedOnChain(blobId: string) {
  try {
    const tx = new Transaction();
    const signer = getSigner();

    tx.moveCall({
      target: `${SUI_PACKAGE_ID}::anchorproof::mark_tampered`,
      arguments: [tx.object(SUI_LEGAL_REGISTRY_ID), tx.pure.string(blobId)],
    });

    const result = await suiClient.signAndExecuteTransaction({
      transaction: tx,
      signer: signer,
      options: {
        showEffects: true,
        showEvents: true,
      },
      requestType: 'WaitForEffectsCert',
    });

    return result;
  } catch (error) {
    console.error('Failed to mark tampered:', error);
    return null;
  }
}

export async function revokeVerificationOnChain(blobId: string) {
  try {
    const tx = new Transaction();
    const signer = getSigner();

    tx.moveCall({
      target: `${SUI_PACKAGE_ID}::anchorproof::revoke_verification`,
      arguments: [tx.object(SUI_LEGAL_REGISTRY_ID), tx.pure.string(blobId)],
    });

    const result = await suiClient.signAndExecuteTransaction({
      transaction: tx,
      signer: signer,
      options: {
        showEffects: true,
        showEvents: true,
      },
      requestType: 'WaitForEffectsCert',
    });

    return result;
  } catch (error) {
    console.error('Failed to revoke verification:', error);
    return null;
  }
}

export async function getRecordCount(): Promise<number> {
  try {
    const tx = new Transaction();
    const signer = getSigner();

    tx.moveCall({
      target: `${SUI_PACKAGE_ID}::anchorproof::get_record_count`,
      arguments: [tx.object(SUI_LEGAL_REGISTRY_ID)],
    });

    const result = await suiClient.signAndExecuteTransaction({
      transaction: tx,
      signer: signer,
      options: {
        showEffects: true,
        showEvents: true,
      },
      requestType: 'WaitForEffectsCert',
    });

    if (result.effects?.status?.status === 'success') {
      if (result.events) {
        for (const event of result.events) {
          if (event.type?.includes('RecordCount')) {
            const eventData = event.parsedJson as EventData;
            if (eventData?.count !== undefined) {
              return Number(eventData.count);
            }
          }
        }
      }
      return 1;
    }
    return 0;
  } catch (error) {
    console.error('Failed to get record count:', error);
    return 0;
  }
}

export async function humanReviewOnChain(
  blobId: string,
  decision: number,
  notesHash: string
) {
  try {
    const notesHashBytes = Buffer.from(notesHash, 'hex');
    const tx = new Transaction();
    const signer = getSigner();

    tx.moveCall({
      target: `${SUI_PACKAGE_ID}::anchorproof::human_review`,
      arguments: [
        tx.object(SUI_LEGAL_REGISTRY_ID),
        tx.object(SUI_CLOCK_ID),
        tx.pure.string(blobId),
        tx.pure.u8(decision),
        tx.pure.vector('u8', notesHashBytes),
      ],
    });

    const result = await suiClient.signAndExecuteTransaction({
      transaction: tx,
      signer: signer,
      options: {
        showEffects: true,
        showEvents: true,
      },
      requestType: 'WaitForEffectsCert',
    });

    return result;
  } catch (error) {
    console.error('Failed to record human review:', error);
    return null;
  }
}

export const contract = {
  recordOnChain,
  sealApproveOnChain,
  isVerifiedOnChain,
  getLegalRecord,
  getRecordsByVerifier,
  getRecordsByDate,
  markTamperedOnChain,
  revokeVerificationOnChain,
  getRecordCount,
  humanReviewOnChain,
};

export default contract;