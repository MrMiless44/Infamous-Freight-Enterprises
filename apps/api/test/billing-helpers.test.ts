import crypto from 'crypto';
import {
  getBillingSyncFromStripeEvent,
  getBillingPortalReturnUrl,
  getStripeOneTimePriceId,
  verifyStripeWebhookSignature,
  createStripeCheckoutSession,
  createStripeOneTimeCheckoutSession,
  createStripeBillingPortalSession,
  StripeEvent,
} from '../src/billing';

function makeSignature(
  payload: string,
  secret: string,
  timestamp = Math.floor(Date.now() / 1000),
): string {
  const digest = crypto
    .createHmac('sha256', secret)
    .update(`${timestamp}.${payload}`, 'utf8')
    .digest('hex');
  return `t=${timestamp},v1=${digest}`;
}

describe('getBillingSyncFromStripeEvent', () => {
  it('returns active sync for checkout.session.completed in subscription mode', () => {
    const event: StripeEvent = {
      id: 'evt_1',
      type: 'checkout.session.completed',
      data: {
        object: {
          mode: 'subscription',
          customer: 'cus_abc',
          metadata: { carrierId: 'carrier_1', plan: 'starter' },
        },
      },
    };

    const result = getBillingSyncFromStripeEvent(event);

    expect(result).toMatchObject({
      carrierId: 'carrier_1',
      stripeCustomerId: 'cus_abc',
      subscriptionTier: 'starter',
      status: 'active',
    });
  });

  it('returns null for checkout.session.completed in payment mode', () => {
    const event: StripeEvent = {
      id: 'evt_2',
      type: 'checkout.session.completed',
      data: {
        object: {
          mode: 'payment',
          customer: 'cus_abc',
          metadata: { carrierId: 'carrier_1', purchaseType: 'ai_addon_pack' },
        },
      },
    };

    expect(getBillingSyncFromStripeEvent(event)).toBeNull();
  });

  it('returns trial status for customer.subscription.created with trialing', () => {
    const event: StripeEvent = {
      id: 'evt_3',
      type: 'customer.subscription.created',
      data: {
        object: {
          status: 'trialing',
          customer: 'cus_trial',
          metadata: { carrierId: 'carrier_trial', plan: 'professional' },
        },
      },
    };

    const result = getBillingSyncFromStripeEvent(event);

    expect(result).toMatchObject({
      stripeCustomerId: 'cus_trial',
      status: 'trial',
    });
  });

  it('returns past_due status for customer.subscription.updated with past_due', () => {
    const event: StripeEvent = {
      id: 'evt_4',
      type: 'customer.subscription.updated',
      data: {
        object: {
          status: 'past_due',
          customer: 'cus_past_due',
          metadata: {},
        },
      },
    };

    const result = getBillingSyncFromStripeEvent(event);

    expect(result).toMatchObject({
      stripeCustomerId: 'cus_past_due',
      status: 'past_due',
    });
  });

  it('returns canceled status for customer.subscription.deleted', () => {
    const event: StripeEvent = {
      id: 'evt_5',
      type: 'customer.subscription.deleted',
      data: {
        object: {
          customer: 'cus_deleted',
          metadata: { carrierId: 'carrier_deleted' },
        },
      },
    };

    const result = getBillingSyncFromStripeEvent(event);

    expect(result).toMatchObject({
      carrierId: 'carrier_deleted',
      stripeCustomerId: 'cus_deleted',
      status: 'canceled',
    });
  });

  it('returns active status for invoice.payment_succeeded', () => {
    const event: StripeEvent = {
      id: 'evt_6',
      type: 'invoice.payment_succeeded',
      data: {
        object: {
          customer: 'cus_invoice',
          metadata: {},
        },
      },
    };

    const result = getBillingSyncFromStripeEvent(event);

    expect(result).toMatchObject({
      stripeCustomerId: 'cus_invoice',
      status: 'active',
    });
  });

  it('returns past_due status for invoice.payment_failed', () => {
    const event: StripeEvent = {
      id: 'evt_7',
      type: 'invoice.payment_failed',
      data: {
        object: {
          customer: 'cus_failed',
          metadata: {},
        },
      },
    };

    const result = getBillingSyncFromStripeEvent(event);

    expect(result).toMatchObject({
      stripeCustomerId: 'cus_failed',
      status: 'past_due',
    });
  });

  it('returns null for unknown event types', () => {
    const event: StripeEvent = {
      id: 'evt_unknown',
      type: 'payment_intent.created',
      data: { object: {} },
    };

    expect(getBillingSyncFromStripeEvent(event)).toBeNull();
  });

  it('returns incomplete status for customer.subscription.updated with incomplete_expired', () => {
    const event: StripeEvent = {
      id: 'evt_8',
      type: 'customer.subscription.updated',
      data: {
        object: {
          status: 'incomplete_expired',
          customer: 'cus_incomplete',
          metadata: {},
        },
      },
    };

    const result = getBillingSyncFromStripeEvent(event);

    expect(result).toMatchObject({
      stripeCustomerId: 'cus_incomplete',
      status: 'incomplete',
    });
  });

  it('resolves plan from price ID on subscription event when metadata has no plan', () => {
    const event: StripeEvent = {
      id: 'evt_9',
      type: 'customer.subscription.updated',
      data: {
        object: {
          status: 'active',
          customer: 'cus_priced',
          metadata: {},
          items: {
            data: [
              {
                price: {
                  // starter/month price ID from billing.ts
                  id: 'price_1TBnZ2KCNuZqDozYEcW5j4xM',
                },
              },
            ],
          },
        },
      },
    };

    const result = getBillingSyncFromStripeEvent(event);

    expect(result).toMatchObject({
      subscriptionTier: 'starter',
      status: 'active',
    });
  });
});

