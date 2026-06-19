// lib/sui/contract.ts
import { Transaction } from '@mysten/sui/transactions';
import { suiClient } from '@/lib/walrus/client';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { fromBase64 } from '@mysten/bcs';
import { decodeSuiPrivateKey } from '@mysten/sui/cryptography';

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

// Get the signer keypair
function getSigner(): Ed25519Keypair {
  const privateKeyBase64 = process.env.DEDICATED_WALLET_PRIVATE_KEY;
  if (!privateKeyBase64) {
    throw new Error('Missing DEDICATED_WALLET_PRIVATE_KEY for signing transactions');
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

/**
 * Record a conversation verification on-chain for legal protection
 */
export async function recordOnChain(params: RecordOnChainParams) {
  const { blobId, conversationId, contentHash, suiTxHash, signature } = params;

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

  const result = await suiClient.signAndExecuteTransaction({
    transaction: tx,
    signer: signer,
    options: {
      showEffects: true,
      showEvents: true,
    },
  });

  return result;
}

/**
 * SEAL Approval - Called by SealClient internally
 */
export async function sealApproveOnChain(blobId: string, viewer: string): Promise<boolean> {
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
    });

    return result.effects?.status?.status === 'success';
  } catch (error) {
    console.error('SEAL approval failed:', error);
    return false;
  }
}

/**
 * Check if a blob is verified on-chain
 */
export async function isVerifiedOnChain(blobId: string): Promise<boolean> {
  try {
    const tx = new Transaction();
    const signer = getSigner();

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
    });

    return result.effects?.status?.status === 'success';
  } catch (error) {
    console.error('Failed to check verification:', error);
    return false;
  }
}

/**
 * Get a legal record from the contract
 */
export async function getLegalRecord(blobId: string) {
  try {
    const tx = new Transaction();
    const signer = getSigner();

    tx.moveCall({
      target: `${SUI_PACKAGE_ID}::anchorproof::get_record`,
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
        showEvents: true,
      },
    });

    return result;
  } catch (error) {
    console.error('Failed to get legal record:', error);
    return null;
  }
}

/**
 * Get all records by verifier (for legal discovery)
 */
export async function getRecordsByVerifier(verifier: string) {
  try {
    const tx = new Transaction();
    const signer = getSigner();

    tx.moveCall({
      target: `${SUI_PACKAGE_ID}::anchorproof::get_records_by_verifier`,
      arguments: [
        tx.object(SUI_LEGAL_REGISTRY_ID),
        tx.pure.address(verifier),
      ],
    });

    const result = await suiClient.signAndExecuteTransaction({
      transaction: tx,
      signer: signer,
      options: {
        showEffects: true,
        showEvents: true,
      },
    });

    return result;
  } catch (error) {
    console.error('Failed to get records by verifier:', error);
    return null;
  }
}

/**
 * Get records by date range (for audits)
 */
export async function getRecordsByDate(fromTimestamp: number, toTimestamp: number) {
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
    });

    return result;
  } catch (error) {
    console.error('Failed to get records by date:', error);
    return null;
  }
}

/**
 * Mark a conversation as tampered (if hash mismatch detected)
 */
export async function markTamperedOnChain(blobId: string) {
  try {
    const tx = new Transaction();
    const signer = getSigner();

    tx.moveCall({
      target: `${SUI_PACKAGE_ID}::anchorproof::mark_tampered`,
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
        showEvents: true,
      },
    });

    return result;
  } catch (error) {
    console.error('Failed to mark tampered:', error);
    return null;
  }
}

/**
 * Revoke a verification (emergency use only)
 */
export async function revokeVerificationOnChain(blobId: string) {
  try {
    const tx = new Transaction();
    const signer = getSigner();

    tx.moveCall({
      target: `${SUI_PACKAGE_ID}::anchorproof::revoke_verification`,
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
        showEvents: true,
      },
    });

    return result;
  } catch (error) {
    console.error('Failed to revoke verification:', error);
    return null;
  }
}

/**
 * Get total record count
 */
export async function getRecordCount(): Promise<number> {
  try {
    const tx = new Transaction();
    const signer = getSigner();

    tx.moveCall({
      target: `${SUI_PACKAGE_ID}::anchorproof::get_record_count`,
      arguments: [
        tx.object(SUI_LEGAL_REGISTRY_ID),
      ],
    });

    const result = await suiClient.signAndExecuteTransaction({
      transaction: tx,
      signer: signer,
      options: {
        showEffects: true,
        showEvents: true,
      },
    });

    // Try to extract count from events
    if (result.effects?.status?.status === 'success') {
      // Look for the count in events
      if (result.events) {
        for (const event of result.events) {
          if (event.type?.includes('RecordCount')) {
            // Parse the count from the event
            const eventData = event.parsedJson as any;
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

/**
 * Human review of AI decision (EU AI Act compliance)
 */
export async function humanReviewOnChain(
  blobId: string,
  decision: number, // 0=Approved, 1=Rejected, 2=Escalated
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
    });

    return result;
  } catch (error) {
    console.error('Failed to record human review:', error);
    return null;
  }
}

export default {
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