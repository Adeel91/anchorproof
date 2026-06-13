import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { verifySignature } from '@mysten/sui/verify';

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

    const {
      content,
      signature,
      publicKey,
      role,
      conversationId,
      customerId,
      agentId,
    } = await request.json();

    if (!content || !signature || !publicKey || !role) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const messageBytes = new TextEncoder().encode(content);

    const isValid = await verifySignature(messageBytes, signature, {
      address: user.tenant.suiAddress,
    });

    if (!isValid) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const apiKeyRecord = await prisma.apiKey.findFirst({
      where: {
        tenantId: user.tenantId,
        publicKey: publicKey,
      },
    });

    if (!apiKeyRecord) {
      return NextResponse.json(
        { error: 'API key not found for this public key' },
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
        tenantId: user.tenantId,
        conversationId: convId,
        role: role,
        content: content,
        signature: signature,
        publicKey: publicKey,
      },
    });

    const messageCount = await prisma.tempMessage.count({
      where: { tenantId: user.tenantId, conversationId: convId },
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
