import { getDatabase } from '@netlify/database';
import type { Config } from '@netlify/functions';

type QuoteInput = {
  company?: unknown;
  contact?: unknown;
  email?: unknown;
  phone?: unknown;
  origin?: unknown;
  destination?: unknown;
  freightType?: unknown;
  equipment?: unknown;
  weight?: unknown;
  miles?: unknown;
  dimensions?: unknown;
  pickupDate?: unknown;
  deliveryDate?: unknown;
  instructions?: unknown;
  estimate?: {
    low?: unknown;
    mid?: unknown;
    high?: unknown;
    rpm?: unknown;
    confidence?: unknown;
  };
};

const SECURITY_HEADERS: Record<string, string> = {
  'content-type': 'application/json; charset=utf-8',
  'x-content-type-options': 'nosniff',
  'x-frame-options': 'DENY',
  'cache-control': 'no-store',
  'referrer-policy': 'strict-origin-when-cross-origin',
  'strict-transport-security': 'max-age=63072000; includeSubDomains; preload',
  'x-permitted-cross-domain-policies': 'none',
  'x-dns-prefetch-control': 'off',
  'cross-origin-embedder-policy': 'credentialless',
  'cross-origin-opener-policy': 'same-origin',
  'cross-origin-resource-policy': 'same-origin',
  'permissions-policy':
    'camera=(), microphone=(), geolocation=(), payment=(), usb=(), bluetooth=(), serial=(), hid=(), accelerometer=(), gyroscope=(), magnetometer=(), ambient-light-sensor=(), autoplay=(), display-capture=(), document-domain=(), encrypted-media=(), fullscreen=(), idle-detection=(), interest-cohort=(), picture-in-picture=(), screen-wake-lock=(), xr-spatial-tracking=()',
};

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: SECURITY_HEADERS });

const isString = (value: unknown): value is string => typeof value === 'string';

const text = (value: unknown, max = 240) => (isString(value) ? value.trim().slice(0, max) : '');

const numberOrNull = (value: unknown): number | null => {
  if (typeof value === 'number' && Number.isFinite(value)) return Math.round(value);
  if (isString(value) && value.trim() !== '') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? Math.round(parsed) : null;
  }
  return null;
};

const decimalOrNull = (value: unknown): number | null => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (isString(value) && value.trim() !== '') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
};

const dateOrNull = (value: unknown): string | null => {
  const raw = text(value, 32);
  if (!raw) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) return null;
  const timestamp = Date.parse(`${raw}T00:00:00Z`);
  return Number.isNaN(timestamp) ? null : raw;
};

const trackingNumber = () => `IF-${Math.floor(10000 + Math.random() * 90000)}`;

const isEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const isTrackingNumber = (value: string) => /^IF-\d{5}$/i.test(value);

