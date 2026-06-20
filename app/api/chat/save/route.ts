import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import { storeOnWalrus } from '@/lib/walrus/store';
import { sealClient, SEAL_SYSTEM_PACKAGE_ID } from '@/lib/seal/client';
import { Ed25519Keypair, Ed25519PublicKey } from '@mysten/sui/keypairs/ed25519';
import { fromBase64 } from '@mysten/bcs';
import { createAuditLogAsync } from '@/lib/audit';
import { recordOnChain } from '@/lib/sui/contract';

const MASTER_KEY_HEX =
  process.env.MASTER_KEY || crypto.randomBytes(32).toString('hex');
const MASTER_KEY = Buffer.from(MASTER_KEY_HEX, 'hex');

function decryptPrivateKey(encryptedJson: string): string {
  try {
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
  } catch (error) {
    console.error('Decryption error:', error);
    return encryptedJson;
  }
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const apiKey = request.headers.get('X-API-Key');
    const publicKey = request.headers.get('X-Public-Key');

    if (!apiKey || !publicKey) {
      return NextResponse.json(
        { error: 'Unauthorized: Missing API key' },
        { status: 401 }
      );
    }

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

    const messages = await prisma.tempMessage.findMany({
      where: { tenantId: apiKeyRecord.tenantId, conversationId },
      orderBy: { createdAt: 'asc' },
      select: {
        role: true,
        content: true,
      },
    });

    if (messages.length === 0) {
      return NextResponse.json({ error: 'No messages found' }, { status: 400 });
    }

    const conversationData = {
      conversationId,
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
      metadata: {
        customerId: customerId || 'unknown',
        agentId: agentId || 'unknown',
        messageCount: messages.length,
        savedAt: new Date().toISOString(),
      },
    };

    const contentHash = crypto
      .createHash('sha256')
      .update(JSON.stringify(conversationData.messages))
      .digest('hex');

    const tenantApiKey = await prisma.apiKey.findFirst({
      where: { tenantId: apiKeyRecord.tenantId },
    });

    if (!tenantApiKey || !tenantApiKey.encryptedPrivateKey) {
      console.error('No API key found for encryption');
      return NextResponse.json(
        { error: 'No API key available for encryption' },
        { status: 500 }
      );
    }

    const decryptedPrivateKeyBase64 = decryptPrivateKey(
      tenantApiKey.encryptedPrivateKey
    );
    const privateKeyBytes = fromBase64(decryptedPrivateKeyBase64);
    const tenantKeypair = Ed25519Keypair.fromSecretKey(privateKeyBytes);
    const actualTenantAddress = tenantKeypair.getPublicKey().toSuiAddress();

    const sealId = crypto
      .createHash('sha256')
      .update(conversationId + actualTenantAddress)
      .digest('hex');

    const plaintext = JSON.stringify(conversationData);

    let encryptedObjectHex: string;
    let sessionKeyHex: string;
    let encryptedBlob: string;

    try {
      const { encryptedObject, key } = await sealClient.encrypt({
        data: Buffer.from(plaintext, 'utf8'),
        threshold: 2,
        packageId: SEAL_SYSTEM_PACKAGE_ID,
        id: sealId,
        demType: 0,
        kemType: 0,
      });

      encryptedObjectHex = Buffer.from(encryptedObject).toString('hex');
      sessionKeyHex = Buffer.from(key).toString('hex');

      encryptedBlob = JSON.stringify({
        encryptedObjectHex: encryptedObjectHex,
        sessionKeyHex: sessionKeyHex,
        tenantAddress: actualTenantAddress,
        sealId: sealId,
        conversationId: conversationId,
      });
    } catch (sealError) {
      console.error('SEAL encryption failed:', sealError);
      return NextResponse.json(
        {
          error: 'SEAL encryption failed',
          details:
            sealError instanceof Error ? sealError.message : String(sealError),
        },
        { status: 500 }
      );
    }

    let blobId: string;
    let walrusExplorerUrl: string;
    let suiTxHash: string;

    try {
      const result = await storeOnWalrus(encryptedBlob);
      blobId = result.blobId;
      walrusExplorerUrl = result.walrusExplorerUrl;
      suiTxHash = result.suiTxHash;
    } catch (walrusError) {
      console.error('Walrus storage failed:', walrusError);

      const errorMessage =
        walrusError instanceof Error ? walrusError.message : 'Unknown error';

      if (
        errorMessage.includes('Too many failures') ||
        errorMessage.includes('upload failed')
      ) {
        return NextResponse.json(
          {
            error:
              'Walrus storage is currently unavailable. Please try again in a few moments.',
            details:
              'The Walrus testnet is experiencing high load. Retry your request.',
            code: 'WALRUS_UNAVAILABLE',
          },
          { status: 503 }
        );
      }

      return NextResponse.json(
        {
          error: 'Walrus storage failed',
          details: errorMessage,
        },
        { status: 500 }
      );
    }

    let verification;

    try {
      verification = await prisma.verification.create({
        data: {
          tenantId: apiKeyRecord.tenantId,
          conversationId,
          blobId: blobId,
          suiTxHash: suiTxHash,
          customerId: customerId || 'unknown',
          agentId: agentId || 'unknown',
          modelUsed: 'seal-encrypted',
          messageCount: messages.length,
          contentHash: contentHash,
          metadata: {
            savedAt: new Date().toISOString(),
            sealId: sealId,
            tenantAddress: actualTenantAddress,
          },
        },
      });
    } catch (dbError) {
      console.error('Database save failed:', dbError);
      return NextResponse.json(
        {
          error: 'Database save failed',
          details: dbError instanceof Error ? dbError.message : String(dbError),
        },
        { status: 500 }
      );
    }

    try {
      await prisma.tempMessage.deleteMany({
        where: { tenantId: apiKeyRecord.tenantId, conversationId },
      });
    } catch (deleteError) {
      console.error('Temp message deletion failed:', deleteError);
    }

    recordOnChain({
      blobId,
      conversationId,
      contentHash,
      suiTxHash: suiTxHash,
      signature: signature,
      tenantAddress: actualTenantAddress,
    })
      .then(() => {})
      .catch((err) => {
        console.error('On-chain recording failed:', err);
      });

    createAuditLogAsync({
      action: 'CONVERSATION_SAVED',
      blobId: blobId,
      conversationId: conversationId,
      tenantId: apiKeyRecord.tenantId,
      details: {
        messageCount: messages.length,
        customerId: customerId || 'unknown',
        agentId: agentId || 'unknown',
        suiTxHash: suiTxHash,
        tenantAddress: actualTenantAddress,
        verificationId: verification.id,
        sealId: sealId,
        apiKeyId: apiKeyRecord.id,
        apiKeyName: apiKeyRecord.name || 'API Key',
        tenantName: apiKeyRecord.tenant?.name || undefined,
      },
    });

    const elapsed = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      blobId: blobId,
      conversationId,
      messageCount: messages.length,
      contentHash: contentHash,
      suiTxHash: suiTxHash,
      walrusExplorerUrl: walrusExplorerUrl,
      verificationId: verification.id,
      sealId: sealId,
      tenantAddress: actualTenantAddress,
      elapsedMs: elapsed,
    });
  } catch (error) {
    const elapsed = Date.now() - startTime;
    console.error(`SAVE ROUTE ERROR after ${elapsed}ms:`, error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Internal server error',
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
