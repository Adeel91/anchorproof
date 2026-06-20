import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('anchorproof-session')?.value;

    if (!userId) {
      return NextResponse.json(
        {
          error: 'Unauthorized',
          tenant: null,
          user: null,
          authenticated: false,
        },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { tenant: true },
    });

    if (!user) {
      const response = NextResponse.json(
        {
          error: 'Session expired',
          tenant: null,
          user: null,
          authenticated: false,
        },
        { status: 401 }
      );
      response.cookies.delete('anchorproof-session');
      return response;
    }

    return NextResponse.json({
      tenant: user.tenant,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      authenticated: true,
    });
  } catch (error) {
    console.error('GET /api/tenant/current error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        tenant: null,
        user: null,
        authenticated: false,
      },
      { status: 500 }
    );
  }
}
