// app/api/keys/revoke/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

export async function DELETE(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('anchorproof-session')?.value;

    console.log('=== API Key Revoke ===');
    console.log('userId from cookie:', userId);

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized - No session' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { tenant: true },
    });

    console.log('User found:', !!user);
    console.log('User tenantId:', user?.tenantId);

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 401 }
      );
    }

    if (!user.tenant) {
      return NextResponse.json(
        { error: 'User has no tenant' },
        { status: 401 }
      );
    }

    const url = new URL(request.url);
    const keyId = url.searchParams.get('id');

    console.log('Key ID to revoke:', keyId);

    if (!keyId) {
      return NextResponse.json(
        { error: 'Key ID is required' },
        { status: 400 }
      );
    }

    const key = await prisma.apiKey.findFirst({
      where: {
        id: keyId,
        tenantId: user.tenantId,
      },
    });

    if (!key) {
      return NextResponse.json(
        { error: 'API key not found' },
        { status: 404 }
      );
    }

    await prisma.apiKey.delete({
      where: { id: keyId },
    });

    console.log('✅ API Key revoked:', keyId);

    return NextResponse.json({
      success: true,
      message: 'API key revoked successfully',
    });
  } catch (error) {
    console.error('API key revoke error:', error);
    return NextResponse.json(
      { error: 'Failed to revoke API key' },
      { status: 500 }
    );
  }
}