import request from 'supertest';
import { createHmac } from 'crypto';
import { createApp } from '../src/app';
import * as dataStoreModule from '../src/data-store';
import { resetRateLimitBucketsForTests } from '../src/rate-limit';

function signJwt(
  claims: Record<string, unknown>,
  secret = 'test-supabase-jwt-secret',
  header: Record<string, unknown> = { alg: 'HS256', typ: 'JWT' },
): string {
  const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
  const encodedClaims = Buffer.from(JSON.stringify(claims)).toString('base64url');
  const signature = createHmac('sha256', secret)
    .update(`${encodedHeader}.${encodedClaims}`)
    .digest('base64url');

  return `${encodedHeader}.${encodedClaims}.${signature}`;
}

afterEach(() => {
  resetRateLimitBucketsForTests();
  delete process.env.RATE_LIMIT_ENABLED;
  delete process.env.RATE_LIMIT_WINDOW_MS;
  delete process.env.RATE_LIMIT_MAX_REQUESTS;
  delete process.env.AUTH_MODE;
  delete process.env.ALLOW_UNSAFE_HEADER_AUTH;
  delete process.env.SUPABASE_JWT_SECRET;
  delete process.env.JWT_SECRET;
  delete process.env.AUTH_JWT_AUDIENCE;
  delete process.env.SUPABASE_JWT_AUDIENCE;
});

describe('health endpoint', () => {
  it('returns 200 and ok status on /health', async () => {
    const response = await request(createApp()).get('/health');

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('ok');
    expect(typeof response.body.timestamp).toBe('string');
    expect(response.body.services.api).toBe('running');
    expect(response.body.services.database).toBeDefined();
  });


  it('returns 200 with ok status on /health even when database is disconnected', async () => {
    const dataStore = dataStoreModule.createDataStore();
    dataStore.healthCheck = async () => 'disconnected';

    const createDataStoreSpy = jest.spyOn(dataStoreModule, 'createDataStore').mockReturnValue(dataStore);

    try {
      const response = await request(createApp()).get('/health');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('ok');
      expect(response.body.services.api).toBe('running');
      expect(response.body.services.database).toBe('disconnected');
    } finally {
      createDataStoreSpy.mockRestore();
    }
  });

  it('returns 200 and ok status on /api/health', async () => {
    const response = await request(createApp()).get('/api/health');

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('ok');
    expect(typeof response.body.timestamp).toBe('string');
  });

  it('returns 200 liveness response on /api/health/live', async () => {
    const response = await request(createApp()).get('/api/health/live');

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('ok');
    expect(typeof response.body.timestamp).toBe('string');
    expect(response.body.services.api).toBe('running');
    expect(response.body.services.database).toBeUndefined();
  });

  it('returns 200 liveness response on /health/live', async () => {
    const response = await request(createApp()).get('/health/live');

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('ok');
    expect(response.body.services.api).toBe('running');
  });
});

describe('rate limiting', () => {
  it('returns 429 after the configured API request limit is exceeded', async () => {
    process.env.RATE_LIMIT_ENABLED = 'true';
    process.env.RATE_LIMIT_WINDOW_MS = '60000';
    process.env.RATE_LIMIT_MAX_REQUESTS = '1';

    const app = createApp();

    const allowed = await request(app).get('/api/health');
    expect(allowed.status).toBe(200);

    const limited = await request(app).get('/api/health');
    expect(limited.status).toBe(429);
    expect(limited.header['retry-after']).toBeDefined();
    expect(limited.body.error).toBe('rate_limit_exceeded');
  });

  it('allows API requests when rate limiting is explicitly disabled', async () => {
    process.env.RATE_LIMIT_ENABLED = 'false';
    process.env.RATE_LIMIT_MAX_REQUESTS = '1';

    const app = createApp();

    const first = await request(app).get('/api/health');
    const second = await request(app).get('/api/health');

    expect(first.status).toBe(200);
    expect(second.status).toBe(200);
  });
});

