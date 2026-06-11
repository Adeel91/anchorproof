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

    // Use a broad query to get all memories (empty string not allowed)
    const result = await memwal.recall({ 
      query: "conversation loan approval",  // Broad term to match most content
      limit: 100 
    });
    
    const conversations = result.results.map((r: any) => {
      let parsed;
      try {
        parsed = JSON.parse(r.text);
      } catch {
        parsed = { content: r.text };
      }
      
      return {
        blobId: r.blob_id || r.id,
        content: parsed.content || r.text,
        userId: parsed.userId,
        userEmail: parsed.userEmail,
        userRole: parsed.userRole,
        tenantId: parsed.tenantId,
        tenantName: parsed.tenantName,
        tenantEmailDomain: parsed.tenantEmailDomain,
        conversationId: parsed.conversationId,
        timestamp: parsed.timestamp,
        source: parsed.source,
        similarityScore: r.distance,
        createdAt: r.created_at,
      };
    });
    
    return NextResponse.json({ 
      success: true, 
      count: conversations.length,
      conversations,
    });
  } catch (error) {
    console.error('Fetch conversations error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}