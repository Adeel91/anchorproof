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
  console.log('⏱️ [SAVE] 🚀 Starting save process...');

  try {
    console.log('⏱️ [SAVE] Step 1: Validating API key...');
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
    console.log(`⏱️ [SAVE] ✅ API key validated in ${Date.now() - startTime}ms`);

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

    console.log('⏱️ [SAVE] Step 2: Verifying signature...');
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
    console.log(`⏱️ [SAVE] ✅ Signature verified in ${Date.now() - startTime}ms`);

    console.log('⏱️ [SAVE] Step 3: Fetching messages...');
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
    console.log(`⏱️ [SAVE] ✅ Found ${messages.length} messages in ${Date.now() - startTime}ms`);

    // Build conversation data
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

    console.log('⏱️ [SAVE] Step 4: Getting tenant key...');
    const tenantApiKey = await prisma.apiKey.findFirst({
      where: { tenantId: apiKeyRecord.tenantId },
      select: { encryptedPrivateKey: true },
    });

    if (!tenantApiKey || !tenantApiKey.encryptedPrivateKey) {
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
    console.log(`⏱️ [SAVE] ✅ Tenant key ready in ${Date.now() - startTime}ms`);

    const sealId = crypto
      .createHash('sha256')
      .update(conversationId + actualTenantAddress)
      .digest('hex');

    const plaintext = JSON.stringify(conversationData);

    console.log('⏱️ [SAVE] Step 5: SEAL Encryption...');
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

      const encryptedObjectHex = Buffer.from(encryptedObject).toString('hex');
      const sessionKeyHex = Buffer.from(key).toString('hex');

      encryptedBlob = JSON.stringify({
        encryptedObjectHex,
        sessionKeyHex,
        tenantAddress: actualTenantAddress,
        sealId,
        conversationId,
      });
    } catch (sealError) {
      console.error('SEAL encryption failed:', sealError);
      return NextResponse.json(
        {
          error: 'SEAL encryption failed',
          details: sealError instanceof Error ? sealError.message : String(sealError),
        },
        { status: 500 }
      );
    }
    console.log(`⏱️ [SAVE] ✅ SEAL Encryption complete in ${Date.now() - startTime}ms`);

    // ⚡ Save verification FIRST with pending status (before Walrus upload)
    console.log('⏱️ [SAVE] Step 6: Saving verification to DB...');
    const tempBlobId = `pending_${Date.now()}_${conversationId}`;
    
    const verification = await prisma.verification.create({
      data: {
        tenantId: apiKeyRecord.tenantId,
        conversationId,
        blobId: tempBlobId,
        suiTxHash: 'pending',
        customerId: customerId || 'unknown',
        agentId: agentId || 'unknown',
        modelUsed: 'seal-encrypted',
        messageCount: messages.length,
        contentHash,
        metadata: {
          savedAt: new Date().toISOString(),
          sealId,
          tenantAddress: actualTenantAddress,
          suiStatus: 'pending',
          walrusStatus: 'uploading',
        },
      },
    });
    console.log(`⏱️ [SAVE] ✅ Verification saved in ${Date.now() - startTime}ms`);

    // ⚡ Fire and forget - Walrus upload in background
    console.log('⏱️ [SAVE] Step 7: Starting background Walrus upload...');

    // ⚡ Upload to Walrus in background (don't await!)
    storeOnWalrus(encryptedBlob)
      .then(async (result) => {
        console.log(`⏱️ [BACKGROUND] Walrus upload complete: ${result.blobId}`);
        
        // Update verification with real blobId
        await prisma.verification.updateMany({
          where: { id: verification.id },
          data: {
            blobId: result.blobId,
            suiTxHash: result.suiTxHash,
            metadata: {
              savedAt: new Date().toISOString(),
              sealId: sealId,
              tenantAddress: actualTenantAddress,
              suiStatus: 'pending',
              walrusStatus: 'completed',
              walrusExplorerUrl: result.walrusExplorerUrl,
            },
          },
        });

        // ⚡ Now record on SUI
        await recordOnChain({
          blobId: result.blobId,
          conversationId,
          contentHash,
          suiTxHash: result.suiTxHash,
          signature,
          tenantAddress: actualTenantAddress,
        }).catch((err) => {
          console.error('On-chain recording failed (background):', err);
        });

        // Delete messages in background
        await prisma.tempMessage.deleteMany({
          where: { tenantId: apiKeyRecord.tenantId, conversationId },
        }).catch(console.error);
      })
      .catch(async (err) => {
        console.error('Background Walrus upload failed:', err);
        await prisma.verification.updateMany({
          where: { id: verification.id },
          data: {
            metadata: {
              savedAt: new Date().toISOString(),
              sealId: sealId,
              tenantAddress: actualTenantAddress,
              suiStatus: 'pending',
              walrusStatus: 'failed',
              error: err.message,
            },
          },
        }).catch(console.error);
      });

    // ⚡ Audit log in background
    createAuditLogAsync({
      action: 'CONVERSATION_SAVED',
      blobId: tempBlobId,
      conversationId,
      tenantId: apiKeyRecord.tenantId,
      details: {
        messageCount: messages.length,
        customerId: customerId || 'unknown',
        agentId: agentId || 'unknown',
        suiTxHash: 'pending',
        tenantAddress: actualTenantAddress,
        verificationId: verification.id,
        sealId,
        apiKeyId: apiKeyRecord.id,
        apiKeyName: apiKeyRecord.name || 'API Key',
        tenantName: apiKeyRecord.tenant?.name || undefined,
      },
    });

    const elapsed = Date.now() - startTime;
    console.log(`⏱️ [SAVE] 🎉 COMPLETE! Returning in ${elapsed}ms`);

    // ⚡ RETURN IMMEDIATELY (~1-2 seconds!)
    return NextResponse.json({
      success: true,
      blobId: tempBlobId,
      conversationId,
      messageCount: messages.length,
      contentHash,
      suiTxHash: 'pending',
      walrusExplorerUrl: '',
      verificationId: verification.id,
      sealId,
      tenantAddress: actualTenantAddress,
      elapsedMs: elapsed,
      suiStatus: 'pending',
      walrusStatus: 'uploading',
    });
  } catch (error) {
    const elapsed = Date.now() - startTime;
    console.error(`⏱️ [SAVE] ❌ ERROR after ${elapsed}ms:`, error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}