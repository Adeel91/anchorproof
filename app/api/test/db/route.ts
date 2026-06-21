import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const tenantCount = await prisma.tenant.count();
    const apiKeyCount = await prisma.apiKey.count();
    const userCount = await prisma.user.count();

    return NextResponse.json({
      status: 'ok',
      counts: {
        tenants: tenantCount,
        apiKeys: apiKeyCount,
        users: userCount,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
