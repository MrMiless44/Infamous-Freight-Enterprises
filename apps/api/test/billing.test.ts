import crypto from 'crypto';
import request from 'supertest';
import { createApp } from '../src/app';
import {
  createStripeCheckoutSession,
  createStripeOneTimeCheckoutSession,
  getStripeOneTimePaymentFromStripeEvent,
  verifyStripeWebhookSignature,
} from '../src/billing';

function createStripeSignature(payload: string, secret: string, timestamp = Math.floor(Date.now() / 1000)): string {
  const digest = crypto
    .createHmac('sha256', secret)
    .update(`${timestamp}.${payload}`, 'utf8')
    .digest('hex');

  return `t=${timestamp},v1=${digest}`;
}

describe('Stripe billing endpoints', () => {
  beforeEach(() => {
    process.env.NODE_ENV = 'test';
    process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test_secret';
    delete process.env.STRIPE_SECRET_KEY;
    delete process.env.STRIPE_PRICE_ONE_TIME;
    delete process.env.STRIPE_PRICE_AI_ADDON_PACK;
    delete process.env.STRIPE_CHECKOUT_SUCCESS_URL;
    delete process.env.STRIPE_CHECKOUT_CANCEL_URL;
    delete process.env.WEB_APP_URL;
    jest.restoreAllMocks();
  });

  it('rejects webhook requests with invalid Stripe signatures', async () => {
    const app = createApp();

    await request(app)
      .post('/api/billing/webhook')
      .set('stripe-signature', 't=123,v1=bad')
      .set('Content-Type', 'application/json')
      .send(JSON.stringify({ id: 'evt_bad', type: 'invoice.payment_failed', data: { object: {} } }))
      .expect(400);
  });

  it('rejects otherwise valid Stripe signatures outside the replay tolerance window', () => {
    const payload = Buffer.from(JSON.stringify({ id: 'evt_old', type: 'invoice.payment_failed', data: { object: {} } }));
    const signature = createStripeSignature(payload.toString('utf8'), 'whsec_test_secret', 1_000);

    expect(verifyStripeWebhookSignature(payload, signature, 'whsec_test_secret', 1_301)).toBe(false);
  });

  it('accepts signed checkout webhook events and syncs billing in memory store', async () => {
    const app = createApp();
    const payload = JSON.stringify({
      id: 'evt_checkout_completed',
      type: 'checkout.session.completed',
      data: {
        object: {
          customer: 'cus_test_123',
          metadata: {
            carrierId: 'carrier_billing_123',
            plan: 'professional',
          },
        },
      },
    });

    await request(app)
      .post('/api/billing/webhook')
      .set('stripe-signature', createStripeSignature(payload, 'whsec_test_secret'))
      .set('Content-Type', 'application/json')
      .send(payload)
      .expect(200, { received: true });

    const statusResponse = await request(app)
      .get('/api/billing/status')
      .set('x-tenant-id', 'carrier_billing_123')
      .set('x-user-role', 'owner')
      .set('x-subscription-status', 'active')
      .expect(200);

    expect(statusResponse.body.data).toMatchObject({
      stripeCustomerId: 'cus_test_123',
      hasStripeCustomer: true,
    });

    const response = await request(app)
      .post('/api/billing/customer-portal')
      .set('x-tenant-id', 'carrier_billing_123')
      .set('x-user-role', 'owner')
      .set('x-subscription-status', 'active')
      .send({})
      .expect(500);

    expect(response.body.error).toBe('stripe_secret_key_required');
  });

  it('uses stored Stripe-synced carrier status for protected routes without client billing headers', async () => {
    const app = createApp();
    const payload = JSON.stringify({
      id: 'evt_checkout_subscription_gate',
      type: 'checkout.session.completed',
      data: {
        object: {
          customer: 'cus_subscription_gate',
          metadata: {
            carrierId: 'carrier_subscription_gate',
            plan: 'starter',
          },
        },
      },
    });

    await request(app)
      .post('/api/billing/webhook')
      .set('stripe-signature', createStripeSignature(payload, 'whsec_test_secret'))
      .set('Content-Type', 'application/json')
      .send(payload)
      .expect(200, { received: true });

    const response = await request(app)
      .post('/api/ai-usage/events')
      .set('x-tenant-id', 'carrier_subscription_gate')
      .set('x-user-role', 'dispatcher')
      .send({
        feature: 'dispatch-assistant',
        actionCount: 1,
      })
      .expect(201);

    expect(response.body.data).toMatchObject({
      carrierId: 'carrier_subscription_gate',
      feature: 'dispatch-assistant',
      actionCount: 1,
    });
  });

  it('creates Checkout Sessions with server-side prices, metadata, and session id success redirects', async () => {
    process.env.STRIPE_SECRET_KEY = 'sk_test_checkout';
    process.env.WEB_APP_URL = 'https://www.infamousfreight.com';

    const fetchMock = jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ url: 'https://checkout.stripe.com/c/pay/cs_test_123' }),
    } as Response);

    const url = await createStripeCheckoutSession({
      carrierId: 'carrier_checkout_123',
      plan: 'professional',
      billingInterval: 'month',
    });

    expect(url).toBe('https://checkout.stripe.com/c/pay/cs_test_123');
    expect(fetchMock).toHaveBeenCalledTimes(1);

    const [, requestInit] = fetchMock.mock.calls[0];
    const body = requestInit?.body as URLSearchParams;

    expect(body.get('mode')).toBe('subscription');
    expect(body.get('line_items[0][price]')).toBe('price_1TBnZ3KCNuZqDozY2FISQT98');
    expect(body.get('line_items[0][quantity]')).toBe('1');
    expect(body.get('metadata[carrierId]')).toBe('carrier_checkout_123');
    expect(body.get('metadata[plan]')).toBe('professional');
    expect(body.get('metadata[billingInterval]')).toBe('month');
    expect(body.get('client_reference_id')).toBe('carrier_checkout_123');
    expect(body.get('success_url')).toBe(
      'https://www.infamousfreight.com/settings?checkout=success&session_id={CHECKOUT_SESSION_ID}',
    );
  });

  it('creates one-time Checkout Sessions with trusted server-side Price IDs', async () => {
    process.env.STRIPE_SECRET_KEY = 'sk_test_checkout';
    process.env.STRIPE_PRICE_ONE_TIME = 'price_one_time_test';
    process.env.WEB_APP_URL = 'https://www.infamousfreight.com';

    const fetchMock = jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ url: 'https://checkout.stripe.com/c/pay/cs_one_time_123' }),
    } as Response);

    const url = await createStripeOneTimeCheckoutSession({
      carrierId: 'carrier_addon_123',
      stripeCustomerId: 'cus_addon_123',
      purchaseType: 'ai_addon_pack',
    });

    expect(url).toBe('https://checkout.stripe.com/c/pay/cs_one_time_123');
    expect(fetchMock).toHaveBeenCalledTimes(1);

    const [, requestInit] = fetchMock.mock.calls[0];
    const body = requestInit?.body as URLSearchParams;

    expect(body.get('mode')).toBe('payment');
    expect(body.get('line_items[0][price]')).toBe('price_one_time_test');
    expect(body.get('customer')).toBe('cus_addon_123');
    expect(body.get('client_reference_id')).toBe('carrier_addon_123');
    expect(body.get('metadata[carrierId]')).toBe('carrier_addon_123');
    expect(body.get('metadata[purchaseType]')).toBe('ai_addon_pack');
    expect(body.get('metadata[priceId]')).toBe('price_one_time_test');
    expect(body.get('metadata[mode]')).toBe('payment');
  });

  it('extracts one-time payment records from completed Checkout webhooks', () => {
    const payment = getStripeOneTimePaymentFromStripeEvent({
      id: 'evt_one_time_completed',
      type: 'checkout.session.completed',
      data: {
        object: {
          id: 'cs_one_time_123',
          mode: 'payment',
          customer: 'cus_one_time_123',
          payment_intent: 'pi_one_time_123',
          amount_total: 4900,
          currency: 'usd',
          payment_status: 'paid',
          client_reference_id: 'carrier_one_time_123',
          metadata: {
            carrierId: 'carrier_one_time_123',
            purchaseType: 'ai_addon_pack',
            priceId: 'price_one_time_test',
          },
        },
      },
    });

    expect(payment).toMatchObject({
      eventId: 'evt_one_time_completed',
      carrierId: 'carrier_one_time_123',
      stripeCustomerId: 'cus_one_time_123',
      stripeCheckoutSessionId: 'cs_one_time_123',
      stripePaymentIntentId: 'pi_one_time_123',
      amountTotal: 4900,
      currency: 'usd',
      status: 'paid',
      purchaseType: 'ai_addon_pack',
      priceId: 'price_one_time_test',
    });
  });

  it('blocks duplicate checkout when a carrier already has a Stripe customer', async () => {
    const app = createApp();
    const payload = JSON.stringify({
      id: 'evt_checkout_duplicate_guard',
      type: 'checkout.session.completed',
      data: {
        object: {
          customer: 'cus_duplicate_guard',
          metadata: {
            carrierId: 'carrier_duplicate_guard',
            plan: 'starter',
          },
        },
      },
    });

    await request(app)
      .post('/api/billing/webhook')
      .set('stripe-signature', createStripeSignature(payload, 'whsec_test_secret'))
      .set('Content-Type', 'application/json')
      .send(payload)
      .expect(200, { received: true });

    const response = await request(app)
      .post('/api/billing/checkout-session')
      .set('x-tenant-id', 'carrier_duplicate_guard')
      .set('x-user-role', 'owner')
      .set('x-subscription-status', 'active')
      .send({ plan: 'professional', billingInterval: 'month' })
      .expect(409);

    expect(response.body.error).toBe('stripe_customer_already_linked');
  });

  it('requires owner or admin access for customer portal and checkout sessions', async () => {
    const app = createApp();

    const portalResponse = await request(app)
      .post('/api/billing/customer-portal')
      .set('x-tenant-id', 'carrier_billing_123')
      .set('x-user-role', 'dispatcher')
      .set('x-subscription-status', 'active')
      .send({})
      .expect(403);

    expect(portalResponse.body.error).toBe('billing_forbidden');

    const checkoutResponse = await request(app)
      .post('/api/billing/checkout-session')
      .set('x-tenant-id', 'carrier_billing_123')
      .set('x-user-role', 'dispatcher')
      .set('x-subscription-status', 'active')
      .send({ plan: 'professional', billingInterval: 'month' })
      .expect(403);

    expect(checkoutResponse.body.error).toBe('billing_forbidden');
  });

  it('validates checkout plan and interval before creating Stripe sessions', async () => {
    const app = createApp();

    const invalidPlanResponse = await request(app)
      .post('/api/billing/checkout-session')
      .set('x-tenant-id', 'carrier_billing_123')
      .set('x-user-role', 'owner')
      .set('x-subscription-status', 'active')
      .send({ plan: 'free', billingInterval: 'month' })
      .expect(400);

    expect(invalidPlanResponse.body.error).toBe('invalid_billing_plan');

    const invalidIntervalResponse = await request(app)
      .post('/api/billing/checkout-session')
      .set('x-tenant-id', 'carrier_billing_123')
      .set('x-user-role', 'owner')
      .set('x-subscription-status', 'active')
      .send({ plan: 'professional', billingInterval: 'weekly' })
      .expect(400);

    expect(invalidIntervalResponse.body.error).toBe('invalid_billing_interval');
  });

  it('returns 404 when no Stripe customer is linked to a carrier', async () => {
    const app = createApp();

    const response = await request(app)
      .post('/api/billing/customer-portal')
      .set('x-tenant-id', 'carrier_without_customer')
      .set('x-user-role', 'admin')
      .set('x-subscription-status', 'active')
      .send({})
      .expect(404);

    expect(response.body.error).toBe('stripe_customer_not_found');
  });

  it('records and summarizes AI usage events with idempotency protection', async () => {
    const app = createApp();

    await request(app)
      .post('/api/ai-usage/events')
      .set('x-tenant-id', 'carrier_ai_123')
      .set('x-user-role', 'dispatcher')
      .set('x-subscription-status', 'active')
      .send({
        feature: 'dispatch-assistant',
        actionCount: 2,
        documentScans: 1,
        inputTokens: 100,
        outputTokens: 40,
        estimatedCost: 0.25,
        idempotencyKey: 'evt_ai_1',
      })
      .expect(201);

    await request(app)
      .post('/api/ai-usage/events')
      .set('x-tenant-id', 'carrier_ai_123')
      .set('x-user-role', 'dispatcher')
      .set('x-subscription-status', 'active')
      .send({
        feature: 'dispatch-assistant',
        actionCount: 2,
        documentScans: 1,
        inputTokens: 100,
        outputTokens: 40,
        estimatedCost: 0.25,
        idempotencyKey: 'evt_ai_1',
      })
      .expect(201);

    const summary = await request(app)
      .get('/api/ai-usage/summary')
      .set('x-tenant-id', 'carrier_ai_123')
      .set('x-user-role', 'owner')
      .set('x-subscription-status', 'active')
      .expect(200);

    expect(summary.body.data).toMatchObject({
      carrierId: 'carrier_ai_123',
      actionCount: 2,
      documentScans: 1,
      inputTokens: 100,
      outputTokens: 40,
      estimatedCost: 0.25,
    });
  });

  it('requires a feature for AI usage events', async () => {
    const app = createApp();

    const response = await request(app)
      .post('/api/ai-usage/events')
      .set('x-tenant-id', 'carrier_ai_123')
      .set('x-user-role', 'dispatcher')
      .set('x-subscription-status', 'active')
      .send({ actionCount: 1 })
      .expect(400);

    expect(response.body.error).toBe('ai_usage_feature_required');
  });
});
