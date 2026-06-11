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

    const conversationData = {
      content: "Loan approved at 5.2% APR for customer ID 12345",
      userId: user.id,
      userEmail: 'test@gmail.com', // user.email,
      userRole: user.role,
      tenantId: user.tenant.id,
      tenantName: user.tenant.name,
      tenantEmailDomain: user.tenant.emailDomain,
      conversationId: `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      source: "anchorproof-store",
    };

    // Use rememberAndWait
    const finalResult = await memwal.rememberAndWait(JSON.stringify(conversationData));
    
    console.log('FINAL RESULT:', JSON.stringify(finalResult, null, 2));
    
    const blobId = (finalResult as any)?.blob_id || 'pending';
    const txHash = (finalResult as any)?.tx_hash || 'pending';
    
    console.log('Extracted blobId:', blobId);
    console.log('Extracted txHash:', txHash);
    
    const verification = await prisma.verification.create({
      data: {
        tenantId: user.tenant.id,
        conversationId: conversationData.conversationId,
        blobId: blobId,
        suiTxHash: txHash,
        customerId: "cust_12345",
        agentId: "loan_agent",
        modelUsed: "gpt-4",
        messageCount: 1,
        metadata: conversationData,
      },
    });
    
    return NextResponse.json({ 
      success: true, 
      verificationId: verification.id,
      blobId: blobId,
      txHash: txHash,
    });
  } catch (error) {
    console.error('Store error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}