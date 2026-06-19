import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { walrusClient, suiClient, fetchBlobDirectly, activeNetwork } from '@/lib/walrus/client';
import { SEAL_SYSTEM_PACKAGE_ID, sealClient } from '@/lib/seal/client';
import { SessionKey } from '@mysten/seal';
import { Transaction } from '@mysten/sui/transactions';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { fromBase64 } from '@mysten/bcs';
import crypto from 'crypto';
import { createAuditLog } from '@/lib/audit';

const MASTER_KEY_HEX =
  process.env.MASTER_KEY || crypto.randomBytes(32).toString('hex');
const MASTER_KEY = Buffer.from(MASTER_KEY_HEX, 'hex');

function decrypt(encryptedJson: string): string {
  const { iv, encrypted, authTag } = JSON.parse(encryptedJson);
  const decipher = crypto.createDecipheriv(
    'aes-256-gcm',
    MASTER_KEY,
    Buffer.from(iv, 'hex')
  );
  decipher.setAuthTag(Buffer.from(authTag, 'hex'));
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encrypted, 'hex')),
    decipher.final(),
  ]);
  return decrypted.toString('utf8');
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ blobId: string }> }
) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('anchorproof-session')?.value;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the user first to get their tenant
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { tenant: true },
    });

    if (!user) {
      const response = NextResponse.json(
        { error: 'User not found' },
        { status: 401 }
      );
      response.cookies.delete('anchorproof-session');
      return response;
    }

    if (!user.tenant) {
      return NextResponse.json(
        { error: 'Tenant not found for user' },
        { status: 404 }
      );
    }

    const { blobId } = await params;

    if (!blobId) {
      return NextResponse.json(
        { error: 'Blob ID is required' },
        { status: 400 }
      );
    }

    // Verify the blob exists in your database
    const verification = await prisma.verification.findFirst({
      where: {
        blobId: blobId,
        tenantId: user.tenant.id,
      },
    });

    if (!verification) {
      return NextResponse.json(
        { error: 'Conversation not found or unauthorized' },
        { status: 403 }
      );
    }

    // ✅ AUDIT LOG: Blob retrieved
    await createAuditLog({
      action: 'BLOB_RETRIEVED',
      blobId: blobId,
      conversationId: verification.conversationId,
      details: {
        customerId: verification.customerId,
        agentId: verification.agentId,
      },
    });

    // Try to get the blob from Walrus using direct HTTP fetch first
    let encryptedBlob: Uint8Array;
    let usingWalrusClient = false;

    try {
      encryptedBlob = await fetchBlobDirectly(blobId);
    } catch (directError) {
      try {
        const blobData = await walrusClient.walrus.readBlob({
          blobId: blobId,
        });
        encryptedBlob = blobData;
        usingWalrusClient = true;
      } catch (walrusError: any) {
        // Return fallback data from database
        return NextResponse.json({
          error: 'Blob not found on Walrus storage',
          details: walrusError.message,
          blobId: blobId,
          fallbackData: {
            blobId: blobId,
            conversationId: verification.conversationId,
            messages: [],
            metadata: {
              customerId: verification.customerId,
              agentId: verification.agentId,
              modelUsed: verification.modelUsed,
            },
            verifiedAt: verification.verifiedAt,
            createdAt: verification.createdAt,
            isFallback: true,
          }
        }, { status: 404 });
      }
    }

    // Parse the blob data
    let storageContainer;
    try {
      const rawJsonText = new TextDecoder().decode(encryptedBlob);
      storageContainer = JSON.parse(rawJsonText);
    } catch (parseError) {
      return NextResponse.json(
        { error: 'Invalid blob data format' },
        { status: 500 }
      );
    }

    // Check if the blob is already decrypted (no encryptedObject field)
    if (storageContainer.messages && storageContainer.conversationId) {
      return NextResponse.json({
        success: true,
        blobId: blobId,
        conversationId: storageContainer.conversationId || verification.conversationId,
        messages: storageContainer.messages || [],
        metadata: storageContainer.metadata || {
          customerId: verification.customerId,
          agentId: verification.agentId,
          modelUsed: verification.modelUsed,
        },
        verifiedAt: verification.verifiedAt,
        createdAt: verification.createdAt,
        walrusExplorerUrl: `https://walruscan.com/${activeNetwork}/blob/${blobId}`,
        usingWalrusClient,
      });
    }

    // If we have encryptedObject, proceed with decryption
    if (!storageContainer.encryptedObject) {
      return NextResponse.json(
        { error: 'Invalid blob format: missing encrypted data' },
        { status: 500 }
      );
    }

    const encryptedObjectData = Uint8Array.from(storageContainer.encryptedObject);

    // Get API key for decryption
    const apiKeyRecord = await prisma.apiKey.findFirst({
      where: { tenantId: user.tenant.id },
    });

    if (!apiKeyRecord || !apiKeyRecord.encryptedPrivateKey) {
      return NextResponse.json(
        { error: 'Signing key not found' },
        { status: 500 }
      );
    }

    const decryptedPrivateKeyBase64 = decrypt(apiKeyRecord.encryptedPrivateKey);
    const privateKeyBytes = fromBase64(decryptedPrivateKeyBase64);
    const tenantKeypair = Ed25519Keypair.fromSecretKey(privateKeyBytes);

    const sessionKey = await SessionKey.create({
      address: user.tenant.suiAddress,
      packageId: SEAL_SYSTEM_PACKAGE_ID,
      ttlMin: 10,
      signer: tenantKeypair,
      suiClient,
    });

    const tx = new Transaction();
    const objectId = crypto.randomBytes(32).toString('hex');

    tx.moveCall({
      target: `${SEAL_SYSTEM_PACKAGE_ID}::core::seal_approve`,
      arguments: [tx.pure.vector('u8', Buffer.from(objectId, 'hex'))],
    });

    const txBytes = await tx.build({
      client: suiClient,
      onlyTransactionKind: true,
    });

    let decryptedData: Uint8Array;
    try {
      decryptedData = await sealClient.decrypt({
        data: encryptedObjectData,
        sessionKey: sessionKey,
        txBytes: txBytes,
      });
    } catch (sealError: any) {
      return NextResponse.json(
        { 
          error: 'Failed to decrypt conversation data',
          details: sealError.message,
          blobId: blobId,
        },
        { status: 500 }
      );
    }

    const conversation = JSON.parse(new TextDecoder().decode(decryptedData));

    return NextResponse.json({
      success: true,
      blobId: blobId,
      conversationId: conversation.conversationId || verification.conversationId,
      messages: conversation.messages || [],
      metadata: conversation.metadata || {
        customerId: verification.customerId,
        agentId: verification.agentId,
        modelUsed: verification.modelUsed,
      },
      verifiedAt: verification.verifiedAt,
      createdAt: verification.createdAt,
      walrusExplorerUrl: `https://walruscan.com/${activeNetwork}/blob/${blobId}`,
      usingWalrusClient,
    });
  } catch (error) {
    console.error('Get blob error:', error);
    return NextResponse.json({ 
      error: String(error),
      message: 'Failed to retrieve conversation data'
    }, { status: 500 });
  }
}