describe('verifyStripeWebhookSignature', () => {
  const secret = 'whsec_test_verify';

  it('returns false when webhookSecret is null', () => {
    const payload = Buffer.from('{}');
    expect(verifyStripeWebhookSignature(payload, 't=123,v1=abc', null)).toBe(false);
  });

  it('returns false when signature header is undefined', () => {
    const payload = Buffer.from('{}');
    expect(verifyStripeWebhookSignature(payload, undefined, secret)).toBe(false);
  });

  it('returns false for a signature with non-finite timestamp', () => {
    const payload = Buffer.from('{}');
    expect(verifyStripeWebhookSignature(payload, 't=abc,v1=xyz', secret)).toBe(false);
  });

  it('returns false for a signature with no v1 signatures', () => {
    const payload = Buffer.from('{}');
    expect(verifyStripeWebhookSignature(payload, 't=1000', secret)).toBe(false);
  });

  it('returns true for a valid in-tolerance signature', () => {
    const payloadStr = JSON.stringify({ id: 'evt_ok', type: 'test' });
    const payload = Buffer.from(payloadStr);
    const now = Math.floor(Date.now() / 1000);
    const sig = makeSignature(payloadStr, secret, now);

    expect(verifyStripeWebhookSignature(payload, sig, secret, now)).toBe(true);
  });

  it('returns false when the signature is outside the 300-second tolerance', () => {
    const payloadStr = '{"id":"evt_old"}';
    const payload = Buffer.from(payloadStr);
    const sig = makeSignature(payloadStr, secret, 1000);

    expect(verifyStripeWebhookSignature(payload, sig, secret, 1301)).toBe(false);
  });

  it('returns false for a tampered signature', () => {
    const payloadStr = '{"id":"evt_tampered"}';
    const payload = Buffer.from(payloadStr);
    const now = Math.floor(Date.now() / 1000);
    const sig = makeSignature(payloadStr, secret, now).replace('v1=', 'v1=00');

    expect(verifyStripeWebhookSignature(payload, sig, secret, now)).toBe(false);
  });
});

describe('getStripeOneTimePriceId', () => {
  afterEach(() => {
    delete process.env.STRIPE_PRICE_ONE_TIME;
    delete process.env.STRIPE_PRICE_AI_ADDON_PACK;
  });

  it('returns STRIPE_PRICE_ONE_TIME when set', () => {
    process.env.STRIPE_PRICE_ONE_TIME = 'price_one_time_primary';
    process.env.STRIPE_PRICE_AI_ADDON_PACK = 'price_legacy';

    expect(getStripeOneTimePriceId()).toBe('price_one_time_primary');
  });

  it('falls back to STRIPE_PRICE_AI_ADDON_PACK when ONE_TIME is not set', () => {
    process.env.STRIPE_PRICE_AI_ADDON_PACK = 'price_legacy_addon';

    expect(getStripeOneTimePriceId()).toBe('price_legacy_addon');
  });

  it('returns null when neither env var is set', () => {
    expect(getStripeOneTimePriceId()).toBeNull();
  });
});

