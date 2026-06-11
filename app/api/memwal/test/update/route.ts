import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { getMemWalClient } from '@/lib/memwal/client';

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

    if (!user || !user.tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }

    const memwal = getMemWalClient(`tenant_${user.tenant.id}`);

    // Get all pending verifications
    const pendingVerifications = await prisma.verification.findMany({
      where: { 
        tenantId: user.tenant.id,
        suiTxHash: 'pending',
      },
    });

    const results = [];

    for (const verification of pendingVerifications) {
      try {
        // Try to recall by blobId or conversationId
        const result = await memwal.recall({
          query: verification.conversationId,
          limit: 1,
        });
        
        if (result.results.length > 0) {
          const memory = result.results[0];
          const blobId = (memory as any).blob_id;
          
          // Update the record with real blobId
          const updated = await prisma.verification.update({
            where: { id: verification.id },
            data: {
              blobId: blobId || verification.blobId,
              suiTxHash: 'completed',
            },
          });
          
          results.push({
            id: verification.id,
            status: 'updated',
            blobId: blobId,
          });
        } else {
          results.push({
            id: verification.id,
            status: 'not_found_yet',
          });
        }
      } catch (err) {
        results.push({
          id: verification.id,
          status: 'error',
          error: String(err),
        });
      }
    }

    return NextResponse.json({
      success: true,
      updated: results.filter(r => r.status === 'updated').length,
      total: pendingVerifications.length,
      results,
    });
  } catch (error) {
    console.error('Update error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}