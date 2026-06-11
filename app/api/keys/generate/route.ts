import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
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
        { error: 'User not found' },
        { status: 401 }
      );
      response.cookies.delete('anchorproof-session');
      return response;
    }

    const { name, expiresInDays = 90 } = await request.json();

    // Generate secure API key
    const apiKey = `anchor_${crypto.randomBytes(32).toString('hex')}`;
    const keyHash = crypto.createHash('sha256').update(apiKey).digest('hex');

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);

    const newKey = await prisma.apiKey.create({
      data: {
        tenantId: user.tenantId,
        keyHash: keyHash,
        name: name || `API Key ${new Date().toLocaleDateString()}`,
        role: 'admin',
        expiresAt: expiresAt,
      },
    });

    return NextResponse.json({
      success: true,
      apiKey: apiKey,
      key: {
        id: newKey.id,
        name: newKey.name,
        createdAt: newKey.createdAt,
        expiresAt: newKey.expiresAt,
      },
    });
  } catch (error) {
    console.error('API key generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate API key' },
      { status: 500 }
    );
  }
}
