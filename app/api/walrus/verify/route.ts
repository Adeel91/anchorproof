import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { walrusClient, activeNetwork } from '@/lib/walrus/client';
import crypto from 'crypto';
import { createAuditLogAsync } from '@/lib/audit';

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

export async function POST(request: NextRequest) {
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

    const { blobId, claimedContent } = await request.json();

    if (!blobId) {
      return NextResponse.json({ error: 'Blob ID required' }, { status: 400 });
    }

    const verification = await prisma.verification.findFirst({
      where: {
        blobId: blobId,
        tenantId: user.tenant.id,
      },
    });

    if (!verification) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const encryptedBlob = await walrusClient.walrus.readBlob({ blobId });
    const encryptedData = JSON.parse(new TextDecoder().decode(encryptedBlob));
    const decryptedJson = decrypt(JSON.stringify(encryptedData));
    const conversation = JSON.parse(decryptedJson);

    const originalContent = conversation.messages
      .map((m: { role: string; content: string }) => `${m.role}: ${m.content}`)
      .join('\n');

    const isTampered = claimedContent && claimedContent !== originalContent;

    createAuditLogAsync({
      action: isTampered ? 'TAMPER_DETECTED' : 'CONVERSATION_VERIFIED',
      tenantId: user.tenant.id,
      blobId: blobId,
      conversationId: verification.conversationId,
      details: {
        verified: !isTampered,
        tampered: isTampered,
        messageCount: conversation.messages.length,
        originalContentLength: originalContent.length,
        claimedContentLength: claimedContent?.length || 0,
        originalContent: originalContent.slice(0, 100),
        claimedContent: claimedContent?.slice(0, 100) || null,
      },
    });

    return NextResponse.json({
      verified: !isTampered,
      originalContent,
      claimedContent: claimedContent || originalContent,
      tampered: isTampered,
      blobId,
      messageCount: conversation.messages.length,
      message: isTampered
        ? '❌ TAMPERING DETECTED! Content does not match Walrus record.'
        : '✅ VERIFIED: Content matches Walrus record.',
      walrusExplorerUrl: `https://walruscan.com/${activeNetwork}/blob/${blobId}`,
    });
  } catch (error) {
    console.error('Verify error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
