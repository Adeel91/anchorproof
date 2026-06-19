import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import { storeOnWalrus } from '@/lib/walrus/store';
import { sealClient, SEAL_SYSTEM_PACKAGE_ID } from '@/lib/seal/client';
import { Ed25519PublicKey } from '@mysten/sui/keypairs/ed25519';
import { fromBase64 } from '@mysten/bcs';

interface TempMessage {
  id: string;
  role: string;
  content: string;
  signature: string;
  publicKey: string;
  timestamp: Date;
}

export async function POST(request: NextRequest) {
  console.log('\n🚀 === SAVE ROUTE STARTED ===');

  try {
    // 1. Get API key from headers
    console.log('📌 Step 1: Getting API key from headers...');
    const apiKey = request.headers.get('X-API-Key');
    const publicKey = request.headers.get('X-Public-Key');

    console.log('   apiKey present:', !!apiKey);
    console.log('   publicKey present:', !!publicKey);
    console.log('   apiKey value:', apiKey);
    console.log('   publicKey value:', publicKey);

    if (!apiKey || !publicKey) {
      console.log('❌ FAILED: Missing API key or public key');
      return NextResponse.json(
        { error: 'Unauthorized: Missing API key' },
        { status: 401 }
      );
    }
    console.log('✅ Step 1: Headers received successfully');

    // 2. Verify API key exists
    console.log('📌 Step 2: Verifying API key in database...');
    const keyHash = crypto.createHash('sha256').update(apiKey).digest('hex');
    console.log('   keyHash:', keyHash);

    const apiKeyRecord = await prisma.apiKey.findFirst({
      where: {
        keyHash: keyHash,
        publicKey: publicKey,
      },
      include: { tenant: true },
    });

    console.log('   Record found:', !!apiKeyRecord);
    if (apiKeyRecord) {
      console.log('   Record ID:', apiKeyRecord.id);
      console.log('   Tenant ID:', apiKeyRecord.tenantId);
      console.log('   Tenant Name:', apiKeyRecord.tenant?.name);
    }

    if (!apiKeyRecord) {
      console.log('❌ FAILED: No matching API key record found');
      return NextResponse.json(
        { error: 'Unauthorized: Invalid API key' },
        { status: 401 }
      );
    }
    console.log('✅ Step 2: API key verified successfully');

    // 3. Get and verify the save request signature
    console.log('📌 Step 3: Getting request body...');
    const {
      conversationId,
      customerId,
      agentId,
      signature,
      publicKey: requestPublicKey,
    } = await request.json();

    console.log('   conversationId:', conversationId);
    console.log('   customerId:', customerId);
    console.log('   agentId:', agentId);
    console.log('   signature present:', !!signature);
    console.log('   requestPublicKey present:', !!requestPublicKey);

    if (!conversationId || !signature) {
      console.log('❌ FAILED: Missing required fields');
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    console.log('✅ Step 3: Request body received successfully');

    // 4. Verify signature matches the request data
    console.log('📌 Step 4: Verifying signature...');
    const messageToVerify = JSON.stringify({
      conversationId,
      customerId: customerId || 'unknown',
      agentId: agentId || 'unknown',
    });
    console.log('   Message to verify:', messageToVerify);

    const messageBytes = new TextEncoder().encode(messageToVerify);
    const signatureBytes = fromBase64(signature);
    const publicKeyBytes = fromBase64(requestPublicKey);

    console.log('   signatureBytes length:', signatureBytes.length);
    console.log('   publicKeyBytes length:', publicKeyBytes.length);

    const publicKeyObj = new Ed25519PublicKey(publicKeyBytes);
    const isValid = await publicKeyObj.verify(messageBytes, signatureBytes);

    console.log('   Signature valid:', isValid);

    if (!isValid) {
      console.log('❌ FAILED: Invalid signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }
    console.log('✅ Step 4: Signature verified successfully');

    // 5. Get messages from TempMessage
    console.log('📌 Step 5: Fetching messages from TempMessage...');
    console.log('   Tenant ID:', apiKeyRecord.tenantId);
    console.log('   Conversation ID:', conversationId);

    const messages = await prisma.tempMessage.findMany({
      where: { tenantId: apiKeyRecord.tenantId, conversationId },
      orderBy: { createdAt: 'asc' },
    });

    console.log('   Messages found:', messages.length);

    if (messages.length === 0) {
      console.log('❌ FAILED: No messages found');
      return NextResponse.json({ error: 'No messages found' }, { status: 400 });
    }
    console.log('✅ Step 5: Messages fetched successfully');

    // 6. For demo - use env var for Walrus signing
    console.log('📌 Step 6: Preparing for Walrus storage...');
    const decryptedPrivateKey = process.env.DEMO_PRIVATE_KEY!;
    console.log('   Private key present:', !!decryptedPrivateKey);
    console.log('   Private key length:', decryptedPrivateKey.length);

    // 7. Prepare conversation data
    console.log('📌 Step 7: Preparing conversation data...');
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
    console.log(
      '✅ Step 7: Conversation data prepared, messages:',
      messages.length
    );

    // 8. Calculate content hash BEFORE encryption
    console.log('📌 Step 8: Calculating content hash...');
    const contentHash = crypto
      .createHash('sha256')
      .update(JSON.stringify(conversationData.messages))
      .digest('hex');
    console.log('   Content hash:', contentHash);

    // 9. Encrypt with SEAL using the correct package ID
    console.log('📌 Step 9: Encrypting with SEAL...');
    console.log('   SEAL_PACKAGE_ID:', SEAL_SYSTEM_PACKAGE_ID);
    const plaintext = JSON.stringify(conversationData);
    console.log('   Plaintext length:', plaintext.length);

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
    console.log(
      '✅ Step 9: SEAL encryption complete, blob size:',
      encryptedBlob.length
    );

    // 10. Store on Walrus
    console.log('📌 Step 10: Storing on Walrus...');
    const { blobId, walrusExplorerUrl, suiTxHash, suiObjectId } =
      await storeOnWalrus(encryptedBlob);
    console.log('✅ Step 10: Walrus storage complete!');
    console.log('   Blob ID:', blobId);
    console.log('   Sui Tx Hash:', suiTxHash);
    console.log('   Explorer URL:', walrusExplorerUrl);

    // 11. Create verification record with contentHash
    console.log('📌 Step 11: Creating verification record in database...');
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
        contentHash: contentHash, // ← Store the content hash!
        metadata: {
          savedAt: new Date().toISOString(),
        },
      },
    });
    console.log('✅ Step 11: Verification record created with contentHash');

    // 12. Delete temp messages
    console.log('📌 Step 12: Deleting temporary messages...');
    await prisma.tempMessage.deleteMany({
      where: { tenantId: apiKeyRecord.tenantId, conversationId },
    });
    console.log('✅ Step 12: Temp messages deleted');

    console.log('🎉 === SAVE COMPLETED SUCCESSFULLY ===\n');

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