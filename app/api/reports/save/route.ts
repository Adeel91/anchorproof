// app/api/reports/save/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { createAuditLog } from '@/lib/audit';
import crypto from 'crypto';

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

    const { name, type, conversationId, summary, size } = await request.json();

    if (!name || !type) {
      return NextResponse.json(
        { error: 'Name and type are required' },
        { status: 400 }
      );
    }

    // Generate a hash of the report data for verification
    const hashData = JSON.stringify({
      name,
      type,
      conversationId,
      summary,
      generatedBy: user.email || user.name || 'Admin',
      generatedAt: new Date().toISOString(),
      tenantId: user.tenantId,
    });
    const hash = crypto.createHash('sha256').update(hashData).digest('hex');

    const report = await prisma.report.create({
      data: {
        tenantId: user.tenantId,
        name,
        type,
        generatedBy: user.email || user.name || 'Admin',
        conversationId: conversationId || null,
        summary: summary || null,
        hash,
        size: size || 0,
        status: 'ready',
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      },
    });

    await createAuditLog({
      action: 'REPORT_GENERATED',
      details: {
        reportId: report.id,
        reportName: name,
        type: type,
        conversationId: conversationId || null,
      },
    });

    return NextResponse.json({
      success: true,
      report,
    });
  } catch (error) {
    console.error('Save report error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to save report' },
      { status: 500 }
    );
  }
}