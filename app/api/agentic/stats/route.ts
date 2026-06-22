import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAgentStatus } from '@/lib/agentic/status';

async function getTenantId(request: Request): Promise<string | null> {
  try {
    const cookie = request.headers.get('cookie') || '';
    const sessionMatch = cookie.match(/anchorproof-session=([^;]+)/);
    if (!sessionMatch) return null;

    const sessionId = sessionMatch[1];

    const user = await prisma.user.findFirst({
      where: { id: sessionId },
      include: { tenant: true },
    });

    return user?.tenantId || null;
  } catch (error) {
    console.error('Error getting tenant ID:', error);
    return null;
  }
}

interface PendingConversation {
  tenantId: string;
  conversationId: string;
  lastMessageAt: Date;
  messageCount: bigint;
}

interface AgenticDecision {
  shouldVerify: boolean;
  shouldDelete: boolean;
  reason: string;
  confidence: number;
  riskScore: number;
  complianceScore: number;
  categories: string[];
}

interface VerificationMetadata {
  agenticDecision?: AgenticDecision;
}

export async function GET(request: Request) {
  try {
    const tenantId = await getTenantId(request);

    if (!tenantId) {
      return NextResponse.json(
        { error: 'Unauthorized: No tenant found' },
        { status: 401 }
      );
    }

    const status = getAgentStatus();

    const agenticVerified = await prisma.verification.findMany({
      where: {
        tenantId: tenantId,
        metadata: {
          path: ['verifiedBy'],
          equals: 'agentic-agent',
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
      select: {
        conversationId: true,
        blobId: true,
        suiTxHash: true,
        createdAt: true,
        customerId: true,
        messageCount: true,
        metadata: true,
      },
    });

    let pendingCount = 0;
    let pendingConversations: PendingConversation[] = [];

    try {
      const pendingResult = await prisma.$queryRaw<PendingConversation[]>`
        SELECT 
          t."tenantId",
          t."conversationId",
          MAX(t."createdAt") as "lastMessageAt",
          COUNT(*) as "messageCount"
        FROM "TempMessage" t
        LEFT JOIN "Verification" v ON t."conversationId" = v."conversationId" 
          AND t."tenantId" = v."tenantId"
        WHERE v."id" IS NULL
          AND t."tenantId" = ${tenantId}
        GROUP BY t."tenantId", t."conversationId"
      `;

      pendingCount = pendingResult.length;
      pendingConversations = pendingResult;
    } catch (error) {
      console.error('Error counting pending conversations:', error);
      pendingCount = 0;
    }

    let totalConfidence = 0;
    let confidenceCount = 0;
    const categories: Record<string, number> = {};

    agenticVerified.forEach((item) => {
      if (item.metadata && typeof item.metadata === 'object') {
        const metadata = item.metadata as VerificationMetadata;
        if (metadata.agenticDecision) {
          const decision = metadata.agenticDecision;

          if (decision.confidence) {
            totalConfidence += decision.confidence;
            confidenceCount++;
          }

          if (decision.categories && Array.isArray(decision.categories)) {
            decision.categories.forEach((cat: string) => {
              categories[cat] = (categories[cat] || 0) + 1;
            });
          }
        }
      }
    });

    const averageConfidence =
      confidenceCount > 0 ? Math.round(totalConfidence / confidenceCount) : 0;

    return NextResponse.json({
      status: status.running ? 'running' : 'stopped',
      lastRun: status.lastRun,
      conversationsVerified: agenticVerified.length,
      pendingCount: pendingCount,
      pendingConversations: pendingConversations.slice(0, 10).map((item) => ({
        conversationId: item.conversationId,
        lastMessageAt: item.lastMessageAt,
        messageCount: Number(item.messageCount),
      })),
      decisions: {
        averageConfidence: averageConfidence,
        categories: categories,
      },
      recentActivity: agenticVerified.slice(0, 20).map((item) => {
        let decision = null;
        if (item.metadata && typeof item.metadata === 'object') {
          const metadata = item.metadata as VerificationMetadata;
          if (metadata.agenticDecision) {
            decision = metadata.agenticDecision;
          }
        }
        return {
          conversationId: item.conversationId,
          blobId: item.blobId,
          suiTxHash: item.suiTxHash,
          verifiedAt: item.createdAt,
          customerId: item.customerId || 'N/A',
          messageCount: item.messageCount || 0,
          decision: decision,
        };
      }),
      config: {
        mode: 'AI-Powered',
        criteria: [
          'Sensitive information detection',
          'Business value assessment',
          'Compliance requirements',
          'Risk analysis',
          'Customer intent understanding',
        ],
      },
    });
  } catch (error) {
    console.error('Failed to get agentic stats:', error);
    return NextResponse.json(
      { error: 'Failed to get agentic stats' },
      { status: 500 }
    );
  }
}
