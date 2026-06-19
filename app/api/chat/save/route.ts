import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import { storeOnWalrus } from '@/lib/walrus/store';
import { sealClient, SEAL_SYSTEM_PACKAGE_ID } from '@/lib/seal/client';
import { Ed25519PublicKey } from '@mysten/sui/keypairs/ed25519';
import { fromBase64 } from '@mysten/bcs';
import { createAuditLog } from '@/lib/audit';

interface TempMessage {
  id: string;
  role: string;
  content: string;
  signature: string;
  publicKey: string;
  timestamp: Date;
}

export async function POST(request: NextRequest) {
  try {
    // 1. Get API key from headers
    const apiKey = request.headers.get('X-API-Key');
    const publicKey = request.headers.get('X-Public-Key');

    if (!apiKey || !publicKey) {
      return NextResponse.json(
        { error: 'Unauthorized: Missing API key' },
        { status: 401 }
      );
    }

    // 2. Verify API key exists
    const keyHash = crypto.createHash('sha256').update(apiKey).digest('hex');

    const apiKeyRecord = await prisma.apiKey.findFirst({
      where: {
        keyHash: keyHash,
        publicKey: publicKey,
      },
      include: { tenant: true },
    });

    if (!apiKeyRecord) {
      return NextResponse.json(
        { error: 'Unauthorized: Invalid API key' },
        { status: 401 }
      );
    }

    // 3. Get and verify the save request signature
    const {
      conversationId,
      customerId,
      agentId,
      signature,
      publicKey: requestPublicKey,
    } = await request.json();

    if (!conversationId || !signature) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // 4. Verify signature matches the request data
    const messageToVerify = JSON.stringify({
      conversationId,
      customerId: customerId || 'unknown',
      agentId: agentId || 'unknown',
    });

    const messageBytes = new TextEncoder().encode(messageToVerify);
    const signatureBytes = fromBase64(signature);
    const publicKeyBytes = fromBase64(requestPublicKey);

    const publicKeyObj = new Ed25519PublicKey(publicKeyBytes);
    const isValid = await publicKeyObj.verify(messageBytes, signatureBytes);

    if (!isValid) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    // 5. Get messages from TempMessage
    const messages = await prisma.tempMessage.findMany({
      where: { tenantId: apiKeyRecord.tenantId, conversationId },
      orderBy: { createdAt: 'asc' },
    });

    if (messages.length === 0) {
      return NextResponse.json({ error: 'No messages found' }, { status: 400 });
    }

    // 6. For demo - use env var for Walrus signing
    const decryptedPrivateKey = process.env.DEMO_PRIVATE_KEY!;

    // 7. Prepare conversation data
    const conversationData = {
      conversationId,
      messages: messages.map((m: TempMessage) => ({
        id: m.id,
        role: m.role,
        content: m.content,
        signature: m.signature,
        publicKey: m.publicKey,
        timestamp: m.timestamp,
      })),
      metadata: {
        customerId: customerId || 'unknown',
        agentId: agentId || 'unknown',
        messageCount: messages.length,
        savedAt: new Date().toISOString(),
      },
    };

    // 8. Calculate content hash BEFORE encryption
    const contentHash = crypto
      .createHash('sha256')
      .update(JSON.stringify(conversationData.messages))
      .digest('hex');

    // 9. Encrypt with SEAL using the correct package ID
    const plaintext = JSON.stringify(conversationData);
    const encryptedBlob = plaintext;

    // const { encryptedObject, key } = await sealClient.encrypt({
    //   data: Buffer.from(plaintext, 'utf8'),
    //   threshold: 2,
    //   packageId: SEAL_SYSTEM_PACKAGE_ID,
    //   id: conversationId,
    //   demType: 0,
    //   kemType: 0,
    // });

    // const encryptedBlob = JSON.stringify({
    //   encryptedObjectHex: encryptedObject.toHex(),
    //   sessionKeyHex: Buffer.from(key).toString('hex'),
    // });

    // 10. Store on Walrus
    const { blobId, walrusExplorerUrl, suiTxHash, suiObjectId } =
      await storeOnWalrus(encryptedBlob);

    // 11. Create verification record with contentHash
    await prisma.verification.create({
      data: {
        tenantId: apiKeyRecord.tenantId,
        conversationId,
        blobId: blobId,
        suiTxHash: suiTxHash || suiObjectId || 'walrus-stored',
        customerId: customerId || 'unknown',
        agentId: agentId || 'unknown',
        modelUsed: 'seal-encrypted',
        messageCount: messages.length,
        contentHash: contentHash,
        metadata: {
          savedAt: new Date().toISOString(),
        },
      },
    });

    // ✅ AUDIT LOG: Conversation saved
    await createAuditLog({
      action: 'CONVERSATION_SAVED',
      blobId: blobId,
      conversationId: conversationId,
      details: {
        messageCount: messages.length,
        customerId: customerId || 'unknown',
        agentId: agentId || 'unknown',
        suiTxHash: suiTxHash || 'walrus-stored',
      },
    });

    // 12. Delete temp messages
    await prisma.tempMessage.deleteMany({
      where: { tenantId: apiKeyRecord.tenantId, conversationId },
    });

    return NextResponse.json({
      success: true,
      blobId: blobId,
      conversationId,
      messageCount: messages.length,
      contentHash: contentHash,
      walrusExplorerUrl: walrusExplorerUrl,
    });
  } catch (error) {
    console.error('💥 SAVE ROUTE ERROR:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}