describe('tenant-protected resource routes', () => {
  it('rejects /api/loads without tenant id', async () => {
    const response = await request(createApp())
      .get('/api/loads')
      .set('x-user-role', 'dispatcher')
      .set('x-subscription-status', 'active');

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('tenant_id_required');
  });

  it('rejects /api/loads without valid role', async () => {
    const response = await request(createApp())
      .get('/api/loads')
      .set('x-tenant-id', 'tenant-1');

    expect(response.status).toBe(403);
    expect(response.body.error).toBe('forbidden');
  });

  it('creates and lists records only for same tenant', async () => {
    const app = createApp();
    const shipmentForTenant1 = {
      reference: 'REF-1',
      brokerName: 'Broker One',
      originCity: 'Dallas',
      originState: 'TX',
      destCity: 'Austin',
      destState: 'TX',
      rate: 1500,
      weight: 12000,
      pickupDate: '2024-01-10',
      deliveryDate: '2024-01-11',
      equipmentType: 'dry_van',
    };
    const shipmentForTenant2 = {
      reference: 'REF-2',
      brokerName: 'Broker Two',
      originCity: 'Houston',
      originState: 'TX',
      destCity: 'San Antonio',
      destState: 'TX',
      rate: 1800,
      weight: 14000,
      pickupDate: '2024-01-12',
      deliveryDate: '2024-01-13',
      equipmentType: 'flatbed',
    };

    const createForT1 = await request(app)
      .post('/api/shipments')
      .set('x-tenant-id', 'tenant-1')
      .set('x-user-role', 'dispatcher')
      .set('x-subscription-status', 'active')
      .send(shipmentForTenant1);

    expect(createForT1.status).toBe(201);
    expect(createForT1.body.data.tenantId).toBe('tenant-1');

    const createForT2 = await request(app)
      .post('/api/shipments')
      .set('x-tenant-id', 'tenant-2')
      .set('x-user-role', 'dispatcher')
      .set('x-subscription-status', 'active')
      .send(shipmentForTenant2);

    expect(createForT2.status).toBe(201);
    expect(createForT2.body.data.tenantId).toBe('tenant-2');
    const listT1 = await request(app)
      .get('/api/shipments')
      .set('x-tenant-id', 'tenant-1')
      .set('x-user-role', 'dispatcher')
      .set('x-subscription-status', 'active');

    expect(listT1.status).toBe(200);
    expect(listT1.body.count).toBe(1);
    expect(listT1.body.data[0].reference).toBe('REF-1');
  });
});

describe('security headers', () => {
  it('includes required security headers on API responses', async () => {
    const response = await request(createApp()).get('/api/health');

    expect(response.headers['x-content-type-options']).toBe('nosniff');
    expect(response.headers['x-frame-options']).toBe('SAMEORIGIN');
    expect(response.headers['referrer-policy']).toBeDefined();
    expect(response.headers['cross-origin-opener-policy']).toBe('same-origin');
    expect(response.headers['cross-origin-resource-policy']).toBe('same-origin');
    expect(response.headers['cross-origin-embedder-policy']).toBe('require-corp');
    expect(response.headers['content-security-policy']).toBeDefined();
  });

  it('does not expose X-Powered-By header', async () => {
    const response = await request(createApp()).get('/api/health');

    expect(response.headers['x-powered-by']).toBeUndefined();
  });

  it('adds a request ID header to API responses', async () => {
    const response = await request(createApp())
      .get('/api/health')
      .set('x-request-id', 'trace-test-1');

    expect(response.headers['x-request-id']).toBe('trace-test-1');
  });

  it('includes request ID in error responses', async () => {
    const response = await request(createApp())
      .get('/api/loads')
      .set('x-request-id', 'trace-test-2');

    expect(response.status).toBe(400);
    expect(response.headers['x-request-id']).toBe('trace-test-2');
    expect(response.body.requestId).toBe('trace-test-2');
  });
});

