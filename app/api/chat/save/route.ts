import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { storeOnWalrus } from '@/lib/walrus/store';
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

const maskEmail = (email: string) => {
  const [localPart, domain] = email.split('@');
  if (localPart.length <= 2) return `${localPart[0]}***@${domain}`;
  return `${localPart.slice(0, 2)}***${localPart.slice(-1)}@${domain}`;
};

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

    const { conversationId, customerId, agentId } = await request.json();

    if (!conversationId) {
      return NextResponse.json(
        { error: 'Conversation ID required' },
        { status: 400 }
      );
    }

    const messages = await prisma.tempMessage.findMany({
      where: { tenantId: user.tenantId, conversationId },
      orderBy: { createdAt: 'asc' },
    });

    if (messages.length === 0) {
      return NextResponse.json({ error: 'No messages found' }, { status: 400 });
    }

    const firstMessage = messages[0];
    const apiKeyRecord = await prisma.apiKey.findFirst({
      where: {
        tenantId: user.tenantId,
        publicKey: firstMessage.publicKey,
      },
    });

    if (!apiKeyRecord || !apiKeyRecord.encryptedPrivateKey) {
      return NextResponse.json(
        { error: 'Signing key not found' },
        { status: 500 }
      );
    }

    const decryptedPrivateKeyBase64 = decrypt(apiKeyRecord.encryptedPrivateKey);

    const conversationData = {
      conversationId,
      messages: messages.map(
        (m: {
          id: string;
          role: string;
          content: string;
          signature: string;
          publicKey: string;
          timestamp: Date;
        }) => ({
          id: m.id,
          role: m.role,
          content: m.content,
          signature: m.signature,
          publicKey: m.publicKey,
          timestamp: m.timestamp,
        })
      ),
      metadata: {
        tenantId: user.tenant.id,
        tenantName: user.tenant.name,
        tenantEmailDomain: user.tenant.emailDomain,
        userId: user.id,
        userEmail: maskEmail(user.email),
        userRole: user.role,
        customerId: customerId || 'unknown',
        agentId: agentId || 'unknown',
        messageCount: messages.length,
        savedAt: new Date().toISOString(),
      },
    };

    const plaintext = JSON.stringify(conversationData);
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-gcm', MASTER_KEY, iv);
    const encrypted = Buffer.concat([
      cipher.update(plaintext, 'utf8'),
      cipher.final(),
    ]);
    const authTag = cipher.getAuthTag();

    const encryptedBlob = JSON.stringify({
      iv: iv.toString('hex'),
      encrypted: encrypted.toString('hex'),
      authTag: authTag.toString('hex'),
    });

    const { blobId, walrusExplorerUrl } = await storeOnWalrus(
      encryptedBlob,
      decryptedPrivateKeyBase64
    );

    await prisma.verification.create({
      data: {
        tenantId: user.tenant.id,
        conversationId,
        blobId: blobId,
        suiTxHash: 'walrus-stored',
        customerId: customerId || 'unknown',
        agentId: agentId || 'unknown',
        modelUsed: 'aes-256-gcm',
        messageCount: messages.length,
        metadata: conversationData.metadata,
      },
    });

    await prisma.tempMessage.deleteMany({
      where: { tenantId: user.tenantId, conversationId },
    });

    return NextResponse.json({
      success: true,
      blobId: blobId,
      conversationId,
      messageCount: messages.length,
      walrusExplorerUrl: walrusExplorerUrl,
    });
  } catch (error) {
    console.error('Save conversation error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
