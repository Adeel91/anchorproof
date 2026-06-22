import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  analyzeConversation,
  verifyConversation,
  deleteConversation,
} from '@/lib/agentic/core';
import {
  setAgentRunning,
  updateLastRun,
  getAgentStatus,
} from '@/lib/agentic/status';

export const runtime = 'nodejs';
export const maxDuration = 300;

interface AnalysisLog {
  conversationId: string;
  status: 'pending' | 'analyzing' | 'verified' | 'deleted' | 'held' | 'error';
  decision?: {
    reason: string;
    confidence: number;
    riskScore: number;
    complianceScore: number;
    categories: string[];
  };
  messageCount: number;
  timestamp: string;
}

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
  } catch {
    return null;
  }
}

async function getDefaultCustomerId(tenantId: string): Promise<string> {
  try {
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { name: true },
    });

    if (tenant?.name) {
      return `agentic-${tenant.name.toLowerCase().replace(/\s+/g, '-')}`;
    }
    return 'agentic-verified';
  } catch {
    return 'agentic-verified';
  }
}

export async function POST(request: Request) {
  const tenantId = await getTenantId(request);

  if (!tenantId) {
    return NextResponse.json(
      { error: 'Unauthorized: No tenant found' },
      { status: 401 }
    );
  }

  setAgentRunning(true);
  const logs = await runAgenticCycle(tenantId);

  return NextResponse.json({
    message: 'Agentic agent started',
    logs,
    status: getAgentStatus(),
  });
}

export async function GET(request: Request) {
  const tenantId = await getTenantId(request);

  if (!tenantId) {
    return NextResponse.json(
      { error: 'Unauthorized: No tenant found' },
      { status: 401 }
    );
  }

  const logs = await runAgenticCycle(tenantId);

  return NextResponse.json({
    message: 'Agentic agent run completed',
    logs,
    status: getAgentStatus(),
  });
}

export async function DELETE() {
  setAgentRunning(false);

  return NextResponse.json({
    message: 'Agentic agent stopped',
    status: getAgentStatus(),
  });
}

async function runAgenticCycle(tenantId: string): Promise<AnalysisLog[]> {
  const logs: AnalysisLog[] = [];
  const defaultCustomerId = await getDefaultCustomerId(tenantId);

  try {
    const unverifiedResult = await prisma.$queryRaw<
      {
        tenantId: string;
        conversationId: string;
        lastMessageAt: Date;
        messageCount: bigint;
      }[]
    >`
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

    if (unverifiedResult.length === 0) {
      updateLastRun();
      return logs;
    }

    let verified = 0;
    let deleted = 0;
    let held = 0;

    for (const conv of unverifiedResult) {
      try {
        const messages = await prisma.$queryRaw<
          {
            role: string;
            content: string;
            signature: string;
            publicKey: string;
          }[]
        >`
          SELECT "role", "content", "signature", "publicKey"
          FROM "TempMessage"
          WHERE "tenantId" = ${conv.tenantId}
            AND "conversationId" = ${conv.conversationId}
          ORDER BY "createdAt" ASC
        `;

        if (messages.length === 0) continue;

        const decision = await analyzeConversation(messages);

        if (decision.shouldVerify) {
          await verifyConversation({
            tenantId: conv.tenantId,
            conversationId: conv.conversationId,
            customerId: defaultCustomerId,
            agentId: 'anchorproof-agent',
            signature: messages[0]?.signature || '',
            messages,
            autoVerified: true,
            decision,
          });
          verified++;

          logs.push({
            conversationId: conv.conversationId,
            status: 'verified',
            decision: {
              reason: decision.reason,
              confidence: decision.confidence,
              riskScore: decision.riskScore,
              complianceScore: decision.complianceScore,
              categories: decision.categories,
            },
            messageCount: Number(conv.messageCount),
            timestamp: new Date().toISOString(),
          });
        } else if (decision.shouldDelete) {
          await deleteConversation({
            tenantId: conv.tenantId,
            conversationId: conv.conversationId,
            customerId: defaultCustomerId,
            agentId: 'anchorproof-agent',
            messages,
            decision,
          });
          deleted++;

          logs.push({
            conversationId: conv.conversationId,
            status: 'deleted',
            decision: {
              reason: decision.reason,
              confidence: decision.confidence,
              riskScore: decision.riskScore,
              complianceScore: decision.complianceScore,
              categories: decision.categories,
            },
            messageCount: Number(conv.messageCount),
            timestamp: new Date().toISOString(),
          });
        } else {
          held++;
          logs.push({
            conversationId: conv.conversationId,
            status: 'held',
            decision: {
              reason: decision.reason,
              confidence: decision.confidence,
              riskScore: decision.riskScore,
              complianceScore: decision.complianceScore,
              categories: decision.categories,
            },
            messageCount: Number(conv.messageCount),
            timestamp: new Date().toISOString(),
          });
        }
      } catch (error) {
        logs.push({
          conversationId: conv.conversationId,
          status: 'error',
          decision: {
            reason: error instanceof Error ? error.message : 'Unknown error',
            confidence: 0,
            riskScore: 0,
            complianceScore: 0,
            categories: ['error'],
          },
          messageCount: Number(conv.messageCount),
          timestamp: new Date().toISOString(),
        });
      }
    }

    updateLastRun();

    logs.push({
      conversationId: '--- SUMMARY ---',
      status: 'verified',
      decision: {
        reason: `Analysis complete: ${verified} verified, ${deleted} deleted, ${held} held`,
        confidence: 100,
        riskScore: 0,
        complianceScore: 100,
        categories: ['summary'],
      },
      messageCount: 0,
      timestamp: new Date().toISOString(),
    });

    return logs;
  } catch (error) {
    logs.push({
      conversationId: 'Error',
      status: 'error',
      decision: {
        reason: error instanceof Error ? error.message : 'Unknown error',
        confidence: 0,
        riskScore: 0,
        complianceScore: 0,
        categories: ['error'],
      },
      messageCount: 0,
      timestamp: new Date().toISOString(),
    });
    updateLastRun();
    return logs;
  }
}