describe('configuration safety', () => {
  it('fails fast without DATABASE_URL outside test mode', () => {
    const previousNodeEnv = process.env.NODE_ENV;
    const previousDatabaseUrl = process.env.DATABASE_URL;

    try {
      process.env.NODE_ENV = 'production';
      delete process.env.DATABASE_URL;

      expect(() => createApp()).toThrow('SUPABASE_JWT_SECRET or JWT_SECRET is required when production AUTH_MODE=trusted.');
    } finally {
      process.env.NODE_ENV = previousNodeEnv;

      if (previousDatabaseUrl !== undefined) {
        process.env.DATABASE_URL = previousDatabaseUrl;
      } else {
        delete process.env.DATABASE_URL;
      }
    }
  });

  it('rejects unsafe header auth mode in production unless explicitly acknowledged', () => {
    const previousNodeEnv = process.env.NODE_ENV;
    const previousDatabaseUrl = process.env.DATABASE_URL;
    const previousAuthMode = process.env.AUTH_MODE;
    const previousUnsafeHeaderAuth = process.env.ALLOW_UNSAFE_HEADER_AUTH;

    try {
      process.env.NODE_ENV = 'production';
      process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/infamous_test';
      process.env.AUTH_MODE = 'header';
      delete process.env.ALLOW_UNSAFE_HEADER_AUTH;

      expect(() => createApp()).toThrow('AUTH_MODE=header is not allowed in production');
    } finally {
      process.env.NODE_ENV = previousNodeEnv;

      if (previousDatabaseUrl !== undefined) {
        process.env.DATABASE_URL = previousDatabaseUrl;
      } else {
        delete process.env.DATABASE_URL;
      }

      if (previousAuthMode !== undefined) {
        process.env.AUTH_MODE = previousAuthMode;
      } else {
        delete process.env.AUTH_MODE;
      }

      if (previousUnsafeHeaderAuth !== undefined) {
        process.env.ALLOW_UNSAFE_HEADER_AUTH = previousUnsafeHeaderAuth;
      } else {
        delete process.env.ALLOW_UNSAFE_HEADER_AUTH;
      }
    }
  });

  it('does not accept tenant and role spoofing headers in default production auth mode', async () => {
    const previousNodeEnv = process.env.NODE_ENV;
    const previousDatabaseUrl = process.env.DATABASE_URL;
    const previousAuthMode = process.env.AUTH_MODE;
    const previousJwtSecret = process.env.SUPABASE_JWT_SECRET;

    try {
      process.env.NODE_ENV = 'production';
      process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/infamous_test';
      process.env.SUPABASE_JWT_SECRET = 'test-supabase-jwt-secret';
      delete process.env.AUTH_MODE;

      const response = await request(createApp())
        .get('/api/loads')
        .set('x-tenant-id', 'tenant-1')
        .set('x-user-role', 'dispatcher');

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('authentication_required');
    } finally {
      process.env.NODE_ENV = previousNodeEnv;

      if (previousDatabaseUrl !== undefined) {
        process.env.DATABASE_URL = previousDatabaseUrl;
      } else {
        delete process.env.DATABASE_URL;
      }

      if (previousAuthMode !== undefined) {
        process.env.AUTH_MODE = previousAuthMode;
      } else {
        delete process.env.AUTH_MODE;
      }

      if (previousJwtSecret !== undefined) {
        process.env.SUPABASE_JWT_SECRET = previousJwtSecret;
      } else {
        delete process.env.SUPABASE_JWT_SECRET;
      }
    }
  });

  it('accepts a verified bearer token in default production auth mode', async () => {
    const previousNodeEnv = process.env.NODE_ENV;
    const previousDatabaseUrl = process.env.DATABASE_URL;
    const previousAuthMode = process.env.AUTH_MODE;
    const previousJwtSecret = process.env.SUPABASE_JWT_SECRET;

    try {
      process.env.NODE_ENV = 'production';
      process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/infamous_test';
      process.env.SUPABASE_JWT_SECRET = 'test-supabase-jwt-secret';
      delete process.env.AUTH_MODE;

      const token = signJwt({
        sub: 'user-1',
        exp: Math.floor(Date.now() / 1000) + 60,
        app_metadata: {
          tenant_id: 'tenant-token',
          role: 'dispatcher',
        },
      });

      const response = await request(createApp())
        .get('/api/loads')
        .set('authorization', `Bearer ${token}`)
        .set('x-tenant-id', 'tenant-spoof')
        .set('x-user-role', 'owner')
        .set('x-subscription-status', 'active');

      expect(response.status).toBe(402);
      expect(response.body.error).toBe('payment_required');
    } finally {
      process.env.NODE_ENV = previousNodeEnv;

      if (previousDatabaseUrl !== undefined) {
        process.env.DATABASE_URL = previousDatabaseUrl;
      } else {
        delete process.env.DATABASE_URL;
      }

      if (previousAuthMode !== undefined) {
        process.env.AUTH_MODE = previousAuthMode;
      } else {
        delete process.env.AUTH_MODE;
      }

      if (previousJwtSecret !== undefined) {
        process.env.SUPABASE_JWT_SECRET = previousJwtSecret;
      } else {
        delete process.env.SUPABASE_JWT_SECRET;
      }
    }
  });

  it('rejects expired or tampered bearer tokens in trusted auth mode', async () => {
    process.env.AUTH_MODE = 'trusted';
    process.env.SUPABASE_JWT_SECRET = 'test-supabase-jwt-secret';

    const expiredToken = signJwt({
      sub: 'user-1',
      exp: Math.floor(Date.now() / 1000) - 60,
      app_metadata: {
        tenant_id: 'tenant-token',
        role: 'dispatcher',
      },
    });
    const tamperedToken = `${signJwt({
      sub: 'user-1',
      exp: Math.floor(Date.now() / 1000) + 60,
      app_metadata: {
        tenant_id: 'tenant-token',
        role: 'dispatcher',
      },
    }).slice(0, -1)}x`;

    const expiredResponse = await request(createApp())
      .get('/api/loads')
      .set('authorization', `Bearer ${expiredToken}`);
    const tamperedResponse = await request(createApp())
      .get('/api/loads')
      .set('authorization', `Bearer ${tamperedToken}`);

    expect(expiredResponse.status).toBe(401);
    expect(expiredResponse.body.error).toBe('authentication_required');
    expect(tamperedResponse.status).toBe(401);
    expect(tamperedResponse.body.error).toBe('authentication_required');
  });
});
