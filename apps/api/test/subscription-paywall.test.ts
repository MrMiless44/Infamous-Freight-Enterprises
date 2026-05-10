import request from 'supertest';
import { createApp } from '../src/app';
import { resetRateLimitBucketsForTests } from '../src/rate-limit';

afterEach(() => {
  resetRateLimitBucketsForTests();
});

const baseHeaders = {
  'x-tenant-id': 'carrier_paywall_test',
  'x-user-role': 'dispatcher',
};

describe('requirePaidSubscription middleware', () => {
  it('allows requests with active subscription status', async () => {
    const app = createApp();

    const response = await request(app)
      .get('/api/loads')
      .set({ ...baseHeaders, 'x-subscription-status': 'active' });

    expect(response.status).toBe(200);
  });

  it('allows requests with trialing subscription status', async () => {
    const app = createApp();

    const response = await request(app)
      .get('/api/loads')
      .set({ ...baseHeaders, 'x-subscription-status': 'trialing' });

    expect(response.status).toBe(200);
  });

  it('returns 402 for past_due subscription', async () => {
    const app = createApp();

    const response = await request(app)
      .get('/api/loads')
      .set({ ...baseHeaders, 'x-subscription-status': 'past_due' });

    expect(response.status).toBe(402);
    expect(response.body.error).toBe('payment_required');
    expect(response.body.subscriptionStatus).toBe('past_due');
  });

  it('returns 402 for canceled subscription', async () => {
    const app = createApp();

    const response = await request(app)
      .get('/api/loads')
      .set({ ...baseHeaders, 'x-subscription-status': 'canceled' });

    expect(response.status).toBe(402);
    expect(response.body.error).toBe('payment_required');
  });

  it('returns 402 for unpaid subscription', async () => {
    const app = createApp();

    const response = await request(app)
      .get('/api/loads')
      .set({ ...baseHeaders, 'x-subscription-status': 'unpaid' });

    expect(response.status).toBe(402);
    expect(response.body.error).toBe('payment_required');
  });

  it('returns 402 for incomplete subscription', async () => {
    const app = createApp();

    const response = await request(app)
      .get('/api/loads')
      .set({ ...baseHeaders, 'x-subscription-status': 'incomplete' });

    expect(response.status).toBe(402);
    expect(response.body.error).toBe('payment_required');
  });

  it('returns 402 when no subscription status header is provided outside test defaults', async () => {
    const app = createApp();

    // Override NODE_ENV so it does not default to 'active' in test mode
    const previous = process.env.DEFAULT_SUBSCRIPTION_STATUS;
    process.env.DEFAULT_SUBSCRIPTION_STATUS = 'none';

    try {
      const response = await request(app)
        .get('/api/loads')
        .set({ ...baseHeaders });

      expect(response.status).toBe(402);
      expect(response.body.error).toBe('payment_required');
    } finally {
      if (previous === undefined) {
        delete process.env.DEFAULT_SUBSCRIPTION_STATUS;
      } else {
        process.env.DEFAULT_SUBSCRIPTION_STATUS = previous;
      }
    }
  });

  it('treats an unrecognized subscription status as none (402)', async () => {
    const app = createApp();

    const response = await request(app)
      .get('/api/loads')
      .set({ ...baseHeaders, 'x-subscription-status': 'bogus_status' });

    expect(response.status).toBe(402);
    expect(response.body.error).toBe('payment_required');
  });
});

describe('tenant ID resolution', () => {
  it('rejects tenant ID supplied only by query parameter', async () => {
    const app = createApp();

    const response = await request(app)
      .get('/api/loads?tenantId=carrier_via_query')
      .set({ 'x-user-role': 'dispatcher', 'x-subscription-status': 'active' });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('tenant_id_required');
  });

  it('rejects tenant ID supplied only by request body', async () => {
    const app = createApp();

    const response = await request(app)
      .post('/api/loads')
      .set({ 'x-user-role': 'dispatcher', 'x-subscription-status': 'active' })
      .send({ tenantId: 'carrier_via_body' });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('tenant_id_required');
  });
});

describe('/api/billing/one-time-checkout-session', () => {
  it('returns 404 when no Stripe customer is linked', async () => {
    const app = createApp();

    const response = await request(app)
      .post('/api/billing/one-time-checkout-session')
      .set({
        'x-tenant-id': 'carrier_no_customer',
        'x-user-role': 'owner',
        'x-subscription-status': 'active',
      })
      .send({ purchaseType: 'ai_addon_pack' });

    expect(response.status).toBe(404);
    expect(response.body.error).toBe('stripe_customer_not_found');
  });
});
