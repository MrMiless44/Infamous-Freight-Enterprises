import { getDatabase } from '@netlify/database';
import type { Config } from '@netlify/functions';
import { requireAuth, type TokenPayload } from './lib/auth.ts';
import { json, options, genId, genTrackingNumber } from './lib/http.ts';
import { text, toNumber, toInt, toTimestamp, parseBody, parseUrl, extractParam } from './lib/validate.ts';
import { withSentry } from './lib/sentry.ts';

const MAX_LIST = 50;

type LoadInput = {
  origin?: unknown;
  destination?: unknown;
  pickupAt?: unknown;
  deliveryAt?: unknown;
  rate?: unknown;
  miles?: unknown;
  equipment?: unknown;
  weightLbs?: unknown;
  commodity?: unknown;
  driverId?: unknown;
  carrierId?: unknown;
  shipperName?: unknown;
  shipperEmail?: unknown;
  specialInstructions?: unknown;
  notes?: unknown;
  status?: unknown;
};

function rowToLoad(row: Record<string, unknown>) {
  return {
    id: row.id,
    trackingNumber: row.tracking_number,
    origin: row.origin,
    destination: row.destination,
    pickupAt: row.pickup_at,
    deliveryAt: row.delivery_at,
    rate: row.rate ? Number(row.rate) : null,
    miles: row.miles,
    equipment: row.equipment,
    weightLbs: row.weight_lbs,
    commodity: row.commodity,
    status: row.status,
    driverId: row.driver_id,
    carrierId: row.carrier_id,
    shipperName: row.shipper_name,
    shipperEmail: row.shipper_email,
    specialInstructions: row.special_instructions,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function listLoads(req: Request, _user: TokenPayload) {
  const url = parseUrl(req);
  const status = url.searchParams.get('status');
  const db = getDatabase();

  let rows;
  if (status) {
    rows = await db.sql`
      SELECT * FROM loads WHERE status = ${status} ORDER BY created_at DESC LIMIT ${MAX_LIST}
    `;
  } else {
    rows = await db.sql`SELECT * FROM loads ORDER BY created_at DESC LIMIT ${MAX_LIST}`;
  }

  return json(200, { loads: rows.map((r: Record<string, unknown>) => rowToLoad(r)) });
}

async function getLoad(id: string) {
  const db = getDatabase();
  const rows = await db.sql`SELECT * FROM loads WHERE id = ${id} LIMIT 1`;
  if (rows.length === 0) return json(404, { error: 'not_found' });
  return json(200, { load: rowToLoad(rows[0] as Record<string, unknown>) });
}

async function createLoad(req: Request, _user: TokenPayload) {
  let body: LoadInput;
  try {
    body = await parseBody<LoadInput>(req);
  } catch {
    return json(400, { error: 'invalid_json' });
  }

  const origin = text(body.origin, 200);
  const destination = text(body.destination, 200);
  if (!origin || !destination) {
    return json(400, { error: 'missing_fields', fields: ['origin', 'destination'].filter((f) => !text((body as Record<string, unknown>)[f])) });
  }

  const id = genId();
  const trackingNumber = genTrackingNumber();
  const equipment = text(body.equipment, 64) || 'Dry van';
  const status = text(body.status, 32) || 'available';
  const pickupAt = toTimestamp(body.pickupAt);
  const deliveryAt = toTimestamp(body.deliveryAt);
  const rate = toNumber(body.rate);
  const miles = toInt(body.miles);
  const weightLbs = toInt(body.weightLbs);
  const commodity = text(body.commodity, 200) || null;
  const driverId = text(body.driverId, 64) || null;
  const carrierId = text(body.carrierId, 64) || null;
  const shipperName = text(body.shipperName, 160) || null;
  const shipperEmail = text(body.shipperEmail, 180) || null;
  const specialInstructions = text(body.specialInstructions, 1200) || null;
  const notes = text(body.notes, 1000) || null;

  const db = getDatabase();
  const [row] = await db.sql`
    INSERT INTO loads (
      id, tracking_number, origin, destination, pickup_at, delivery_at,
      rate, miles, equipment, weight_lbs, commodity, status,
      driver_id, carrier_id, shipper_name, shipper_email, special_instructions, notes
    ) VALUES (
      ${id}, ${trackingNumber}, ${origin}, ${destination}, ${pickupAt}, ${deliveryAt},
      ${rate}, ${miles}, ${equipment}, ${weightLbs}, ${commodity}, ${status},
      ${driverId}, ${carrierId}, ${shipperName}, ${shipperEmail}, ${specialInstructions}, ${notes}
    ) RETURNING *
  `;

  return json(201, { load: rowToLoad(row as Record<string, unknown>) });
}

async function updateLoad(req: Request, id: string) {
  let body: LoadInput;
  try {
    body = await parseBody<LoadInput>(req);
  } catch {
    return json(400, { error: 'invalid_json' });
  }

  const db = getDatabase();
  const existing = await db.sql`SELECT id FROM loads WHERE id = ${id} LIMIT 1`;
  if (existing.length === 0) return json(404, { error: 'not_found' });

  if (body.origin !== undefined) await db.sql`UPDATE loads SET origin = ${text(body.origin, 200)} WHERE id = ${id}`;
  if (body.destination !== undefined) await db.sql`UPDATE loads SET destination = ${text(body.destination, 200)} WHERE id = ${id}`;
  if (body.pickupAt !== undefined) await db.sql`UPDATE loads SET pickup_at = ${toTimestamp(body.pickupAt)} WHERE id = ${id}`;
  if (body.deliveryAt !== undefined) await db.sql`UPDATE loads SET delivery_at = ${toTimestamp(body.deliveryAt)} WHERE id = ${id}`;
  if (body.rate !== undefined) await db.sql`UPDATE loads SET rate = ${toNumber(body.rate)} WHERE id = ${id}`;
  if (body.miles !== undefined) await db.sql`UPDATE loads SET miles = ${toInt(body.miles)} WHERE id = ${id}`;
  if (body.equipment !== undefined) await db.sql`UPDATE loads SET equipment = ${text(body.equipment, 64)} WHERE id = ${id}`;
  if (body.weightLbs !== undefined) await db.sql`UPDATE loads SET weight_lbs = ${toInt(body.weightLbs)} WHERE id = ${id}`;
  if (body.commodity !== undefined) await db.sql`UPDATE loads SET commodity = ${text(body.commodity, 200)} WHERE id = ${id}`;
  if (body.status !== undefined) await db.sql`UPDATE loads SET status = ${text(body.status, 32)} WHERE id = ${id}`;
  if (body.driverId !== undefined) await db.sql`UPDATE loads SET driver_id = ${text(body.driverId, 64) || null} WHERE id = ${id}`;
  if (body.carrierId !== undefined) await db.sql`UPDATE loads SET carrier_id = ${text(body.carrierId, 64) || null} WHERE id = ${id}`;
  if (body.notes !== undefined) await db.sql`UPDATE loads SET notes = ${text(body.notes, 1000)} WHERE id = ${id}`;

  const [row] = await db.sql`SELECT * FROM loads WHERE id = ${id}`;
  return json(200, { load: rowToLoad(row as Record<string, unknown>) });
}

async function searchLoads(req: Request) {
  const url = parseUrl(req);
  const origin = url.searchParams.get('origin');
  const destination = url.searchParams.get('destination');
  const equipment = url.searchParams.get('equipment');
  const minRate = toNumber(url.searchParams.get('minRate'));

  const db = getDatabase();
  let rows;

  if (origin && destination) {
    rows = await db.sql`
      SELECT * FROM loads WHERE status = 'available'
      AND origin ILIKE ${'%' + origin + '%'}
      AND destination ILIKE ${'%' + destination + '%'}
      ORDER BY created_at DESC LIMIT ${MAX_LIST}
    `;
  } else if (equipment) {
    rows = await db.sql`
      SELECT * FROM loads WHERE status = 'available'
      AND equipment ILIKE ${'%' + equipment + '%'}
      ORDER BY created_at DESC LIMIT ${MAX_LIST}
    `;
  } else {
    rows = await db.sql`
      SELECT * FROM loads WHERE status = 'available' ORDER BY created_at DESC LIMIT ${MAX_LIST}
    `;
  }

  let results = rows.map((r: Record<string, unknown>) => rowToLoad(r));
  if (minRate) {
    results = results.filter((l: { rate: number | null }) => l.rate !== null && l.rate >= minRate);
  }

  return json(200, { loads: results });
}

export default withSentry(async (req: Request) => {
  if (req.method === 'OPTIONS') return options();

  const url = parseUrl(req);
  const path = url.pathname;
  const auth = await requireAuth(req);
  if (auth instanceof Response) return auth;

  if (req.method === 'GET' && path === '/api/loads/search') return searchLoads(req);
  if (req.method === 'GET' && path === '/api/loads') return listLoads(req, auth);
  if (req.method === 'POST' && path === '/api/loads') return createLoad(req, auth);

  const loadId = extractParam(path, /^\/api\/loads\/([^/]+)$/);
  if (loadId) {
    if (req.method === 'GET') return getLoad(loadId);
    if (req.method === 'PATCH') return updateLoad(req, loadId);
  }

  return json(405, { error: 'method_not_allowed' });
});

export const config: Config = {
  path: ['/api/loads', '/api/loads/search', '/api/loads/:id'],
};
