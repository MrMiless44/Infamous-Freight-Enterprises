import request from 'supertest';
import { createApp } from '../src/app';
import * as dataStoreModule from '../src/data-store';
import { resetRateLimitBucketsForTests } from '../src/rate-limit';

afterEach(() => {
  resetRateLimitBucketsForTests();
  delete process.env.RATE_LIMIT_ENABLED;
  delete process.env.RATE_LIMIT_WINDOW_MS;
  delete process.env.RATE_LIMIT_MAX_REQUESTS;
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
});

describe('rate limiting', () => {
  it('returns 429 after the configured API request limit is exceeded', async () => {
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
      origin: 'Dallas, TX',
      dest: 'Austin, TX',
      pickupDate: '2024-01-10',
      deliveryDate: '2024-01-11',
    };
    const shipmentForTenant2 = {
      reference: 'REF-2',
      brokerName: 'Broker Two',
      origin: 'Houston, TX',
      dest: 'San Antonio, TX',
      pickupDate: '2024-01-12',
      deliveryDate: '2024-01-13',
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
});

describe('configuration safety', () => {
  it('fails fast without DATABASE_URL outside test mode', () => {
    const previousNodeEnv = process.env.NODE_ENV;
    const previousDatabaseUrl = process.env.DATABASE_URL;

    try {
      process.env.NODE_ENV = 'production';
      delete process.env.DATABASE_URL;

      expect(() => createApp()).toThrow('DATABASE_URL is required outside of test mode.');
    } finally {
      process.env.NODE_ENV = previousNodeEnv;

      if (previousDatabaseUrl !== undefined) {
        process.env.DATABASE_URL = previousDatabaseUrl;
      } else {
        delete process.env.DATABASE_URL;
      }
    }
  });
});
