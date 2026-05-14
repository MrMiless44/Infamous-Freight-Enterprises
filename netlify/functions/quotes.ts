import { getDatabase } from '@netlify/database';
import type { Config } from '@netlify/functions';
import { requireAuth } from './lib/auth.ts';
import { json, options, genId, genQuoteNumber, genTrackingNumber } from './lib/http.ts';
import { text, toNumber, toInt, toDate, parseBody, parseUrl, extractParam } from './lib/validate.ts';
import { withSentry } from './lib/sentry.ts';

const MAX_LIST = 50;

type QuoteInput = {
  publicRequestId?: unknown;
  shipper?: unknown;
  origin?: unknown;
  destination?: unknown;
  commodity?: unknown;
  freightType?: unknown;
  weightLbs?: unknown;
  equipment?: unknown;
  pickupDate?: unknown;
  deliveryDeadline?: unknown;
  laneMiles?: unknown;
  quotedAmount?: unknown;
  estimatedCarrierCost?: unknown;
  targetMargin?: unknown;
  notes?: unknown;
  status?: unknown;
};

const RATE_TABLE: Record<string, { basePerMile: number; fuelSurcharge: number; minCharge: number }> = {
  'Dry van': { basePerMile: 2.45, fuelSurcharge: 0.35, minCharge: 750 },
  'Reefer': { basePerMile: 3.10, fuelSurcharge: 0.42, minCharge: 1200 },
  'Flatbed': { basePerMile: 2.85, fuelSurcharge: 0.38, minCharge: 950 },
  'Step deck': { basePerMile: 3.25, fuelSurcharge: 0.40, minCharge: 1100 },
  'Power only': { basePerMile: 1.95, fuelSurcharge: 0.30, minCharge: 500 },
  'Hotshot': { basePerMile: 2.15, fuelSurcharge: 0.32, minCharge: 600 },
  'LTL': { basePerMile: 1.75, fuelSurcharge: 0.28, minCharge: 350 },
  'Partial': { basePerMile: 2.10, fuelSurcharge: 0.33, minCharge: 550 },
};

function calculateRate(equipment: string, miles: number, weight: number | null) {
  const rates = RATE_TABLE[equipment] || RATE_TABLE['Dry van'];
  const ratePerMile = rates.basePerMile + rates.fuelSurcharge;
  let total = Math.max(miles * ratePerMile, rates.minCharge);

  if (weight && weight > 40000) total *= 1.08;
  if (miles > 1500) total *= 0.95;
  if (miles < 200) total *= 1.15;

  const carrierCost = total * 0.82;
  const margin = ((total - carrierCost) / total) * 100;

  return {
    quotedAmount: Math.round(total * 100) / 100,
    estimatedCarrierCost: Math.round(carrierCost * 100) / 100,
    ratePerMile: Math.round(ratePerMile * 100) / 100,
    targetMargin: Math.round(margin * 100) / 100,
  };
}

