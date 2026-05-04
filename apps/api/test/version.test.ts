import request from 'supertest';
import { createApp } from '../src/app';
import { resetRateLimitBucketsForTests } from '../src/rate-limit';

afterEach(() => {
  resetRateLimitBucketsForTests();
  delete process.env.GIT_SHA;
  delete process.env.BUILD_TIME;
  delete process.env.APP_VERSION;
});

describe('version endpoint', () => {
  it('returns 200 and reports service identity on /api/version', async () => {
    const response = await request(createApp()).get('/api/version');

    expect(response.status).toBe(200);
    expect(response.body.service).toBe('infamous-freight-api');
    expect(typeof response.body.version).toBe('string');
    expect(typeof response.body.commit).toBe('string');
    expect(typeof response.body.buildTime).toBe('string');
    expect(typeof response.body.node).toBe('string');
    expect(response.body.node.startsWith('v')).toBe(true);
  });

  it('surfaces GIT_SHA, BUILD_TIME, and APP_VERSION when provided', async () => {
    process.env.GIT_SHA = 'abc1234';
    process.env.BUILD_TIME = '2026-05-04T00:00:00Z';
    process.env.APP_VERSION = '9.9.9';

    const response = await request(createApp()).get('/api/version');

    expect(response.status).toBe(200);
    expect(response.body.commit).toBe('abc1234');
    expect(response.body.buildTime).toBe('2026-05-04T00:00:00Z');
    expect(response.body.version).toBe('9.9.9');
  });
});
