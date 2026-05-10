import { getDatabase } from '@netlify/database';
import type { Config } from '@netlify/functions';
import { requireAuth, type TokenPayload } from './lib/auth.ts';
import { json, options, genId, genTrackingNumber } from './lib/http.ts';
import { text, toNumber, toInt, toTimestamp, parseBody, parseUrl, extractParam } from './lib/validate.ts';

const MAX_LIST = 50;

const VALID_STATUSES = [
  'quote_pending',
  'available',
  'booked',
  'carrier_assigned',
  'pickup_scheduled',
  'picked_up',
  'in_transit',
  'delayed',
  'out_for_delivery',
  'delivered',
  'pod_uploaded',
  'invoiced',
  'paid',
  'cancelled',
] as const;

const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  quote_pending: ['available', 'booked', 'cancelled'],
  available: ['booked', 'cancelled'],
  booked: ['carrier_assigned', 'cancelled'],
  carrier_assigned: ['pickup_scheduled', 'cancelled'],
  pickup_scheduled: ['picked_up', 'cancelled'],
  picked_up: ['in_transit', 'cancelled'],
  in_transit: ['delayed', 'out_for_delivery', 'delivered'],
  delayed: ['in_transit', 'out_for_delivery', 'delivered', 'cancelled'],
  out_for_delivery: ['delivered'],
  delivered: ['pod_uploaded'],
  pod_uploaded: ['invoiced'],
  invoiced: ['paid'],
  paid: [],
  cancelled: [],
};

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
  shipperCompanyId?: unknown;
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
    shipperCompanyId: row.shipper_company_id,
    specialInstructions: row.special_instructions,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function rowToEvent(row: Record<string, unknown>) {
  return {
    id: row.id,
    loadId: row.load_id,
    status: row.status,
    changedBy: row.changed_by,
    notes: row.notes,
    lat: row.lat ? Number(row.lat) : null,
    lng: row.lng ? Number(row.lng) : null,
    address: row.address,
    createdAt: row.created_at,
  };
}

async function listLoads(req: Request, user: TokenPayload) {
  const url = parseUrl(req);
  const status = url.searchParams.get('status');
  const db = getDatabase();

  let rows;
  if (user.role === 'driver') {
    const driverRows = await db.sql`SELECT id FROM drivers WHERE user_id = ${user.sub} LIMIT 1`;
    const driverId = (driverRows[0] as Record<string, unknown>)?.id as string | undefined;
    if (!driverId) return json(200, { loads: [] });
    if (status) {
      rows = await db.sql`
        SELECT * FROM loads WHERE driver_id = ${driverId} AND status = ${status}
        ORDER BY created_at DESC LIMIT ${MAX_LIST}
      `;
    } else {
      rows = await db.sql`
        SELECT * FROM loads WHERE driver_id = ${driverId} ORDER BY created_at DESC LIMIT ${MAX_LIST}
      `;
    }
  } else if (user.role === 'customer' && user.carrier_id) {
    if (status) {
      rows = await db.sql`
        SELECT * FROM loads WHERE shipper_company_id = ${user.carrier_id} AND status = ${status}
        ORDER BY created_at DESC LIMIT ${MAX_LIST}
      `;
    } else {
      rows = await db.sql`
        SELECT * FROM loads WHERE shipper_company_id = ${user.carrier_id}
        ORDER BY created_at DESC LIMIT ${MAX_LIST}
      `;
    }
  } else if (user.role === 'carrier' && user.carrier_id) {
    if (status) {
      rows = await db.sql`
        SELECT * FROM loads WHERE carrier_id = ${user.carrier_id} AND status = ${status}
        ORDER BY created_at DESC LIMIT ${MAX_LIST}
      `;
    } else {
      rows = await db.sql`
        SELECT * FROM loads WHERE carrier_id = ${user.carrier_id}
        ORDER BY created_at DESC LIMIT ${MAX_LIST}
      `;
    }
  } else {
    if (status) {
      rows = await db.sql`
        SELECT * FROM loads WHERE status = ${status} ORDER BY created_at DESC LIMIT ${MAX_LIST}
      `;
    } else {
      rows = await db.sql`SELECT * FROM loads ORDER BY created_at DESC LIMIT ${MAX_LIST}`;
    }
  }

  return json(200, { loads: rows.map((r: Record<string, unknown>) => rowToLoad(r)) });
}

