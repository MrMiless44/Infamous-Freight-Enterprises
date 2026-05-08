import express, { NextFunction, Request, Response, Router } from 'express';
import * as Sentry from '@sentry/node';
import { DataStore } from '../data-store';
import {
  BillingInterval,
  BillingPlan,
  createStripeBillingPortalSession,
  createStripeCheckoutSession,
  createStripeOneTimeCheckoutSession,
  getBillingSyncFromStripeEvent,
  getStripeOneTimePaymentFromStripeEvent,
  getStripeWebhookSecret,
  isOneTimePurchaseType,
  OneTimePurchaseType,
  ONE_TIME_PURCHASE_TYPES,
  StripeEvent,
  verifyStripeWebhookSignature,
} from '../billing';
import { createStripeWebhookEventStore } from '../stripe-webhook-events';
import { createStripeOneTimePaymentStore } from '../stripe-one-time-payments';
import { HttpError, wrapAsync, getRequiredTenantId } from '../shared/http';

type Role = 'owner' | 'admin' | 'dispatcher';

const BILLING_PLANS: BillingPlan[] = ['starter', 'professional', 'enterprise'];
const BILLING_INTERVALS: BillingInterval[] = ['month', 'year'];
const BILLING_ROLES: Role[] = ['owner', 'admin'];

function requireBillingRole(req: Request, res: Response, next: NextFunction) {
  if (!req.userRole || !BILLING_ROLES.includes(req.userRole as Role)) {
    return res.status(403).json({
      error: 'billing_forbidden',
      message: 'Billing actions require owner or admin access.',
      requestId: req.requestId,
    });
  }

  next();
}

function getCheckoutPlan(req: Request): BillingPlan {
  const plan = req.body?.plan;

  if (!BILLING_PLANS.includes(plan)) {
    throw new HttpError(400, 'invalid_billing_plan', 'Billing plan must be starter, professional, or enterprise.');
  }

  return plan;
}

function getCheckoutInterval(req: Request): BillingInterval {
  const billingInterval = req.body?.billingInterval ?? 'month';

  if (!BILLING_INTERVALS.includes(billingInterval)) {
    throw new HttpError(400, 'invalid_billing_interval', 'Billing interval must be month or year.');
  }

  return billingInterval;
}

function getOneTimePurchaseType(req: Request): OneTimePurchaseType | undefined {
  const purchaseType = req.body?.purchaseType;

  if (purchaseType === undefined || purchaseType === null || purchaseType === '') {
    return undefined;
  }

  if (!isOneTimePurchaseType(purchaseType)) {
    throw new HttpError(
      400,
      'invalid_one_time_purchase_type',
      `purchaseType must be one of: ${ONE_TIME_PURCHASE_TYPES.join(', ')}.`,
    );
  }

  return purchaseType;
}

function getCarrierIdFromBillingSync(billingSync: ReturnType<typeof getBillingSyncFromStripeEvent>): string | null {
  return billingSync?.carrierId ?? null;
}

