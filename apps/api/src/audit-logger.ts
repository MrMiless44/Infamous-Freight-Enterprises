import { PrismaClient } from '@prisma/client';

export type AuditEntry = {
  entityType: string;
  entityId: string;
  action: string;
  userId: string;
  userName: string;
  details?: string;
  requestId?: string;
};

export interface AuditLogger {
  log(entry: AuditEntry): Promise<void>;
}

class PrismaAuditLogger implements AuditLogger {
  constructor(private readonly prisma: PrismaClient) {}

  async log(entry: AuditEntry): Promise<void> {
    try {
      await this.prisma.auditLog.create({
        data: {
          entityType: entry.entityType,
          entityId: entry.entityId,
          action: entry.action,
          userId: entry.userId,
          userName: entry.userName,
          details: entry.details
            ? (entry.requestId ? `${entry.details} [rid:${entry.requestId}]` : entry.details)
            : (entry.requestId ? `[rid:${entry.requestId}]` : undefined),
        },
      });
    } catch {
      // Audit logging is best-effort; never block the main operation.
    }
  }
}

class NoopAuditLogger implements AuditLogger {
  async log(): Promise<void> {}
}

export function createAuditLogger(prisma: PrismaClient | null): AuditLogger {
  if (!prisma) return new NoopAuditLogger();
  return new PrismaAuditLogger(prisma);
}
