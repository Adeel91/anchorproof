import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { walrusClient } from '@/lib/walrus/client';
import { SEAL_SYSTEM_PACKAGE_ID, sealClient } from '@/lib/seal/client';
import { suiClient } from '@/lib/walrus/client';
import { SessionKey, EncryptedObject } from '@mysten/seal';
import { Transaction } from '@mysten/sui/transactions';
import { fromHex } from '@mysten/bcs';

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

    const encryptedBlob = await walrusClient.walrus.readBlob({
      blobId: blobid,
    });

    const rawJsonText = new TextDecoder().decode(encryptedBlob);
    const storageContainer = JSON.parse(rawJsonText);

    const encryptedObjectData = fromHex(storageContainer.encryptedObjectHex);
    const sessionKeyBase64 = Buffer.from(
      storageContainer.sessionKeyHex,
      'hex'
    ).toString('base64');

    const parsedEncryptedObj = EncryptedObject.parse(encryptedObjectData);

    const rehydratedSessionKey = await SessionKey.import(
      {
        sessionKey: sessionKeyBase64,
        packageId: SEAL_SYSTEM_PACKAGE_ID,
        address: user.tenant.id,
        creationTimeMs: Date.now(),
        ttlMin: 60,
      },
      suiClient
    );

    const validationTx = new Transaction();

    validationTx.moveCall({
      target: `${SEAL_SYSTEM_PACKAGE_ID}::core::seal_approve`,
      arguments: [
        validationTx.pure.vector('u8', fromHex(parsedEncryptedObj.id)),
      ],
    });

    validationTx.setSender(user.tenant.id);

    const validationTxBytes = await validationTx.build({
      client: suiClient,
      onlyTransactionKind: true,
    });

    const decryptedBuffer = await sealClient.decrypt({
      data: encryptedObjectData,
      sessionKey: rehydratedSessionKey,
      txBytes: validationTxBytes,
    });

    const plaintext = new TextDecoder().decode(decryptedBuffer);
    const conversation = JSON.parse(plaintext);

    return NextResponse.json({
      success: true,
      blobId: blobid,
      conversationId: conversation.conversationId,
      messages: conversation.messages,
      metadata: conversation.metadata,
      verifiedAt: verification.verifiedAt,
      createdAt: verification.createdAt,
      walrusExplorerUrl: `https://walruscan.com/testnet/blob/${blobid}`,
    });
  } catch (error) {
    console.error('Get blob error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
