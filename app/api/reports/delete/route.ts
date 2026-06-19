// app/api/reports/delete/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { createAuditLogAsync } from '@/lib/audit';

export async function DELETE(request: NextRequest) {
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

    const url = new URL(request.url);
    const reportId = url.searchParams.get('id');

    if (!reportId) {
      return NextResponse.json(
        { error: 'Report ID is required' },
        { status: 400 }
      );
    }

    const report = await prisma.report.findFirst({
      where: {
        id: reportId,
        tenantId: user.tenant.id,
      },
    });

    if (!report) {
      return NextResponse.json(
        { error: 'Report not found' },
        { status: 404 }
      );
    }

    await prisma.report.delete({
      where: { id: reportId },
    });

    createAuditLogAsync({
      action: 'REPORT_DELETED',
      tenantId: user.tenant.id,
      details: {
        actorId: user.id,
        actorName: user.name || 'Unknown',
        actorEmail: user.email || 'Unknown',
        reportId: report.id,
        reportName: report.name,
        reportType: report.type,
        reportSize: report.size,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Report deleted successfully',
    });
  } catch (error) {
    console.error('Delete report error:', error);
    return NextResponse.json(
      { error: 'Failed to delete report' },
      { status: 500 }
    );
  }
}