// app/api/users/list/route.ts
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('anchorproof-session')?.value;

    if (!userId) {
      return NextResponse.json({ 
        error: 'Unauthorized',
        users: [],
        authenticated: false
      }, { status: 401 });
    }

    // Get the current user to get their tenantId
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { tenantId: true },
    });

    if (!currentUser) {
      const response = NextResponse.json({ 
        error: 'Session expired',
        users: [],
        authenticated: false
      }, { status: 401 });
      response.cookies.delete('anchorproof-session');
      return response;
    }

    // Get all users in the same tenant
    const users = await prisma.user.findMany({
      where: { tenantId: currentUser.tenantId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        tenantId: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ 
      success: true,
      users,
      authenticated: true
    });
  } catch (error) {
    console.error('GET /api/users/list error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        users: [],
        authenticated: false
      },
      { status: 500 }
    );
  }
}