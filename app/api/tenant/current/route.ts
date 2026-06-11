import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
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
      // Clear invalid cookie
      const response = NextResponse.json(
        { error: 'Session expired' },
        { status: 401 }
      );
      response.cookies.delete('anchorproof-session');
      return response;
    }

    return NextResponse.json({ tenant: user.tenant, user });
  } catch (error) {
    console.error('GET /api/tenant/current error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
