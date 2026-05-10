import { getDatabase } from '@netlify/database';
import type { Config } from '@netlify/functions';
import { requireAuth, type TokenPayload } from './lib/auth.ts';
import { json, options, genId } from './lib/http.ts';
import { text, parseBody, parseUrl, extractParam } from './lib/validate.ts';

function rowToPayment(row: Record<string, unknown>) {
  return {
    id: row.id,
    invoiceId: row.invoice_id,
    stripeSessionId: row.stripe_session_id,
    stripePaymentIntent: row.stripe_payment_intent,
    amount: row.amount ? Number(row.amount) : 0,
    currency: row.currency,
    status: row.status,
    metadata: row.metadata || {},
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function createCheckoutSession(req: Request, user: TokenPayload) {
  let body: { invoiceId?: unknown; successUrl?: unknown; cancelUrl?: unknown };
  try {
    body = await parseBody<typeof body>(req);
  } catch {
    return json(400, { error: 'invalid_json' });
  }

  const invoiceId = text(body.invoiceId, 64);
  if (!invoiceId) return json(400, { error: 'missing_fields', fields: ['invoiceId'] });

  const db = getDatabase();
  const rows = await db.sql`SELECT * FROM invoices WHERE id = ${invoiceId} LIMIT 1`;
  if (rows.length === 0) return json(404, { error: 'invoice_not_found' });

  const invoice = rows[0] as Record<string, unknown>;
  if (invoice.status === 'paid') return json(400, { error: 'already_paid' });

  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) {
    console.warn('[PAYMENTS] STRIPE_SECRET_KEY is not set — returning mock session. Set STRIPE_SECRET_KEY for live payments.');
    const paymentId = genId();
    await db.sql`
      INSERT INTO payments (id, invoice_id, stripe_session_id, amount, currency, status, metadata)
      VALUES (
        ${paymentId}, ${invoiceId}, ${'mock_session_' + paymentId},
        ${invoice.amount}, ${(invoice.currency as string) || 'USD'}, 'pending',
        ${JSON.stringify({ mock: true, userId: user.sub })}::jsonb
      )
    `;

    return json(201, {
      sessionId: 'mock_session_' + paymentId,
      url: null,
      mock: true,
      message: 'Stripe not configured. Set STRIPE_SECRET_KEY to enable live payments.',
    });
  }

  const amount = Math.round(Number(invoice.amount) * 100);
  const currency = (invoice.currency as string) || 'USD';
  const successUrl = text(body.successUrl, 500) || `${req.headers.get('origin') || 'https://www.infamousfreight.com'}/invoices/${invoiceId}?payment=success`;
  const cancelUrl = text(body.cancelUrl, 500) || `${req.headers.get('origin') || 'https://www.infamousfreight.com'}/invoices/${invoiceId}?payment=cancelled`;

  const sessionParams = new URLSearchParams();
  sessionParams.set('mode', 'payment');
  sessionParams.set('success_url', successUrl);
  sessionParams.set('cancel_url', cancelUrl);
  sessionParams.set('line_items[0][price_data][currency]', currency.toLowerCase());
  sessionParams.set('line_items[0][price_data][product_data][name]', `Invoice ${invoice.invoice_number}`);
  sessionParams.set('line_items[0][price_data][unit_amount]', String(amount));
  sessionParams.set('line_items[0][quantity]', '1');
  sessionParams.set('metadata[invoice_id]', invoiceId);
  sessionParams.set('metadata[invoice_number]', String(invoice.invoice_number));
  sessionParams.set('metadata[user_id]', user.sub);
  if (invoice.customer_email) {
    sessionParams.set('customer_email', String(invoice.customer_email));
  }

  const stripeRes = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${stripeKey}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: sessionParams.toString(),
  });

  if (!stripeRes.ok) {
    const err = await stripeRes.json().catch(() => ({}));
    return json(502, { error: 'stripe_error', message: (err as Record<string, unknown>)?.error?.toString() || 'Failed to create checkout session' });
  }

  const session = await stripeRes.json() as Record<string, unknown>;

  const paymentId = genId();
  await db.sql`
    INSERT INTO payments (id, invoice_id, stripe_session_id, amount, currency, status, metadata)
    VALUES (
      ${paymentId}, ${invoiceId}, ${session.id as string},
      ${invoice.amount}, ${currency}, 'pending',
      ${JSON.stringify({ userId: user.sub })}::jsonb
    )
  `;

  return json(201, {
    sessionId: session.id,
    url: session.url,
  });
}

