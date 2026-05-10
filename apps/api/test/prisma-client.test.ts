describe('createPrismaClient', () => {
  const originalDatabaseUrl = process.env.DATABASE_URL;

  afterEach(() => {
    process.env.DATABASE_URL = originalDatabaseUrl;
    jest.resetModules();
    jest.clearAllMocks();
  });

  test('throws when DATABASE_URL is missing', () => {
    delete process.env.DATABASE_URL;

    jest.doMock('@prisma/client', () => ({
      PrismaClient: jest.fn(),
    }));

    jest.doMock('@prisma/adapter-pg', () => ({
      PrismaPg: jest.fn(),
    }));

    const { createPrismaClient } = require('../src/prisma-client') as typeof import('../src/prisma-client');

    expect(() => createPrismaClient()).toThrow(
      'DATABASE_URL must be set to a non-empty PostgreSQL connection string.',
    );
  });

  test('creates prisma client with PrismaPg adapter using DATABASE_URL', () => {
    process.env.DATABASE_URL = 'postgres://example';

    const prismaInstance = { marker: 'default-prisma-client' };
    const adapterInstance = { marker: 'pg-adapter' };

    const PrismaClient = jest.fn(() => prismaInstance);
    const PrismaPg = jest.fn(() => adapterInstance);

    jest.doMock('@prisma/client', () => ({ PrismaClient }));
    jest.doMock('@prisma/adapter-pg', () => ({ PrismaPg }));

    const { createPrismaClient } = require('../src/prisma-client') as typeof import('../src/prisma-client');

    expect(createPrismaClient()).toBe(prismaInstance);
    expect(createPrismaClient()).toBe(prismaInstance);
    expect(PrismaPg).toHaveBeenCalledWith({ connectionString: 'postgres://example' });
    expect(PrismaClient).toHaveBeenCalledWith({ adapter: adapterInstance });
  });
});
