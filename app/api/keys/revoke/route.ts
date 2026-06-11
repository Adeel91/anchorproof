import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

export async function DELETE(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('anchorproof-session')?.value;
    const { searchParams } = new URL(request.url);
    const keyId = searchParams.get('id');

    if (!userId || !keyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // First find the user
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      // Clear invalid cookie
      const response = NextResponse.json(
        { error: 'User not found' },
        { status: 401 }
      );
      response.cookies.delete('anchorproof-session');
      return response;
    }

    // Verify the key belongs to this user's tenant
    const apiKey = await prisma.apiKey.findFirst({
      where: {
        id: keyId,
        tenantId: user.tenantId,
      },
    });

    if (!apiKey) {
      return NextResponse.json({ error: 'API key not found' }, { status: 404 });
    }

    await prisma.apiKey.delete({
      where: { id: keyId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('API key revoke error:', error);
    return NextResponse.json(
      { error: 'Failed to revoke API key' },
      { status: 500 }
    );
  }
}
