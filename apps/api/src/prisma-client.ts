import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

let client: PrismaClient | null = null;

const globalForPrisma = globalThis as unknown as {
  __infamousPrismaClient?: PrismaClient;
};

export function createPrismaClient(): PrismaClient {
  if (client) return client;

  const shouldUseGlobalCache =
    process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'test';

  if (shouldUseGlobalCache && globalForPrisma.__infamousPrismaClient) {
    client = globalForPrisma.__infamousPrismaClient;
    return client;
  }

  const databaseUrl = process.env.DATABASE_URL;

  if (typeof databaseUrl !== 'string' || databaseUrl.trim().length === 0) {
    throw new Error('DATABASE_URL must be set to a non-empty PostgreSQL connection string.');
  }

  const adapter = new PrismaPg({ connectionString: databaseUrl });
  client = new PrismaClient({ adapter });

  if (shouldUseGlobalCache) {
    globalForPrisma.__infamousPrismaClient = client;
  }

  return client;
}
