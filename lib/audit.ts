// lib/audit.ts
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

export type AuditAction = 
  | 'CONVERSATION_SAVED'
  | 'CONVERSATION_VERIFIED'
  | 'BLOB_RETRIEVED'
  | 'API_KEY_CREATED'
  | 'API_KEY_REVOKED'
  | 'TENANT_UPDATED'
  | 'USER_LOGIN'
  | 'USER_LOGOUT'
  | 'TAMPER_DETECTED'
  | 'VERIFICATION_FAILED'
  | 'REPORT_GENERATED'
  | 'REPORT_DELETED';

export interface AuditLogData {
  action: AuditAction;
  blobId?: string;
  conversationId?: string;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

export async function createAuditLog(data: AuditLogData) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('anchorproof-session')?.value;

    if (!userId) {
      console.warn('No user session found, skipping audit log');
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { 
        tenantId: true, 
        name: true, 
        email: true 
      },
    });

    if (!user) {
      console.warn('User not found, skipping audit log');
      return;
    }

    await prisma.auditLog.create({
      data: {
        tenantId: user.tenantId,
        action: data.action,
        actorId: userId,
        actorName: user.name || undefined,
        actorEmail: user.email || undefined,
        blobId: data.blobId,
        conversationId: data.conversationId,
        details: data.details || undefined,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
      },
    });

    console.log(`✅ Audit log created: ${data.action}`);
  } catch (error) {
    console.error('Failed to create audit log:', error);
  }
}

// For server-side usage without cookies (e.g., from webhooks)
export async function createAuditLogWithUser(
  userId: string,
  data: AuditLogData
) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { 
        tenantId: true, 
        name: true, 
        email: true 
      },
    });

    if (!user) {
      console.warn('User not found, skipping audit log');
      return;
    }

    await prisma.auditLog.create({
      data: {
        tenantId: user.tenantId,
        action: data.action,
        actorId: userId,
        actorName: user.name || undefined,
        actorEmail: user.email || undefined,
        blobId: data.blobId,
        conversationId: data.conversationId,
        details: data.details || undefined,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
      },
    });

    console.log(`✅ Audit log created: ${data.action}`);
  } catch (error) {
    console.error('Failed to create audit log:', error);
  }
}