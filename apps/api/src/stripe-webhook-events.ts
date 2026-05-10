import { PrismaClient } from '@prisma/client';
import { createPrismaClient } from './prisma-client';

export type StripeWebhookEventStatus = 'received' | 'processed' | 'failed' | 'ignored';

export type StripeWebhookEventInput = {
  eventId: string;
  eventType: string;
  carrierId?: string | null;
  status: StripeWebhookEventStatus;
  errorMessage?: string | null;
  processedAt?: Date | null;
};

interface StripeWebhookEventStore {
  upsert(input: StripeWebhookEventInput): Promise<void>;
  findByEventId(eventId: string): Promise<{ status: StripeWebhookEventStatus } | null>;
}

class MemoryStripeWebhookEventStore implements StripeWebhookEventStore {
  private events = new Map<string, StripeWebhookEventInput>();

  async upsert(input: StripeWebhookEventInput): Promise<void> {
    const current = this.events.get(input.eventId);
    this.events.set(input.eventId, {
      ...current,
      ...input,
    });
  }

  async findByEventId(eventId: string): Promise<{ status: StripeWebhookEventStatus } | null> {
    const entry = this.events.get(eventId);
    return entry ? { status: entry.status } : null;
  }
}

class PrismaStripeWebhookEventStore implements StripeWebhookEventStore {
  constructor(private readonly prisma: PrismaClient) {}

  async upsert(input: StripeWebhookEventInput): Promise<void> {
    await this.prisma.stripeWebhookEvent.upsert({
      where: { eventId: input.eventId },
      create: {
        eventId: input.eventId,
        eventType: input.eventType,
        carrierId: input.carrierId,
        status: input.status,
        errorMessage: input.errorMessage,
        processedAt: input.processedAt,
      },
      update: {
        eventType: input.eventType,
        carrierId: input.carrierId,
        status: input.status,
        errorMessage: input.errorMessage,
        processedAt: input.processedAt,
      },
    });
  }

  async findByEventId(eventId: string): Promise<{ status: StripeWebhookEventStatus } | null> {
    const row = await this.prisma.stripeWebhookEvent.findUnique({
      where: { eventId },
      select: { status: true },
    });
    return row ? { status: row.status as StripeWebhookEventStatus } : null;
  }
}

let prismaClient: PrismaClient | null = null;
let memoryStore: MemoryStripeWebhookEventStore | null = null;

export function createStripeWebhookEventStore(): StripeWebhookEventStore {
  if (process.env.NODE_ENV === 'test') {
    memoryStore ??= new MemoryStripeWebhookEventStore();
    return memoryStore;
  }

  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is required outside of test mode.');
  }

  prismaClient ??= createPrismaClient();
  return new PrismaStripeWebhookEventStore(prismaClient);
}
