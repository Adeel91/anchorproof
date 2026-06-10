import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const tenantCount = await prisma.tenant.count();
    return NextResponse.json({ success: true, tenantCount });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
