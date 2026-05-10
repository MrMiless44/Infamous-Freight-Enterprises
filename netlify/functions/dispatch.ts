import { getDatabase } from '@netlify/database';
import type { Config } from '@netlify/functions';
import { requireAuth, type TokenPayload } from './lib/auth.ts';
import { json, options, genId } from './lib/http.ts';
import { text, toNumber, parseBody, parseUrl, extractParam } from './lib/validate.ts';

function rowToAssignment(row: Record<string, unknown>) {
  return {
    id: row.id,
    loadId: row.load_id,
    carrierId: row.carrier_id,
    driverId: row.driver_id,
    score: row.score ? Number(row.score) : null,
    method: row.method,
    status: row.status,
    assignedBy: row.assigned_by,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function getDispatchBoard(user: TokenPayload) {
  const db = getDatabase();

  const loadRows = await db.sql`
    SELECT l.*, c.name AS carrier_name, d.name AS driver_name
    FROM loads l
    LEFT JOIN carriers c ON l.carrier_id = c.id
    LEFT JOIN drivers d ON l.driver_id = d.id
    WHERE l.status IN ('available', 'booked', 'carrier_assigned', 'pickup_scheduled', 'picked_up', 'in_transit', 'out_for_delivery')
    ORDER BY l.pickup_at ASC NULLS LAST
    LIMIT 100
  `;

  const columns: Record<string, unknown[]> = {
    available: [],
    booked: [],
    carrier_assigned: [],
    in_transit: [],
    delivered: [],
  };

  for (const row of loadRows) {
    const r = row as Record<string, unknown>;
    const status = r.status as string;
    const load = {
      id: r.id,
      trackingNumber: r.tracking_number,
      origin: r.origin,
      destination: r.destination,
      pickupAt: r.pickup_at,
      deliveryAt: r.delivery_at,
      rate: r.rate ? Number(r.rate) : null,
      miles: r.miles,
      equipment: r.equipment,
      status,
      carrierName: r.carrier_name,
      driverName: r.driver_name,
      driverId: r.driver_id,
      carrierId: r.carrier_id,
    };

    const col =
      status === 'available' ? 'available'
      : status === 'booked' ? 'booked'
      : ['carrier_assigned', 'pickup_scheduled'].includes(status) ? 'carrier_assigned'
      : ['picked_up', 'in_transit', 'out_for_delivery', 'delayed'].includes(status) ? 'in_transit'
      : 'delivered';
    columns[col]?.push(load);
  }

  const carrierRows = await db.sql`
    SELECT id, name, mc_number, rating, on_time_rate, total_loads, status
    FROM carriers WHERE status = 'active'
    ORDER BY rating DESC NULLS LAST LIMIT 50
  `;

  const availableCarriers = carrierRows.map((r: Record<string, unknown>) => ({
    id: r.id,
    name: r.name,
    mcNumber: r.mc_number,
    rating: r.rating ? Number(r.rating) : null,
    onTimeRate: r.on_time_rate ? Number(r.on_time_rate) : null,
    totalLoads: r.total_loads,
    status: r.status,
  }));

  return json(200, { columns, carriers: availableCarriers });
}

async function autoDispatch(req: Request, user: TokenPayload) {
  let body: { loadId?: unknown };
  try {
    body = await parseBody<typeof body>(req);
  } catch {
    return json(400, { error: 'invalid_json' });
  }

  const loadId = text(body.loadId, 64);
  if (!loadId) return json(400, { error: 'missing_fields', fields: ['loadId'] });

  const db = getDatabase();
  const loadRows = await db.sql`SELECT * FROM loads WHERE id = ${loadId} LIMIT 1`;
  if (loadRows.length === 0) return json(404, { error: 'load_not_found' });

  const load = loadRows[0] as Record<string, unknown>;
  if (load.status !== 'available' && load.status !== 'booked') {
    return json(400, { error: 'invalid_status', message: 'Load must be available or booked for dispatch.' });
  }

  const carrierRows = await db.sql`
    SELECT id, name, rating, on_time_rate, total_loads
    FROM carriers WHERE status = 'active'
    ORDER BY rating DESC NULLS LAST, on_time_rate DESC NULLS LAST
    LIMIT 10
  `;

  const ranked = carrierRows.map((r: Record<string, unknown>) => {
    const rating = Number(r.rating || 0);
    const onTime = Number(r.on_time_rate || 0);
    const experience = Math.min(Number(r.total_loads || 0) / 100, 1);
    const score = Math.round((rating * 40 + onTime * 40 + experience * 20) * 100) / 100;
    return {
      carrierId: r.id as string,
      carrierName: r.name,
      score,
      rating,
      onTimeRate: onTime,
      totalLoads: r.total_loads,
    };
  }).sort((a, b) => b.score - a.score);

  if (ranked.length === 0) {
    return json(200, { matched: false, message: 'No active carriers available.' });
  }

  const best = ranked[0];
  const assignmentId = genId();

  await db.sql`
    INSERT INTO dispatch_assignments (id, load_id, carrier_id, score, method, status, assigned_by)
    VALUES (${assignmentId}, ${loadId}, ${best.carrierId}, ${best.score}, 'auto', 'pending', ${user.sub})
  `;

  await db.sql`UPDATE loads SET carrier_id = ${best.carrierId}, status = 'carrier_assigned' WHERE id = ${loadId}`;

  return json(200, {
    matched: true,
    assignment: { id: assignmentId, loadId, ...best },
    rankings: ranked,
  });
}

async function getBackhauls(driverId: string) {
  const db = getDatabase();

  const driverRows = await db.sql`
    SELECT current_location, current_lat, current_lng FROM drivers WHERE id = ${driverId} LIMIT 1
  `;
  if (driverRows.length === 0) return json(404, { error: 'driver_not_found' });

  const driver = driverRows[0] as Record<string, unknown>;
  const location = driver.current_location as string | null;

  let rows;
  if (location) {
    rows = await db.sql`
      SELECT * FROM loads WHERE status = 'available'
      AND origin ILIKE ${'%' + location + '%'}
      ORDER BY rate DESC NULLS LAST LIMIT 20
    `;
  } else {
    rows = await db.sql`
      SELECT * FROM loads WHERE status = 'available'
      ORDER BY created_at DESC LIMIT 20
    `;
  }

  const loads = rows.map((r: Record<string, unknown>) => ({
    id: r.id,
    trackingNumber: r.tracking_number,
    origin: r.origin,
    destination: r.destination,
    rate: r.rate ? Number(r.rate) : null,
    miles: r.miles,
    equipment: r.equipment,
    pickupAt: r.pickup_at,
  }));

  return json(200, { backhauls: loads, driverLocation: location });
}

export default async (req: Request) => {
  if (req.method === 'OPTIONS') return options();

  const auth = await requireAuth(req);
  if (auth instanceof Response) return auth;

  const url = parseUrl(req);
  const path = url.pathname;

  if (req.method === 'GET' && path === '/api/dispatch/board') return getDispatchBoard(auth);
  if (req.method === 'POST' && path === '/api/dispatch/auto') return autoDispatch(req, auth);

  const backhaulDriver = extractParam(path, /^\/api\/dispatch\/backhauls\/([^/]+)$/);
  if (backhaulDriver && req.method === 'GET') return getBackhauls(backhaulDriver);

  return json(405, { error: 'method_not_allowed' });
};

export const config: Config = {
  path: ['/api/dispatch/board', '/api/dispatch/auto', '/api/dispatch/backhauls/:driverId'],
};
