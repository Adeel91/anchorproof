import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { createAuditLogAsync } from '@/lib/audit';

export async function PUT(request: NextRequest) {
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

    if (!user) {
      const response = NextResponse.json(
        { error: 'User not found' },
        { status: 401 }
      );
      response.cookies.delete('anchorproof-session');
      return response;
    }

    if (!user.tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }

    const { name } = await request.json();

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Tenant name is required' },
        { status: 400 }
      );
    }

    if (user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const oldName = user.tenant.name;

    const updatedTenant = await prisma.tenant.update({
      where: { id: user.tenantId },
      data: { name: name.trim() },
    });

    createAuditLogAsync({
      action: 'TENANT_UPDATED',
      tenantId: user.tenantId,
      details: {
        actorId: user.id,
        actorName: user.name || 'Unknown',
        actorEmail: user.email || 'Unknown',
        oldName: oldName,
        newName: name.trim(),
      },
    });

    return NextResponse.json({
      success: true,
      tenant: updatedTenant,
      message: 'Tenant updated successfully',
    });
  } catch (error) {
    console.error('Update tenant error:', error);
    return NextResponse.json(
      { error: 'Failed to update tenant' },
      { status: 500 }
    );
  }
}
