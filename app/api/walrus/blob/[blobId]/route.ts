// app/api/walrus/blob/[blobId]/route.ts
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
import { createAuditLogAsync } from '@/lib/audit';
import { SUI_PACKAGE_ID, SUI_LEGAL_REGISTRY_ID, SUI_CLOCK_ID } from '@/lib/sui/contract';

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

    // ✅ Audit log - fire and forget
    createAuditLogAsync({
      action: 'BLOB_RETRIEVED',
      blobId: blobId,
      conversationId: verification.conversationId,
      tenantId: user.tenant.id,
      details: {
        customerId: verification.customerId,
        agentId: verification.agentId,
      },
    });

    let encryptedBlob: Uint8Array;

    try {
      encryptedBlob = await fetchBlobDirectly(blobId);
    } catch (directError) {
      try {
        const blobData = await walrusClient.walrus.readBlob({
          blobId: blobId,
        });
        encryptedBlob = blobData;
      } catch (walrusError: any) {
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

    const rawText = new TextDecoder().decode(encryptedBlob);
    let storageData;

    try {
      storageData = JSON.parse(rawText);
    } catch (parseError) {
      return NextResponse.json({
        success: true,
        blobId: blobId,
        conversationId: verification.conversationId,
        messages: [{
          role: 'assistant',
          content: rawText.slice(0, 1000),
          timestamp: verification.createdAt,
        }],
        metadata: {
          customerId: verification.customerId,
          agentId: verification.agentId,
          modelUsed: verification.modelUsed || 'plaintext',
        },
        verifiedAt: verification.verifiedAt,
        createdAt: verification.createdAt,
        walrusExplorerUrl: `https://walruscan.com/${activeNetwork}/blob/${blobId}`,
        isPlaintext: true,
        suiTxHash: verification.suiTxHash || blobId,
      });
    }

    if (storageData.messages && storageData.messages.length > 0 && !storageData.encryptedObjectHex) {
      return NextResponse.json({
        success: true,
        blobId: blobId,
        conversationId: storageData.conversationId || verification.conversationId,
        messages: storageData.messages || [],
        metadata: storageData.metadata || {
          customerId: verification.customerId,
          agentId: verification.agentId,
          modelUsed: verification.modelUsed,
        },
        verifiedAt: verification.verifiedAt,
        createdAt: verification.createdAt,
        walrusExplorerUrl: `https://walruscan.com/${activeNetwork}/blob/${blobId}`,
        suiTxHash: verification.suiTxHash || blobId,
        isPlaintext: true,
      });
    }

    // SEAL DECRYPT
    if (storageData.encryptedObjectHex && storageData.sealId && storageData.tenantAddress) {
      try {
        const encryptedObjectData = Buffer.from(storageData.encryptedObjectHex, 'hex');
        const sealId = storageData.sealId;
        const tenantAddressFromBlob = storageData.tenantAddress;
        const conversationId = storageData.conversationId || verification.conversationId;

        console.log('🔐 Found encrypted data');
        console.log('   Tenant Address from blob:', tenantAddressFromBlob);
        console.log('   Seal ID:', sealId);
        console.log('   Package ID:', SUI_PACKAGE_ID);

        // Get the API key for this tenant
        const apiKeyRecord = await prisma.apiKey.findFirst({
          where: { tenantId: user.tenant.id },
        });

        if (!apiKeyRecord || !apiKeyRecord.encryptedPrivateKey) {
          console.error('❌ No API key found for tenant');
          return NextResponse.json({
            success: true,
            blobId: blobId,
            conversationId: verification.conversationId,
            messages: [{
              role: 'assistant',
              content: '🔐 This conversation is encrypted. No decryption key available.',
              timestamp: verification.createdAt,
              isEncrypted: true,
            }],
            metadata: {
              customerId: verification.customerId,
              agentId: verification.agentId,
              modelUsed: verification.modelUsed || 'seal-encrypted',
            },
            verifiedAt: verification.verifiedAt,
            createdAt: verification.createdAt,
            walrusExplorerUrl: `https://walruscan.com/${activeNetwork}/blob/${blobId}`,
            isEncrypted: true,
            suiTxHash: verification.suiTxHash || blobId,
          });
        }

        // Decrypt the private key to get the actual keypair
        const decryptedPrivateKeyBase64 = decryptPrivateKey(apiKeyRecord.encryptedPrivateKey);
        const privateKeyBytes = fromBase64(decryptedPrivateKeyBase64);
        const tenantKeypair = Ed25519Keypair.fromSecretKey(privateKeyBytes);
        
        // Get the ACTUAL address from the keypair
        const actualKeypairAddress = tenantKeypair.getPublicKey().toSuiAddress();
        console.log('   Actual Keypair Address:', actualKeypairAddress);

        if (actualKeypairAddress !== tenantAddressFromBlob) {
          console.error('❌ Address mismatch!');
          console.error('   Keypair address:', actualKeypairAddress);
          console.error('   Address from blob:', tenantAddressFromBlob);
          
          return NextResponse.json({
            success: true,
            blobId: blobId,
            conversationId: verification.conversationId,
            messages: [{
              role: 'assistant',
              content: '🔐 This conversation was encrypted with a different key.',
              timestamp: verification.createdAt,
              isEncrypted: true,
            }],
            metadata: {
              customerId: verification.customerId,
              agentId: verification.agentId,
              modelUsed: verification.modelUsed || 'seal-encrypted',
            },
            verifiedAt: verification.verifiedAt,
            createdAt: verification.createdAt,
            walrusExplorerUrl: `https://walruscan.com/${activeNetwork}/blob/${blobId}`,
            isEncrypted: true,
            suiTxHash: verification.suiTxHash || blobId,
          });
        }

        console.log('✅ Keypair address matches tenant address from blob');

        // Create SessionKey with the ACTUAL keypair address
        const sessionKey = await SessionKey.create({
          address: actualKeypairAddress,
          packageId: SUI_PACKAGE_ID,
          ttlMin: 10,
          signer: tenantKeypair,
          suiClient,
        });

        console.log('✅ Session key created');

        // ✅ Build transaction for seal_approve - USING YOUR CONTRACT
        const tx = new Transaction();
        
        // Convert sealId to bytes
        const sealIdBytes = Buffer.from(sealId, 'hex');
        
        // ✅ YOUR CONTRACT: package_id::module_name::function_name
        const target = `${SUI_PACKAGE_ID}::anchorproof::seal_approve`;
        console.log('   Target:', target);
        console.log('   Registry ID:', SUI_LEGAL_REGISTRY_ID);
        console.log('   Clock ID:', SUI_CLOCK_ID);

        // ✅ Use the imported constants
        const registryObjectId = SUI_LEGAL_REGISTRY_ID;
        const clockObjectId = SUI_CLOCK_ID;

        if (!registryObjectId) {
          console.error('❌ SUI_LEGAL_REGISTRY_ID not set');
          return NextResponse.json({
            success: true,
            blobId: blobId,
            conversationId: verification.conversationId,
            messages: [{
              role: 'assistant',
              content: '🔐 Configuration error: LegalRegistry object ID not set.',
              timestamp: verification.createdAt,
              isEncrypted: true,
            }],
            metadata: {
              customerId: verification.customerId,
              agentId: verification.agentId,
              modelUsed: verification.modelUsed || 'seal-encrypted',
            },
            verifiedAt: verification.verifiedAt,
            createdAt: verification.createdAt,
            walrusExplorerUrl: `https://walruscan.com/${activeNetwork}/blob/${blobId}`,
            isEncrypted: true,
            suiTxHash: verification.suiTxHash || blobId,
          });
        }

        // ✅ Use tx.object() for object references (registry and clock)
        tx.moveCall({
          target: target,
          arguments: [
            tx.pure.vector('u8', sealIdBytes),        // _id: vector<u8>
            tx.pure.address(actualKeypairAddress),    // viewer: address
            tx.object(registryObjectId),              // _registry: &LegalRegistry
            tx.object(clockObjectId),                 // clock: &Clock
          ],
        });

        const txBytes = await tx.build({
          client: suiClient,
          onlyTransactionKind: true,
        });

        console.log('✅ Transaction built for seal_approve');

        // Decrypt using sealClient with the session key
        console.log('🔓 Attempting decryption...');
        const decryptedData = await sealClient.decrypt({
          data: encryptedObjectData,
          sessionKey: sessionKey,
          txBytes: txBytes,
        });

        console.log('✅ Decryption successful');
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
          suiTxHash: verification.suiTxHash || blobId,
          isDecrypted: true,
        });
      } catch (sealError: any) {
        console.error('❌ SEAL decryption error:', sealError);
        console.error('   Error details:', sealError.message);
        
        return NextResponse.json({
          success: true,
          blobId: blobId,
          conversationId: verification.conversationId,
          messages: [{
            role: 'assistant',
            content: `🔐 This conversation is SEAL encrypted. Decryption failed: ${sealError.message}`,
            timestamp: verification.createdAt,
            isEncrypted: true,
          }],
          metadata: {
            customerId: verification.customerId,
            agentId: verification.agentId,
            modelUsed: verification.modelUsed || 'seal-encrypted',
          },
          verifiedAt: verification.verifiedAt,
          createdAt: verification.createdAt,
          walrusExplorerUrl: `https://walruscan.com/${activeNetwork}/blob/${blobId}`,
          isEncrypted: true,
          suiTxHash: verification.suiTxHash || blobId,
        });
      }
    }

    // If we get here, return the raw text
    return NextResponse.json({
      success: true,
      blobId: blobId,
      conversationId: verification.conversationId,
      messages: [{
        role: 'assistant',
        content: rawText.slice(0, 1000) + (rawText.length > 1000 ? '...' : ''),
        timestamp: verification.createdAt,
      }],
      metadata: {
        customerId: verification.customerId,
        agentId: verification.agentId,
        modelUsed: verification.modelUsed || 'unknown',
      },
      verifiedAt: verification.verifiedAt,
      createdAt: verification.createdAt,
      walrusExplorerUrl: `https://walruscan.com/${activeNetwork}/blob/${blobId}`,
      suiTxHash: verification.suiTxHash || blobId,
      isPlaintext: true,
    });
  } catch (error) {
    console.error('Get blob error:', error);
    return NextResponse.json({ 
      error: String(error),
      message: 'Failed to retrieve conversation data'
    }, { status: 500 });
  }
}