import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { walrusClient } from '@/lib/walrus/client';
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
  { params }: { params: { blobid: string } }
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
    const encryptedData = JSON.parse(new TextDecoder().decode(encryptedBlob));

    const decryptedJson = decrypt(JSON.stringify(encryptedData));
    const conversation = JSON.parse(decryptedJson);

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
