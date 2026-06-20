import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('anchorproof-session')?.value;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { oldBlobId, newBlobId } = await request.json();

    if (!oldBlobId || !newBlobId) {
      return NextResponse.json(
        { error: 'Both oldBlobId and newBlobId are required' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { tenant: true },
    });

    if (!user || !user.tenant) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await prisma.verification.updateMany({
      where: {
        blobId: oldBlobId,
        tenantId: user.tenant.id,
      },
      data: {
        blobId: newBlobId,
      },
    });

    if (result.count === 0) {
      return NextResponse.json(
        {
          error: 'No record found with that blobId',
          oldBlobId,
          tenantId: user.tenant.id,
        },
        { status: 404 }
      );
    }

    const updatedRecord = await prisma.verification.findFirst({
      where: {
        blobId: newBlobId,
        tenantId: user.tenant.id,
      },
    });

    return NextResponse.json({
      success: true,
      updated: result.count,
      oldBlobId,
      newBlobId,
      record: updatedRecord,
    });
  } catch (error) {
    console.error('Update blob error:', error);
    return NextResponse.json(
      {
        error: String(error),
        message: 'Failed to update blob ID',
      },
      { status: 500 }
    );
  }
}
