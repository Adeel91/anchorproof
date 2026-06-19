// app/api/chat/save/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import { storeOnWalrus } from '@/lib/walrus/store';
import { sealClient, SEAL_SYSTEM_PACKAGE_ID } from '@/lib/seal/client';
import { Ed25519PublicKey } from '@mysten/sui/keypairs/ed25519';
import { fromBase64 } from '@mysten/bcs';
import { createAuditLog } from '@/lib/audit';
import { recordOnChain } from '@/lib/sui/contract';

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

    // 3. Get request body
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

    // 4. Verify signature
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

    // 6. Prepare conversation data
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

    // 7. Calculate content hash
    const contentHash = crypto
      .createHash('sha256')
      .update(JSON.stringify(conversationData.messages))
      .digest('hex');

    // 8. SEAL ENCRYPT
    console.log('🔐 Starting SEAL encryption...');
    console.log('   SEAL_PACKAGE_ID:', SEAL_SYSTEM_PACKAGE_ID);
    
    const plaintext = JSON.stringify(conversationData);
    console.log('   Plaintext length:', plaintext.length);

    // Generate a random 32-byte hex string for SEAL ID
    const sealId = crypto.randomBytes(32).toString('hex');
    console.log('   SEAL ID:', sealId);

    let encryptedObjectHex: string;
    let sessionKeyHex: string;
    let encryptedBlob: string;

    try {
      console.log('   Calling sealClient.encrypt...');
      
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
      });

      console.log('✅ SEAL encryption successful');
      console.log('   Encrypted blob size:', encryptedBlob.length);
    } catch (sealError) {
      console.error('❌ SEAL encryption failed:', sealError);
      // Return detailed error response
      return NextResponse.json(
        { 
          error: 'SEAL encryption failed', 
          details: sealError instanceof Error ? sealError.message : String(sealError),
          stack: sealError instanceof Error ? sealError.stack : undefined
        },
        { status: 500 }
      );
    }

    // 9. WALRUS STORAGE
    console.log('📤 Storing on Walrus...');
    let blobId: string;
    let walrusExplorerUrl: string;
    let suiTxHash: string;

    try {
      const result = await storeOnWalrus(encryptedBlob);
      blobId = result.blobId;
      walrusExplorerUrl = result.walrusExplorerUrl;
      suiTxHash = result.suiTxHash;
      console.log('✅ Walrus storage successful');
      console.log('   Blob ID:', blobId);
      console.log('   Sui TX Hash:', suiTxHash);
    } catch (walrusError) {
      console.error('❌ Walrus storage failed:', walrusError);
      return NextResponse.json(
        { 
          error: 'Walrus storage failed', 
          details: walrusError instanceof Error ? walrusError.message : String(walrusError),
          stack: walrusError instanceof Error ? walrusError.stack : undefined
        },
        { status: 500 }
      );
    }

    // 10. Save to database
    console.log('💾 Saving to database...');
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
          },
        },
      });
      console.log('✅ Database save successful');
      console.log('   Verification ID:', verification.id);
    } catch (dbError) {
      console.error('❌ Database save failed:', dbError);
      return NextResponse.json(
        { 
          error: 'Database save failed', 
          details: dbError instanceof Error ? dbError.message : String(dbError),
          stack: dbError instanceof Error ? dbError.stack : undefined
        },
        { status: 500 }
      );
    }

    // 11. ON-CHAIN LEGAL RECORD
    console.log('⛓️ Recording on-chain...');
    let onChainSuccess = false;
    
    try {
      await recordOnChain({
        blobId,
        conversationId,
        contentHash,
        suiTxHash: suiTxHash,
        signature: signature,
        tenantAddress: apiKeyRecord.tenant?.suiAddress,
      });
      onChainSuccess = true;
      console.log('✅ On-chain record created for legal protection');
    } catch (onChainError) {
      console.error('⚠️ On-chain recording failed (non-critical):', onChainError);
      // Don't fail the request - data is already on Walrus
    }

    // 12. Audit log
    console.log('📝 Creating audit log...');
    try {
      await createAuditLog({
        action: 'CONVERSATION_SAVED',
        blobId: blobId,
        conversationId: conversationId,
        details: {
          messageCount: messages.length,
          customerId: customerId || 'unknown',
          agentId: agentId || 'unknown',
          suiTxHash: suiTxHash,
          onChainRecorded: onChainSuccess,
        },
      });
      console.log('✅ Audit log created');
    } catch (auditError) {
      console.error('⚠️ Audit log failed (non-critical):', auditError);
    }

    // 13. Delete temp messages
    console.log('🗑️ Deleting temporary messages...');
    try {
      await prisma.tempMessage.deleteMany({
        where: { tenantId: apiKeyRecord.tenantId, conversationId },
      });
      console.log('✅ Temp messages deleted');
    } catch (deleteError) {
      console.error('⚠️ Temp message deletion failed (non-critical):', deleteError);
    }

    console.log('🎉 === SAVE COMPLETED SUCCESSFULLY ===\n');

    return NextResponse.json({
      success: true,
      blobId: blobId,
      conversationId,
      messageCount: messages.length,
      contentHash: contentHash,
      suiTxHash: suiTxHash,
      walrusExplorerUrl: walrusExplorerUrl,
      onChainRecorded: onChainSuccess,
      verificationId: verification.id,
      sealId: sealId,
    });
  } catch (error) {
    console.error('💥 SAVE ROUTE ERROR:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Internal server error',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}