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

    if (!user) {
      const response = NextResponse.json(
        { error: 'User not found' },
        { status: 401 }
      );
      response.cookies.delete('anchorproof-session');
      return response;
    }

    const apiKeys = await prisma.apiKey.findMany({
      where: { tenantId: user.tenantId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        role: true,
        createdAt: true,
        expiresAt: true,
        lastUsedAt: true,
      },
    });

    // Add cache control headers
    return NextResponse.json(
      { keys: apiKeys || [] },
      {
        headers: {
          'Cache-Control':
            'no-store, no-cache, must-revalidate, proxy-revalidate',
          Pragma: 'no-cache',
          Expires: '0',
        },
      }
    );
  } catch (error) {
    console.error('API keys fetch error:', error);
    return NextResponse.json({ keys: [] }, { status: 500 });
  }
}
