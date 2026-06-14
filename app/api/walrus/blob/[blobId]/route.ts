import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { walrusClient, suiClient } from '@/lib/walrus/client';
import { SEAL_SYSTEM_PACKAGE_ID, sealClient } from '@/lib/seal/client';
import { SessionKey } from '@mysten/seal';
import { Transaction } from '@mysten/sui/transactions';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { fromBase64 } from '@mysten/bcs';
import crypto from 'crypto';

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
  { params }: { params: Promise<{ blobid: string }> }
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

    if (!user || !user.tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }

    const { blobid } = await params;

    const verification = await prisma.verification.findFirst({
      where: {
        blobId: blobid,
        tenantId: user.tenant.id,
      },
    });

    if (!verification) {
      return NextResponse.json(
        { error: 'Conversation not found or unauthorized' },
        { status: 403 }
      );
    }

    const apiKeyRecord = await prisma.apiKey.findFirst({
      where: { tenantId: user.tenantId },
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

    const encryptedBlob = await walrusClient.walrus.readBlob({
      blobId: blobid,
    });
    const rawJsonText = new TextDecoder().decode(encryptedBlob);
    const storageContainer = JSON.parse(rawJsonText);

    const encryptedObjectData = Uint8Array.from(
      storageContainer.encryptedObject
    );

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

    const decryptedData = await sealClient.decrypt({
      data: encryptedObjectData,
      sessionKey: sessionKey,
      txBytes: txBytes,
    });

    const conversation = JSON.parse(new TextDecoder().decode(decryptedData));

    return NextResponse.json({
      success: true,
      blobId: blobid,
      conversationId: conversation.conversationId,
      messages: conversation.messages,
      metadata: conversation.metadata,
      verifiedAt: verification.verifiedAt,
      createdAt: verification.createdAt,
      walrusExplorerUrl: `https://explorer.walrus.site/blob/${blobid}`,
    });
  } catch (error) {
    console.error('Get blob error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