async function handleWebhook(req: Request) {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripeKey || !webhookSecret) {
    return json(400, { error: 'stripe_not_configured' });
  }

  const signature = req.headers.get('stripe-signature');
  if (!signature) return json(400, { error: 'missing_signature' });

  const rawBody = await req.text();

  const parts = signature.split(',');
  const timestampPart = parts.find(p => p.startsWith('t='));
  const sigPart = parts.find(p => p.startsWith('v1='));

  if (!timestampPart || !sigPart) return json(400, { error: 'invalid_signature_format' });

  const timestamp = timestampPart.slice(2);
  const expectedSig = sigPart.slice(3);
  const payload = `${timestamp}.${rawBody}`;

  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(webhookSecret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload));
  const computedSig = Array.from(new Uint8Array(sig))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  if (computedSig !== expectedSig) return json(400, { error: 'invalid_signature' });

  const age = Math.abs(Date.now() / 1000 - Number(timestamp));
  if (age > 300) return json(400, { error: 'timestamp_too_old' });

  let event: Record<string, unknown>;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return json(400, { error: 'invalid_json' });
  }

  const eventType = event.type as string;

  if (eventType === 'checkout.session.completed') {
    const session = (event.data as Record<string, unknown>)?.object as Record<string, unknown>;
    if (!session) return json(200, { received: true });

    const sessionId = session.id as string;
    const metadata = (session.metadata || {}) as Record<string, string>;
    const invoiceId = metadata.invoice_id;

    const db = getDatabase();

    await db.sql`
      UPDATE payments SET status = 'completed', stripe_payment_intent = ${(session.payment_intent as string) || null}
      WHERE stripe_session_id = ${sessionId}
    `;

    if (invoiceId) {
      await db.sql`UPDATE invoices SET status = 'paid', paid_at = NOW() WHERE id = ${invoiceId}`;

      const invoiceRows = await db.sql`SELECT load_id FROM invoices WHERE id = ${invoiceId} LIMIT 1`;
      const loadId = (invoiceRows[0] as Record<string, unknown>)?.load_id;
      if (loadId) {
        await db.sql`UPDATE loads SET status = 'paid' WHERE id = ${loadId as string} AND status = 'invoiced'`;
      }
    }
  }

  return json(200, { received: true });
}

async function getPaymentsByInvoice(invoiceId: string) {
  const db = getDatabase();
  const rows = await db.sql`
    SELECT * FROM payments WHERE invoice_id = ${invoiceId} ORDER BY created_at DESC
  `;
  return json(200, { payments: rows.map((r: Record<string, unknown>) => rowToPayment(r)) });
}

export default async (req: Request) => {
  if (req.method === 'OPTIONS') return options();

  const url = parseUrl(req);
  const path = url.pathname;

  if (req.method === 'POST' && path === '/api/payments/stripe/webhook') {
    return handleWebhook(req);
  }

  const auth = await requireAuth(req);
  if (auth instanceof Response) return auth;

  if (req.method === 'POST' && path === '/api/payments/checkout') {
    return createCheckoutSession(req, auth);
  }

  const invoicePayments = extractParam(path, /^\/api\/payments\/invoice\/([^/]+)$/);
  if (invoicePayments && req.method === 'GET') {
    return getPaymentsByInvoice(invoicePayments);
  }

  return json(405, { error: 'method_not_allowed' });
};

export const config: Config = {
  path: [
    '/api/payments/checkout',
    '/api/payments/stripe/webhook',
    '/api/payments/invoice/:invoiceId',
  ],
};
