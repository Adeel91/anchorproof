// app/api/verify/route.ts
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createAuditLogAsync } from '@/lib/audit';

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

    let contentHash = null;
    if (metadata?.messages) {
      contentHash = crypto
        .createHash('sha256')
        .update(JSON.stringify(metadata.messages))
        .digest('hex');
    }

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
        contentHash: contentHash,
        metadata: metadata,
      },
    });

    createAuditLogAsync({
      action: 'CONVERSATION_VERIFIED',
      tenantId: key.tenantId,
      blobId: blobId,
      conversationId: metadata.conversationId,
      details: {
        verificationId: verification.id,
        messageCount: metadata.messageCount || 1,
        customerId: metadata.customerId,
        agentId: metadata.agentId,
        modelUsed: metadata.modelUsed,
        suiTxHash: suiTxHash,
      },
    });

    return NextResponse.json({
      success: true,
      blobId,
      suiTxHash,
      contentHash,
      verificationId: verification.id,
    });
  } catch (error) {
    console.error('Verification creation error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}