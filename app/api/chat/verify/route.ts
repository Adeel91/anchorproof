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

    const { messageId } = await request.json();

    if (!messageId) {
      return NextResponse.json(
        { error: 'Message ID required' },
        { status: 400 }
      );
    }

    const message = await prisma.tempMessage.findFirst({
      where: {
        id: messageId,
        tenantId: user.tenantId,
      },
    });

    if (!message) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }

    const messageBytes = new TextEncoder().encode(message.content);

    const isValid = await verifySignature(messageBytes, message.signature, {
      address: user.tenant.suiAddress,
    });

    return NextResponse.json({
      valid: isValid,
      message: isValid
        ? '✅ Signature verified. Message has not been tampered.'
        : '❌ INVALID SIGNATURE. Message has been tampered!',
      messageId: message.id,
      role: message.role,
      content: message.content,
      timestamp: message.timestamp,
    });
  } catch (error) {
    console.error('Verify error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
