import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import { Ed25519PublicKey } from '@mysten/sui/keypairs/ed25519';
import { fromBase64 } from '@mysten/bcs';

export async function POST(request: NextRequest) {
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

    const { content, signature, role, conversationId, customerId, agentId } =
      await request.json();

    if (!content || !signature || !role) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const messageBytes = new TextEncoder().encode(content);
    const signatureBytes = fromBase64(signature);
    const publicKeyBytes = fromBase64(publicKey);

    try {
      const publicKeyObj = new Ed25519PublicKey(publicKeyBytes);
      const isValid = await publicKeyObj.verify(messageBytes, signatureBytes);

      if (!isValid) {
        return NextResponse.json(
          { error: 'Invalid signature' },
          { status: 401 }
        );
      }
    } catch (verifyError) {
      console.error('Signature verification error:', verifyError);
      return NextResponse.json(
        { error: 'Signature verification failed' },
        { status: 401 }
      );
    }

    await prisma.apiKey.update({
      where: { id: apiKeyRecord.id },
      data: { lastUsedAt: new Date() },
    });

    const convId =
      conversationId ||
      `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const savedMessage = await prisma.tempMessage.create({
      data: {
        tenantId: apiKeyRecord.tenantId,
        conversationId: convId,
        role: role,
        content: content,
        signature: signature,
        publicKey: publicKey,
      },
    });

    const messageCount = await prisma.tempMessage.count({
      where: { tenantId: apiKeyRecord.tenantId, conversationId: convId },
    });

    const isFull = messageCount >= 600;

    return NextResponse.json({
      success: true,
      messageId: savedMessage.id,
      conversationId: convId,
      messageCount,
      isFull,
      verified: true,
      customerId: customerId || 'unknown',
      agentId: agentId || 'unknown',
    });
  } catch (error) {
    console.error('Chat send error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
