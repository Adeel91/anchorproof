import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { activeNetwork } from '@/lib/walrus/client';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ txHash: string }> }
) {
  try {
    const { txHash } = await params;

    if (!txHash) {
      return NextResponse.json(
        { error: 'Transaction hash is required' },
        { status: 400 }
      );
    }

    const verification = await prisma.verification.findFirst({
      where: {
        anchorProofTxHash: {
          equals: txHash,
          mode: 'insensitive',
        },
      },
      select: {
        blobId: true,
        conversationId: true,
        verifiedAt: true,
        contentHash: true,
        anchorProofTxHash: true,
        suiTxHash: true,
        messageCount: true,
        customerId: true,
        agentId: true,
        createdAt: true,
        metadata: true,
      },
    });

    let verificationBySui = null;
    if (!verification) {
      verificationBySui = await prisma.verification.findFirst({
        where: {
          suiTxHash: {
            equals: txHash,
            mode: 'insensitive',
          },
        },
        select: {
          blobId: true,
          conversationId: true,
          verifiedAt: true,
          contentHash: true,
          anchorProofTxHash: true,
          suiTxHash: true,
          messageCount: true,
          customerId: true,
          agentId: true,
          createdAt: true,
          metadata: true,
        },
      });
    }

    const foundVerification = verification || verificationBySui;

    if (!foundVerification) {
      return NextResponse.json(
        {
          error: 'No verification found for this transaction hash',
          txHash,
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      verified: !!foundVerification.verifiedAt,
      data: {
        blobId: foundVerification.blobId,
        conversationId: foundVerification.conversationId,
        verifiedAt: foundVerification.verifiedAt,
        contentHash: foundVerification.contentHash,
        anchorProofTxHash: foundVerification.anchorProofTxHash,
        suiTxHash: foundVerification.suiTxHash,
        messageCount: foundVerification.messageCount,
        customerId: foundVerification.customerId,
        agentId: foundVerification.agentId,
        createdAt: foundVerification.createdAt,
        metadata: foundVerification.metadata,
      },
      timestamp: new Date().toISOString(),
      network: activeNetwork,
    });
  } catch (error) {
    console.error('Public verification error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to verify transaction',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
