import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isVerifiedOnChain } from '@/lib/sui/contract';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const blobId = url.searchParams.get('blobId');

    if (!blobId) {
      return NextResponse.json(
        { error: 'Missing blobId' },
        { status: 400 }
      );
    }

    let verification;

    // If pending blobId, find by the exact blobId
    if (blobId.startsWith('pending_')) {
      // Try to find by exact blobId first
      verification = await prisma.verification.findFirst({
        where: { blobId: blobId },
        select: {
          id: true,
          blobId: true,
          suiTxHash: true,
          metadata: true,
          verifiedAt: true,
          contentHash: true,
        },
      });

      // If not found by exact blobId, try to find by conversationId
      if (!verification) {
        const parts = blobId.split('_');
        const conversationId = parts.slice(2).join('_');
        
        verification = await prisma.verification.findFirst({
          where: {
            conversationId: conversationId,
          },
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            blobId: true,
            suiTxHash: true,
            metadata: true,
            verifiedAt: true,
            contentHash: true,
          },
        });
      }
    } else {
      verification = await prisma.verification.findFirst({
        where: { blobId },
        select: {
          id: true,
          blobId: true,
          suiTxHash: true,
          metadata: true,
          verifiedAt: true,
          contentHash: true,
        },
      });
    }

    if (!verification) {
      return NextResponse.json(
        { error: 'Verification not found' },
        { status: 404 }
      );
    }

    const metadata = verification.metadata as any || {};
    const contractTxHash = metadata.contractTxHash || null;
    const suiStatus = metadata.suiStatus || 'pending';
    const walrusStatus = metadata.walrusStatus || 'uploading';

    // Check on-chain status only if Walrus upload is complete
    let isVerified = false;
    if (walrusStatus === 'completed' && !verification.blobId.startsWith('pending_')) {
      isVerified = await isVerifiedOnChain(verification.blobId);
    }

    // If verified, update metadata
    if (isVerified && suiStatus !== 'verified') {
      const txHash = verification.suiTxHash || `0x${Buffer.from(verification.blobId).toString('hex').slice(0, 64)}`;
      
      await prisma.verification.updateMany({
        where: { id: verification.id },
        data: {
          metadata: {
            ...metadata,
            contractTxHash: txHash,
            suiStatus: 'verified',
            verifiedAt: new Date().toISOString(),
          },
        },
      });
    }

    // Determine the final blobId to return
    const finalBlobId = verification.blobId.startsWith('pending_') 
      ? verification.blobId 
      : verification.blobId;

    return NextResponse.json({
      blobId: finalBlobId,
      walrusTxHash: verification.suiTxHash,
      contractTxHash: metadata.contractTxHash || null,
      isVerified: isVerified || suiStatus === 'verified',
      suiStatus: isVerified ? 'verified' : suiStatus,
      walrusStatus: walrusStatus,
      verifiedAt: verification.verifiedAt,
      contentHash: verification.contentHash,
    });
  } catch (error) {
    console.error('Status check error:', error);
    return NextResponse.json(
      { error: 'Failed to check status' },
      { status: 500 }
    );
  }
}