describe('getBillingPortalReturnUrl', () => {
  afterEach(() => {
    delete process.env.STRIPE_PORTAL_RETURN_URL;
    delete process.env.WEB_APP_URL;
  });

  it('returns STRIPE_PORTAL_RETURN_URL when set', () => {
    process.env.STRIPE_PORTAL_RETURN_URL = 'https://portal.example.com/return';
    process.env.WEB_APP_URL = 'https://www.infamousfreight.com';

    expect(getBillingPortalReturnUrl()).toBe('https://portal.example.com/return');
  });

  it('falls back to WEB_APP_URL when STRIPE_PORTAL_RETURN_URL is not set', () => {
    process.env.WEB_APP_URL = 'https://www.infamousfreight.com';

    expect(getBillingPortalReturnUrl()).toBe('https://www.infamousfreight.com');
  });

  it('falls back to localhost when neither env var is set', () => {
    expect(getBillingPortalReturnUrl()).toBe('http://localhost:5173/settings');
  });
});

describe('createStripeCheckoutSession error paths', () => {
  beforeEach(() => {
    delete process.env.STRIPE_SECRET_KEY;
  });

  afterEach(() => {
    delete process.env.STRIPE_SECRET_KEY;
    jest.restoreAllMocks();
  });

  it('throws stripe_secret_key_required when STRIPE_SECRET_KEY is not set', async () => {
    await expect(
      createStripeCheckoutSession({
        carrierId: 'c_1',
        plan: 'starter',
        billingInterval: 'month',
      }),
    ).rejects.toThrow('stripe_secret_key_required');
  });

  it('throws stripe_checkout_session_failed when Stripe returns no URL', async () => {
    process.env.STRIPE_SECRET_KEY = 'sk_test_nourl';

    jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({}),
    } as Response);

    await expect(
      createStripeCheckoutSession({
        carrierId: 'c_1',
        plan: 'professional',
        billingInterval: 'year',
      }),
    ).rejects.toThrow('stripe_checkout_session_failed');
  });

  it('throws the Stripe error message when the API call fails', async () => {
    process.env.STRIPE_SECRET_KEY = 'sk_test_apierror';

    jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: false,
      json: async () => ({ error: { message: 'No such price' } }),
    } as Response);

    await expect(
      createStripeCheckoutSession({
        carrierId: 'c_1',
        plan: 'enterprise',
        billingInterval: 'month',
      }),
    ).rejects.toThrow('No such price');
  });
});

describe('createStripeOneTimeCheckoutSession error paths', () => {
  afterEach(() => {
    delete process.env.STRIPE_SECRET_KEY;
    delete process.env.STRIPE_PRICE_ONE_TIME;
    jest.restoreAllMocks();
  });

  it('throws stripe_one_time_price_required when no price ID is configured', async () => {
    process.env.STRIPE_SECRET_KEY = 'sk_test_noprice';

    await expect(
      createStripeOneTimeCheckoutSession({
        carrierId: 'c_2',
        stripeCustomerId: 'cus_2',
      }),
    ).rejects.toThrow('stripe_one_time_price_required');
  });

  it('throws stripe_checkout_session_failed when Stripe returns no URL', async () => {
    process.env.STRIPE_SECRET_KEY = 'sk_test_nourl_ot';
    process.env.STRIPE_PRICE_ONE_TIME = 'price_one_time_test';

    jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({}),
    } as Response);

    await expect(
      createStripeOneTimeCheckoutSession({
        carrierId: 'c_2',
        stripeCustomerId: 'cus_2',
        purchaseType: 'ai_addon_pack',
      }),
    ).rejects.toThrow('stripe_checkout_session_failed');
  });
});

describe('createStripeBillingPortalSession', () => {
  afterEach(() => {
    delete process.env.STRIPE_SECRET_KEY;
    jest.restoreAllMocks();
  });

  it('returns the portal URL on success', async () => {
    process.env.STRIPE_SECRET_KEY = 'sk_test_portal';

    jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ url: 'https://billing.stripe.com/session/portal_123' }),
    } as Response);

    const url = await createStripeBillingPortalSession('cus_portal_test');

    expect(url).toBe('https://billing.stripe.com/session/portal_123');
  });

  it('throws stripe_portal_session_failed when Stripe returns no URL', async () => {
    process.env.STRIPE_SECRET_KEY = 'sk_test_portal';

    jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({}),
    } as Response);

    await expect(createStripeBillingPortalSession('cus_portal_test')).rejects.toThrow(
      'stripe_portal_session_failed',
    );
  });
});
