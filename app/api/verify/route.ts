import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const { apiKey, metadata } = await req.json();

    const key = await prisma.apiKey.findFirst({
      where: {
        keyHash: crypto.createHash('sha256').update(apiKey).digest('hex'),
      },
      include: { tenant: true },
    });

    if (!key || key.expiresAt < new Date()) {
      return NextResponse.json(
        { error: 'Invalid or expired API key' },
        { status: 401 }
      );
    }

    const blobId = crypto.randomUUID();
    const suiTxHash = crypto.randomUUID();

    const verification = await prisma.verification.create({
      data: {
        tenantId: key.tenantId,
        conversationId: metadata.conversationId || crypto.randomUUID(),
        blobId: blobId,
        suiTxHash: suiTxHash,
        customerId: metadata.customerId,
        agentId: metadata.agentId,
        modelUsed: metadata.modelUsed,
        messageCount: metadata.messageCount || 1,
        metadata: metadata,
      },
    });

    return NextResponse.json({
      success: true,
      blobId,
      suiTxHash,
      verificationId: verification.id,
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