function rowToQuote(row: Record<string, unknown>) {
  return {
    id: row.id,
    quoteNumber: row.quote_number,
    publicRequestId: row.public_request_id,
    shipper: row.shipper,
    origin: row.origin,
    destination: row.destination,
    commodity: row.commodity,
    freightType: row.freight_type,
    weightLbs: row.weight_lbs,
    equipment: row.equipment,
    pickupDate: row.pickup_date,
    deliveryDeadline: row.delivery_deadline,
    laneMiles: row.lane_miles,
    quotedAmount: row.quoted_amount ? Number(row.quoted_amount) : null,
    estimatedCarrierCost: row.estimated_carrier_cost ? Number(row.estimated_carrier_cost) : null,
    targetMargin: row.target_margin ? Number(row.target_margin) : null,
    ratePerMile: row.rate_per_mile ? Number(row.rate_per_mile) : null,
    status: row.status,
    convertedLoadId: row.converted_load_id,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function listQuotes(req: Request) {
  const url = parseUrl(req);
  const status = url.searchParams.get('status');
  const db = getDatabase();
  let rows;
  if (status) {
    rows = await db.sql`SELECT * FROM quotes WHERE status = ${status} ORDER BY created_at DESC LIMIT ${MAX_LIST}`;
  } else {
    rows = await db.sql`SELECT * FROM quotes ORDER BY created_at DESC LIMIT ${MAX_LIST}`;
  }
  return json(200, { quotes: rows.map((r: Record<string, unknown>) => rowToQuote(r)) });
}

async function createQuote(req: Request) {
  let body: QuoteInput;
  try {
    body = await parseBody<QuoteInput>(req);
  } catch {
    return json(400, { error: 'invalid_json' });
  }

  const shipper = text(body.shipper, 160);
  const origin = text(body.origin, 200);
  const destination = text(body.destination, 200);
  const freightType = text(body.freightType, 160);

  if (!shipper || !origin || !destination || !freightType) {
    const fields = ['shipper', 'origin', 'destination', 'freightType'];
    return json(400, { error: 'missing_fields', fields: fields.filter((f) => !text((body as Record<string, unknown>)[f])) });
  }

  const id = genId();
  const quoteNumber = genQuoteNumber();
  const equipment = text(body.equipment, 64) || 'Dry van';
  const laneMiles = toInt(body.laneMiles);
  const weightLbs = toInt(body.weightLbs);
  const pickupDate = toDate(body.pickupDate);
  const deliveryDeadline = toDate(body.deliveryDeadline);
  const publicRequestId = text(body.publicRequestId, 64) || null;
  const commodity = text(body.commodity, 200) || null;
  const notes = text(body.notes, 1000) || null;

  let quotedAmount = toNumber(body.quotedAmount);
  let estimatedCarrierCost = toNumber(body.estimatedCarrierCost);
  let targetMargin = toNumber(body.targetMargin);
  let ratePerMile: number | null = null;

  if (laneMiles && laneMiles > 0 && quotedAmount === null) {
    const pricing = calculateRate(equipment, laneMiles, weightLbs);
    quotedAmount = pricing.quotedAmount;
    estimatedCarrierCost = pricing.estimatedCarrierCost;
    targetMargin = pricing.targetMargin;
    ratePerMile = pricing.ratePerMile;
  } else if (quotedAmount && laneMiles && laneMiles > 0) {
    ratePerMile = Math.round((quotedAmount / laneMiles) * 100) / 100;
  }

  const db = getDatabase();
  const [row] = await db.sql`
    INSERT INTO quotes (
      id, quote_number, public_request_id, shipper, origin, destination, commodity,
      freight_type, weight_lbs, equipment, pickup_date, delivery_deadline, lane_miles,
      quoted_amount, estimated_carrier_cost, target_margin, rate_per_mile, notes
    ) VALUES (
      ${id}, ${quoteNumber}, ${publicRequestId}, ${shipper}, ${origin}, ${destination}, ${commodity},
      ${freightType}, ${weightLbs}, ${equipment}, ${pickupDate}, ${deliveryDeadline}, ${laneMiles},
      ${quotedAmount}, ${estimatedCarrierCost}, ${targetMargin}, ${ratePerMile}, ${notes}
    ) RETURNING *
  `;

  return json(201, { quote: rowToQuote(row as Record<string, unknown>) });
}

async function updateQuote(req: Request, id: string) {
  let body: QuoteInput;
  try {
    body = await parseBody<QuoteInput>(req);
  } catch {
    return json(400, { error: 'invalid_json' });
  }

  const db = getDatabase();
  const existing = await db.sql`SELECT id FROM quotes WHERE id = ${id} LIMIT 1`;
  if (existing.length === 0) return json(404, { error: 'not_found' });

  if (body.quotedAmount !== undefined) await db.sql`UPDATE quotes SET quoted_amount = ${toNumber(body.quotedAmount)} WHERE id = ${id}`;
  if (body.estimatedCarrierCost !== undefined) await db.sql`UPDATE quotes SET estimated_carrier_cost = ${toNumber(body.estimatedCarrierCost)} WHERE id = ${id}`;
  if (body.targetMargin !== undefined) await db.sql`UPDATE quotes SET target_margin = ${toNumber(body.targetMargin)} WHERE id = ${id}`;
  if (body.status !== undefined) await db.sql`UPDATE quotes SET status = ${text(body.status, 32)} WHERE id = ${id}`;
  if (body.notes !== undefined) await db.sql`UPDATE quotes SET notes = ${text(body.notes, 1000)} WHERE id = ${id}`;

  const [row] = await db.sql`SELECT * FROM quotes WHERE id = ${id}`;
  return json(200, { quote: rowToQuote(row as Record<string, unknown>) });
}

async function convertToLoad(id: string) {
  const db = getDatabase();
  const rows = await db.sql`SELECT * FROM quotes WHERE id = ${id} LIMIT 1`;
  if (rows.length === 0) return json(404, { error: 'not_found' });

  const quote = rows[0] as Record<string, unknown>;
  if (quote.status === 'converted') return json(400, { error: 'already_converted' });
  if (quote.converted_load_id) return json(400, { error: 'already_converted' });

  const loadId = genId();
  const trackingNumber = genTrackingNumber();

  const [load] = await db.sql`
    INSERT INTO loads (
      id, tracking_number, origin, destination, rate, miles, equipment,
      weight_lbs, commodity, status, shipper_name
    ) VALUES (
      ${loadId}, ${trackingNumber}, ${quote.origin as string}, ${quote.destination as string},
      ${quote.quoted_amount}, ${quote.lane_miles}, ${quote.equipment as string},
      ${quote.weight_lbs}, ${quote.commodity}, 'available', ${quote.shipper as string}
    ) RETURNING *
  `;

  await db.sql`UPDATE quotes SET status = 'converted', converted_load_id = ${loadId} WHERE id = ${id}`;

  return json(201, {
    load: {
      id: load.id,
      trackingNumber: load.tracking_number,
      origin: load.origin,
      destination: load.destination,
      rate: load.rate ? Number(load.rate) : null,
      status: load.status,
    },
  });
}

async function getEstimate(req: Request) {
  const url = parseUrl(req);
  const equipment = url.searchParams.get('equipment') || 'Dry van';
  const miles = toInt(url.searchParams.get('miles'));
  const weight = toInt(url.searchParams.get('weight'));

  if (!miles || miles <= 0) return json(400, { error: 'missing_fields', fields: ['miles'] });

  const pricing = calculateRate(equipment, miles, weight);
  const lowEstimate = Math.round(pricing.quotedAmount * 0.88);
  const highEstimate = Math.round(pricing.quotedAmount * 1.12);

  return json(200, {
    estimate: {
      low: lowEstimate,
      mid: pricing.quotedAmount,
      high: highEstimate,
      ratePerMile: pricing.ratePerMile,
      carrierCost: pricing.estimatedCarrierCost,
      margin: pricing.targetMargin,
      equipment,
      miles,
      confidence: miles > 100 && miles < 3000 ? 85 : 65,
    },
  });
}

export default withSentry(async (req: Request) => {
  if (req.method === 'OPTIONS') return options();

  const url = parseUrl(req);
  const path = url.pathname;

  if (req.method === 'GET' && path === '/api/quotes/estimate') return getEstimate(req);

  const auth = await requireAuth(req);
  if (auth instanceof Response) return auth;

  if (req.method === 'GET' && path === '/api/quotes') return listQuotes(req);
  if (req.method === 'POST' && path === '/api/quotes') return createQuote(req);

  const convertId = extractParam(path, /^\/api\/quotes\/([^/]+)\/convert$/);
  if (convertId && req.method === 'POST') return convertToLoad(convertId);

  const quoteId = extractParam(path, /^\/api\/quotes\/([^/]+)$/);
  if (quoteId) {
    if (req.method === 'GET') {
      const db = getDatabase();
      const rows = await db.sql`SELECT * FROM quotes WHERE id = ${quoteId} LIMIT 1`;
      if (rows.length === 0) return json(404, { error: 'not_found' });
      return json(200, { quote: rowToQuote(rows[0] as Record<string, unknown>) });
    }
    if (req.method === 'PATCH') return updateQuote(req, quoteId);
  }

  return json(405, { error: 'method_not_allowed' });
});

export const config: Config = {
  path: ['/api/quotes', '/api/quotes/estimate', '/api/quotes/:id', '/api/quotes/:id/convert'],
};