async function createQuote(req: Request) {
  let body: QuoteInput;
  try {
    body = (await req.json()) as QuoteInput;
  } catch {
    return json(400, { error: 'invalid_json', message: 'Request body must be valid JSON.' });
  }

  const company = text(body.company, 160);
  const contact = text(body.contact, 160);
  const email = text(body.email, 180).toLowerCase();
  const origin = text(body.origin, 160);
  const destination = text(body.destination, 160);
  const freightType = text(body.freightType, 160);
  const equipment = text(body.equipment, 80) || 'Dry van';

  const missing: string[] = [];
  if (!company) missing.push('company');
  if (!contact) missing.push('contact');
  if (!email) missing.push('email');
  if (!origin) missing.push('origin');
  if (!destination) missing.push('destination');
  if (!freightType) missing.push('freightType');

  if (missing.length > 0) {
    return json(400, { error: 'missing_fields', fields: missing });
  }

  if (!isEmail(email)) {
    return json(400, { error: 'invalid_email', message: 'A valid email address is required.' });
  }

  const pickupDate = dateOrNull(body.pickupDate);
  const deliveryDate = dateOrNull(body.deliveryDate);
  if (body.pickupDate && !pickupDate) {
    return json(400, { error: 'invalid_date', field: 'pickupDate' });
  }
  if (body.deliveryDate && !deliveryDate) {
    return json(400, { error: 'invalid_date', field: 'deliveryDate' });
  }

  const db = getDatabase();
  const id = crypto.randomUUID();
  const tracking = trackingNumber();
  const route = `${origin} to ${destination}`;
  const publicNotes = 'Quote request received. Dispatch is reviewing lane details, equipment fit, and carrier capacity.';
  const timeline = JSON.stringify([
    {
      label: 'Quote received',
      status: 'complete',
      timestamp: new Date().toISOString(),
    },
    {
      label: 'Dispatch review',
      status: 'pending',
    },
  ]);

  const [quote] = await db.sql`
    INSERT INTO public_quote_requests (
      id,
      tracking_number,
      company,
      contact,
      email,
      phone,
      origin,
      destination,
      freight_type,
      equipment,
      weight_lbs,
      lane_miles,
      dimensions,
      pickup_date,
      delivery_date,
      instructions,
      estimate_low,
      estimate_mid,
      estimate_high,
      estimate_rpm,
      estimate_confidence
    )
    VALUES (
      ${id},
      ${tracking},
      ${company},
      ${contact},
      ${email},
      ${text(body.phone, 48) || null},
      ${origin},
      ${destination},
      ${freightType},
      ${equipment},
      ${numberOrNull(body.weight)},
      ${numberOrNull(body.miles)},
      ${text(body.dimensions, 240) || null},
      ${pickupDate},
      ${deliveryDate},
      ${text(body.instructions, 1200) || null},
      ${numberOrNull(body.estimate?.low)},
      ${numberOrNull(body.estimate?.mid)},
      ${numberOrNull(body.estimate?.high)},
      ${decimalOrNull(body.estimate?.rpm)},
      ${numberOrNull(body.estimate?.confidence)}
    )
    RETURNING id, tracking_number, status, created_at
  `;

  await db.sql`
    INSERT INTO public_shipments (
      tracking_number,
      quote_request_id,
      route,
      origin,
      destination,
      status,
      pickup_date,
      delivery_date,
      eta,
      equipment,
      public_notes,
      timeline
    )
    VALUES (
      ${tracking},
      ${id},
      ${route},
      ${origin},
      ${destination},
      ${'Quote received'},
      ${pickupDate},
      ${deliveryDate},
      ${'Dispatch ETA pending'},
      ${equipment},
      ${publicNotes},
      ${timeline}::jsonb
    )
  `;

  return json(201, {
    quote: {
      id: quote.id,
      trackingNumber: quote.tracking_number,
      status: quote.status,
      createdAt: quote.created_at,
    },
  });
}

async function getShipment(tracking: string) {
  const normalizedTracking = tracking.trim().toUpperCase();
  if (!isTrackingNumber(normalizedTracking)) {
    return json(400, { error: 'invalid_tracking_number', message: 'Tracking number must use the IF-##### format.' });
  }

  const db = getDatabase();
  const rows = await db.sql`
    SELECT
      tracking_number,
      route,
      origin,
      destination,
      status,
      pickup_date,
      delivery_date,
      eta,
      equipment,
      public_notes,
      timeline,
      updated_at
    FROM public_shipments
    WHERE tracking_number = ${normalizedTracking}
    LIMIT 1
  `;

  const shipment = rows[0];
  if (!shipment) {
    return json(404, { error: 'not_found', message: 'Tracking number was not found.' });
  }

  return json(200, {
    shipment: {
      trackingNumber: shipment.tracking_number,
      route: shipment.route,
      origin: shipment.origin,
      destination: shipment.destination,
      status: shipment.status,
      pickupDate: shipment.pickup_date,
      deliveryDate: shipment.delivery_date,
      eta: shipment.eta,
      equipment: shipment.equipment,
      notes: shipment.public_notes,
      timeline: shipment.timeline,
      updatedAt: shipment.updated_at,
    },
  });
}

export default async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: SECURITY_HEADERS });
  }

  const url = new URL(req.url);
  const trackingMatch = url.pathname.match(/^\/api\/public\/shipments\/([^/]+)$/);
  const rewrittenTracking = url.searchParams.get('trackingNumber');

  if (req.method === 'GET' && trackingMatch?.[1]) {
    return getShipment(decodeURIComponent(trackingMatch[1]));
  }

  if (req.method === 'GET' && rewrittenTracking) {
    return getShipment(rewrittenTracking);
  }

  if (
    req.method === 'POST' &&
    (url.pathname === '/api/public/quote-requests' || url.pathname === '/.netlify/functions/public-freight')
  ) {
    return createQuote(req);
  }

  return json(405, { error: 'method_not_allowed' });
};

export const config: Config = {
  path: ['/api/public/quote-requests', '/api/public/shipments/:trackingNumber'],
};
