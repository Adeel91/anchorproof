import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

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
        anchorProofTxHash: true,
        customerId: true,
        agentId: true,
        modelUsed: true,
        messageCount: true,
        verifiedAt: true,
        createdAt: true,
        metadata: true,
      },
    });

    const stats = {
      total: verifications.length,
      verified: verifications.filter((v) => v.verifiedAt).length,
      pending: verifications.filter((v) => !v.verifiedAt).length,
      totalMessages: verifications.reduce(
        (acc, v) => acc + (v.messageCount || 0),
        0
      ),
    };

    return NextResponse.json({
      success: true,
      count: verifications.length,
      stats,
      conversations: verifications,
    });
  } catch (error) {
    console.error('List conversations error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
