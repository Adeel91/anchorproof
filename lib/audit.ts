import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export type AuditAction =
  | 'CONVERSATION_SAVED'
  | 'CONVERSATION_VERIFIED'
  | 'BLOB_RETRIEVED'
  | 'API_KEY_CREATED'
  | 'API_KEY_REVOKED'
  | 'TENANT_CREATED'
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
  tenantId: string;
  details?: Prisma.InputJsonValue;
  ipAddress?: string;
  userAgent?: string;
}

export async function createAuditLog(data: AuditLogData) {
  try {
    if (!data.tenantId) {
      console.warn('No tenantId provided, cannot create audit log');
      return null;
    }

    const auditLog = await prisma.auditLog.create({
      data: {
        tenantId: data.tenantId,
        action: data.action,
        blobId: data.blobId,
        conversationId: data.conversationId,
        details: data.details || {},
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
      },
    });

    return auditLog;
  } catch (error) {
    console.error('Failed to create audit log:', error);
    return null;
  }
}

export function createAuditLogAsync(data: AuditLogData): void {
  createAuditLog(data).catch((error) => {
    console.error('Background audit log failed:', error);
  });
}

export async function getAuditLogs(params: {
  tenantId: string;
  conversationId?: string;
  blobId?: string;
  action?: AuditAction;
  limit?: number;
  offset?: number;
  startDate?: Date;
  endDate?: Date;
}) {
  try {
    const {
      tenantId,
      conversationId,
      blobId,
      action,
      limit = 50,
      offset = 0,
      startDate,
      endDate,
    } = params;

    const where: Prisma.AuditLogWhereInput = { tenantId };
    if (conversationId) where.conversationId = conversationId;
    if (blobId) where.blobId = blobId;
    if (action) where.action = action;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.auditLog.count({ where }),
    ]);

    return {
      logs,
      total,
      limit,
      offset,
    };
  } catch (error) {
    console.error('Failed to get audit logs:', error);
    return { logs: [], total: 0, limit: 50, offset: 0 };
  }
}
