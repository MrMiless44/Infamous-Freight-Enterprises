import { PrismaClient } from '@prisma/client';

type AccelerateExtension = Parameters<PrismaClient['$extends']>[0];

let client: PrismaClient | null = null;

const globalForPrisma = globalThis as unknown as {
  __infamousPrismaClient?: PrismaClient;
};

function loadAccelerateExtension(): (() => AccelerateExtension) | null {
  try {
    const accelerateModule = require('@prisma/extension-accelerate') as {
      withAccelerate?: () => AccelerateExtension;
    };
    return typeof accelerateModule.withAccelerate === 'function'
      ? accelerateModule.withAccelerate
      : null;
  } catch {
    return null;
  }
}

export function createPrismaClient(): PrismaClient {
  if (client) return client;

  const shouldUseGlobalCache =
    process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'test';

  if (shouldUseGlobalCache && globalForPrisma.__infamousPrismaClient) {
    client = globalForPrisma.__infamousPrismaClient;
    return client;
  }

  const databaseUrl = process.env.DATABASE_URL;

  if (typeof databaseUrl === 'string' && databaseUrl.trim().length === 0) {
    throw new Error('DATABASE_URL is set but empty.');
  }

  const useAccelerate = typeof databaseUrl === 'string' && databaseUrl.startsWith('prisma+postgres://');

  if (useAccelerate) {
    const withAccelerate = loadAccelerateExtension();

    if (!withAccelerate) {
      throw new Error(
        'DATABASE_URL is configured for Prisma Accelerate, but @prisma/extension-accelerate is not installed.',
      );
    }

    client = new PrismaClient().$extends(withAccelerate()) as unknown as PrismaClient;

    if (shouldUseGlobalCache) {
      globalForPrisma.__infamousPrismaClient = client;
    }

    return client;
  }

  client = new PrismaClient();

  if (shouldUseGlobalCache) {
    globalForPrisma.__infamousPrismaClient = client;
  }

  return client;
}
