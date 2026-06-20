import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { walrusClient, fetchBlobDirectly } from '@/lib/walrus/client';
import crypto from 'crypto';

async function verifyBlobIntegrity(
  blobId: string,
  expectedHash?: string | null
): Promise<{
  verified: boolean;
  tampered: boolean;
  exists: boolean;
  error?: string;
}> {
  try {
    let blobData: Uint8Array;

    try {
      blobData = await fetchBlobDirectly(blobId);
    } catch {
      blobData = await walrusClient.walrus.readBlob({ blobId });
    }

    if (!blobData || blobData.length === 0) {
      return {
        verified: false,
        tampered: true,
        exists: false,
        error: 'Blob is empty',
      };
    }

    if (expectedHash) {
      const actualHash = crypto
        .createHash('sha256')
        .update(blobData)
        .digest('hex');

      const matches = actualHash === expectedHash;

      return {
        verified: matches,
        tampered: !matches,
        exists: true,
        error: matches ? undefined : 'Content hash mismatch',
      };
    }

    return {
      verified: true,
      tampered: false,
      exists: true,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const isNotFound =
      errorMessage?.includes('404') ||
      errorMessage?.includes('not found') ||
      errorMessage?.includes('No valid blob metadata');

    return {
      verified: false,
      tampered: true,
      exists: false,
      error: isNotFound ? 'Blob not found on Walrus' : errorMessage,
    };
  }
}

export async function GET() {
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

    const verifications = await prisma.verification.findMany({
      where: { tenantId: user.tenant.id },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        conversationId: true,
        blobId: true,
        suiTxHash: true,
        customerId: true,
        agentId: true,
        modelUsed: true,
        messageCount: true,
        verifiedAt: true,
        createdAt: true,
        metadata: true,
        contentHash: true,
      },
    });

    const verifiedConversations = await Promise.all(
      verifications.map(async (conv) => {
        const integrity = await verifyBlobIntegrity(
          conv.blobId,
          conv.contentHash
        );

        return {
          ...conv,
          integrity: {
            verified: integrity.verified,
            tampered: integrity.tampered,
            exists: integrity.exists,
            error: integrity.error || null,
          },
          status: integrity.tampered
            ? 'tampered'
            : conv.verifiedAt
              ? 'verified'
              : 'pending',
        };
      })
    );

    const stats = {
      total: verifiedConversations.length,
      verified: verifiedConversations.filter((c) => c.status === 'verified')
        .length,
      tampered: verifiedConversations.filter((c) => c.status === 'tampered')
        .length,
      pending: verifiedConversations.filter((c) => c.status === 'pending')
        .length,
      totalMessages: verifiedConversations.reduce(
        (acc, c) => acc + (c.messageCount || 0),
        0
      ),
      integrityRate:
        verifiedConversations.length > 0
          ? Math.round(
              (verifiedConversations.filter((c) => c.status === 'verified')
                .length /
                verifiedConversations.length) *
                100
            )
          : 100,
    };

    return NextResponse.json({
      success: true,
      count: verifications.length,
      stats,
      conversations: verifiedConversations,
    });
  } catch (error) {
    console.error('List conversations error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