async function getLoad(id: string) {
  const db = getDatabase();
  const rows = await db.sql`SELECT * FROM loads WHERE id = ${id} LIMIT 1`;
  if (rows.length === 0) return json(404, { error: 'not_found' });

  const events = await db.sql`
    SELECT * FROM status_events WHERE load_id = ${id} ORDER BY created_at ASC
  `;

  return json(200, {
    load: rowToLoad(rows[0] as Record<string, unknown>),
    timeline: events.map((r: Record<string, unknown>) => rowToEvent(r)),
  });
}

async function createLoad(req: Request, user: TokenPayload) {
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
  const shipperCompanyId = text(body.shipperCompanyId, 64) || null;
  const specialInstructions = text(body.specialInstructions, 1200) || null;
  const notes = text(body.notes, 1000) || null;

  const db = getDatabase();
  const [row] = await db.sql`
    INSERT INTO loads (
      id, tracking_number, origin, destination, pickup_at, delivery_at,
      rate, miles, equipment, weight_lbs, commodity, status,
      driver_id, carrier_id, shipper_name, shipper_email, shipper_company_id,
      special_instructions, notes
    ) VALUES (
      ${id}, ${trackingNumber}, ${origin}, ${destination}, ${pickupAt}, ${deliveryAt},
      ${rate}, ${miles}, ${equipment}, ${weightLbs}, ${commodity}, ${status},
      ${driverId}, ${carrierId}, ${shipperName}, ${shipperEmail}, ${shipperCompanyId},
      ${specialInstructions}, ${notes}
    ) RETURNING *
  `;

  const eventId = genId();
  await db.sql`
    INSERT INTO status_events (id, load_id, status, changed_by, notes)
    VALUES (${eventId}, ${id}, ${status}, ${user.sub}, 'Load created')
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
  if (body.driverId !== undefined) await db.sql`UPDATE loads SET driver_id = ${text(body.driverId, 64) || null} WHERE id = ${id}`;
  if (body.carrierId !== undefined) await db.sql`UPDATE loads SET carrier_id = ${text(body.carrierId, 64) || null} WHERE id = ${id}`;
  if (body.notes !== undefined) await db.sql`UPDATE loads SET notes = ${text(body.notes, 1000)} WHERE id = ${id}`;

  const [row] = await db.sql`SELECT * FROM loads WHERE id = ${id}`;
  return json(200, { load: rowToLoad(row as Record<string, unknown>) });
}

async function updateStatus(req: Request, id: string, user: TokenPayload) {
  let body: { status?: unknown; notes?: unknown; lat?: unknown; lng?: unknown; address?: unknown };
  try {
    body = await parseBody<typeof body>(req);
  } catch {
    return json(400, { error: 'invalid_json' });
  }

  const newStatus = text(body.status, 32);
  if (!newStatus) return json(400, { error: 'missing_fields', fields: ['status'] });

  if (!VALID_STATUSES.includes(newStatus as (typeof VALID_STATUSES)[number])) {
    return json(400, { error: 'invalid_status', validStatuses: VALID_STATUSES });
  }

  const db = getDatabase();
  const rows = await db.sql`SELECT * FROM loads WHERE id = ${id} LIMIT 1`;
  if (rows.length === 0) return json(404, { error: 'not_found' });

  const load = rows[0] as Record<string, unknown>;
  const currentStatus = load.status as string;
  const allowed = ALLOWED_TRANSITIONS[currentStatus];

  if (allowed && !allowed.includes(newStatus)) {
    return json(400, {
      error: 'invalid_transition',
      message: `Cannot transition from '${currentStatus}' to '${newStatus}'.`,
      allowedTransitions: allowed,
    });
  }

  await db.sql`UPDATE loads SET status = ${newStatus} WHERE id = ${id}`;

  const eventId = genId();
  const eventNotes = text(body.notes, 1000) || null;
  const lat = toNumber(body.lat);
  const lng = toNumber(body.lng);
  const address = text(body.address, 300) || null;

  await db.sql`
    INSERT INTO status_events (id, load_id, status, changed_by, notes, lat, lng, address)
    VALUES (${eventId}, ${id}, ${newStatus}, ${user.sub}, ${eventNotes}, ${lat}, ${lng}, ${address})
  `;

  const driverId = load.driver_id as string | null;
  const shipperEmail = load.shipper_email as string | null;

  if (driverId) {
    const driverUser = await db.sql`SELECT user_id FROM drivers WHERE id = ${driverId} LIMIT 1`;
    const driverUserId = (driverUser[0] as Record<string, unknown>)?.user_id as string | undefined;
    if (driverUserId) {
      const notifId = genId();
      await db.sql`
        INSERT INTO notifications (id, user_id, type, title, message, data)
        VALUES (
          ${notifId}, ${driverUserId}, 'status_change',
          ${'Load ' + (load.tracking_number as string) + ' Updated'},
          ${'Status changed to ' + newStatus},
          ${JSON.stringify({ loadId: id, status: newStatus, trackingNumber: load.tracking_number })}::jsonb
        )
      `;
    }
  }

  if (shipperEmail) {
    const shipperUsers = await db.sql`SELECT id FROM users WHERE email = ${shipperEmail} LIMIT 1`;
    const shipperUserId = (shipperUsers[0] as Record<string, unknown>)?.id as string | undefined;
    if (shipperUserId) {
      const notifId = genId();
      await db.sql`
        INSERT INTO notifications (id, user_id, type, title, message, data)
        VALUES (
          ${notifId}, ${shipperUserId}, 'status_change',
          ${'Shipment ' + (load.tracking_number as string) + ' Update'},
          ${'Your shipment status is now: ' + newStatus},
          ${JSON.stringify({ loadId: id, status: newStatus, trackingNumber: load.tracking_number })}::jsonb
        )
      `;
    }
  }

  const [updated] = await db.sql`SELECT * FROM loads WHERE id = ${id}`;
  const events = await db.sql`
    SELECT * FROM status_events WHERE load_id = ${id} ORDER BY created_at ASC
  `;

  return json(200, {
    load: rowToLoad(updated as Record<string, unknown>),
    timeline: events.map((r: Record<string, unknown>) => rowToEvent(r)),
  });
}

async function getTimeline(id: string) {
  const db = getDatabase();
  const loadCheck = await db.sql`SELECT id FROM loads WHERE id = ${id} LIMIT 1`;
  if (loadCheck.length === 0) return json(404, { error: 'not_found' });

  const events = await db.sql`
    SELECT * FROM status_events WHERE load_id = ${id} ORDER BY created_at ASC
  `;

  return json(200, {
    timeline: events.map((r: Record<string, unknown>) => rowToEvent(r)),
  });
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

export default async (req: Request) => {
  if (req.method === 'OPTIONS') return options();

  const url = parseUrl(req);
  const path = url.pathname;
  const auth = await requireAuth(req);
  if (auth instanceof Response) return auth;

  if (req.method === 'GET' && path === '/api/loads/search') return searchLoads(req);
  if (req.method === 'GET' && path === '/api/loads') return listLoads(req, auth);
  if (req.method === 'POST' && path === '/api/loads') return createLoad(req, auth);

  const statusId = extractParam(path, /^\/api\/loads\/([^/]+)\/status$/);
  if (statusId && req.method === 'POST') return updateStatus(req, statusId, auth);

  const timelineId = extractParam(path, /^\/api\/loads\/([^/]+)\/timeline$/);
  if (timelineId && req.method === 'GET') return getTimeline(timelineId);

  const loadId = extractParam(path, /^\/api\/loads\/([^/]+)$/);
  if (loadId) {
    if (req.method === 'GET') return getLoad(loadId);
    if (req.method === 'PATCH') return updateLoad(req, loadId);
  }

  return json(405, { error: 'method_not_allowed' });
};

export const config: Config = {
  path: ['/api/loads', '/api/loads/search', '/api/loads/:id', '/api/loads/:id/status', '/api/loads/:id/timeline'],
};