export function createWebhookRoute(dataStore: DataStore): Router {
  const router = Router();
  const webhookEvents = createStripeWebhookEventStore();
  const oneTimePayments = createStripeOneTimePaymentStore();

  router.post('/webhook', express.raw({ type: 'application/json' }), wrapAsync(async (req, res) => {
    const rawBody = Buffer.isBuffer(req.body) ? req.body : Buffer.from(JSON.stringify(req.body ?? {}));
    const signature = req.header('stripe-signature');

    if (!verifyStripeWebhookSignature(rawBody, signature, getStripeWebhookSecret())) {
      Sentry.addBreadcrumb({ category: 'stripe.webhook', message: 'Invalid signature', level: 'warning' });
      res.status(400).json({ error: 'invalid_stripe_signature' });
      return;
    }

    const event = JSON.parse(rawBody.toString('utf8')) as StripeEvent;
    const billingSync = getBillingSyncFromStripeEvent(event);
    const oneTimePayment = getStripeOneTimePaymentFromStripeEvent(event);
    const carrierId = getCarrierIdFromBillingSync(billingSync) ?? oneTimePayment?.carrierId ?? null;

    Sentry.addBreadcrumb({
      category: 'stripe.webhook',
      message: `Processing ${event.type}`,
      data: { eventId: event.id, carrierId },
      level: 'info',
    });

    await webhookEvents.upsert({
      eventId: event.id,
      eventType: event.type,
      carrierId,
      status: 'received',
    });

    try {
      if (oneTimePayment) {
        await oneTimePayments.upsert(oneTimePayment);
      }

      if (billingSync) {
        const synced = await dataStore.syncCarrierBilling(billingSync);
        await webhookEvents.upsert({
          eventId: event.id,
          eventType: event.type,
          carrierId,
          status: synced ? 'processed' : 'ignored',
          processedAt: new Date(),
        });
      } else if (oneTimePayment) {
        await webhookEvents.upsert({
          eventId: event.id,
          eventType: event.type,
          carrierId,
          status: 'processed',
          processedAt: new Date(),
        });
      } else {
        await webhookEvents.upsert({
          eventId: event.id,
          eventType: event.type,
          carrierId,
          status: 'ignored',
          processedAt: new Date(),
        });
      }

      Sentry.addBreadcrumb({
        category: 'stripe.webhook',
        message: `Completed ${event.type}`,
        data: { eventId: event.id },
        level: 'info',
      });
    } catch (error) {
      Sentry.addBreadcrumb({
        category: 'stripe.webhook',
        message: `Failed ${event.type}`,
        data: { eventId: event.id, error: error instanceof Error ? error.message : 'unknown' },
        level: 'error',
      });

      await webhookEvents.upsert({
        eventId: event.id,
        eventType: event.type,
        carrierId,
        status: 'failed',
        errorMessage: error instanceof Error ? error.message : 'Unknown webhook processing error',
        processedAt: new Date(),
      });
      throw error;
    }

    res.status(200).json({ received: true });
  }));

  return router;
}

export function createBillingRoutes(
  dataStore: DataStore,
  requireTenant: express.RequestHandler,
  requireRole: express.RequestHandler,
): Router {
  const router = Router();

  router.get('/status', requireTenant, requireRole, wrapAsync(async (req, res) => {
    const stripeCustomerId = await dataStore.getCarrierStripeCustomerId(getRequiredTenantId(req));
    res.status(200).json({
      data: {
        stripeCustomerId,
        hasStripeCustomer: Boolean(stripeCustomerId),
      },
    });
  }));

  router.post('/checkout-session', requireTenant, requireRole, requireBillingRole, wrapAsync(async (req, res) => {
    const carrierId = getRequiredTenantId(req);
    const stripeCustomerId = await dataStore.getCarrierStripeCustomerId(carrierId);

    if (stripeCustomerId) {
      throw new HttpError(
        409,
        'stripe_customer_already_linked',
        'This carrier already has a Stripe customer. Use the Customer Portal to change billing.',
      );
    }

    const url = await createStripeCheckoutSession({
      carrierId,
      stripeCustomerId,
      plan: getCheckoutPlan(req),
      billingInterval: getCheckoutInterval(req),
    });

    res.status(200).json({ data: { url } });
  }));

  router.post('/one-time-checkout-session', requireTenant, requireRole, requireBillingRole, wrapAsync(async (req, res) => {
    const carrierId = getRequiredTenantId(req);
    const purchaseType = getOneTimePurchaseType(req);
    const stripeCustomerId = await dataStore.getCarrierStripeCustomerId(carrierId);

    if (!stripeCustomerId) {
      throw new HttpError(
        404,
        'stripe_customer_not_found',
        'A linked Stripe customer is required before purchasing one-time add-ons.',
      );
    }

    const url = await createStripeOneTimeCheckoutSession({
      carrierId,
      stripeCustomerId,
      purchaseType,
    });

    res.status(200).json({ data: { url } });
  }));

  router.post('/customer-portal', requireTenant, requireRole, requireBillingRole, wrapAsync(async (req, res) => {
    const stripeCustomerId = await dataStore.getCarrierStripeCustomerId(getRequiredTenantId(req));

    if (!stripeCustomerId) {
      throw new HttpError(
        404,
        'stripe_customer_not_found',
        'No Stripe customer is linked to this carrier yet.',
      );
    }

    const url = await createStripeBillingPortalSession(stripeCustomerId);
    res.status(200).json({ data: { url } });
  }));

  return router;
}
