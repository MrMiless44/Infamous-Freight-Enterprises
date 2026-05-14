import { getDatabase } from '@netlify/database';
import { getStore } from '@netlify/blobs';
import type { Config } from '@netlify/functions';
import { requireAuth, type TokenPayload } from './lib/auth.ts';
import { json, options, genId } from './lib/http.ts';
import { text, toNumber, parseBody, parseUrl, extractParam } from './lib/validate.ts';
import { withSentry } from './lib/sentry.ts';

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
    notes: row.notes,
  };
}

async function getDriverProfile(user: TokenPayload) {
  const db = getDatabase();
  const rows = await db.sql`SELECT * FROM drivers WHERE user_id = ${user.sub} LIMIT 1`;
  if (rows.length === 0) return json(404, { error: 'no_driver_profile', message: 'No driver profile linked to this account.' });

  const driver = rows[0] as Record<string, unknown>;
  return json(200, {
    driver: {
      id: driver.id,
      name: driver.name,
      status: driver.status,
      hosRemainingHours: driver.hos_remaining_hours ? Number(driver.hos_remaining_hours) : null,
      currentLocation: driver.current_location,
      carrierId: driver.carrier_id,
    },
  });
}

async function getCurrentLoad(user: TokenPayload) {
  const db = getDatabase();
  const driverRows = await db.sql`SELECT id FROM drivers WHERE user_id = ${user.sub} LIMIT 1`;
  if (driverRows.length === 0) return json(404, { error: 'no_driver_profile' });

  const driverId = (driverRows[0] as Record<string, unknown>).id as string;
  const loadRows = await db.sql`
    SELECT * FROM loads WHERE driver_id = ${driverId} AND status IN ('booked', 'in_transit')
    ORDER BY pickup_at ASC LIMIT 1
  `;

  if (loadRows.length === 0) return json(200, { load: null, message: 'No active load assigned.' });
  return json(200, { load: rowToLoad(loadRows[0] as Record<string, unknown>) });
}

async function updateStatus(req: Request, user: TokenPayload) {
  let body: { status?: unknown; loadId?: unknown; notes?: unknown };
  try {
    body = await parseBody<typeof body>(req);
  } catch {
    return json(400, { error: 'invalid_json' });
  }

  const status = text(body.status, 32);
  if (!status) return json(400, { error: 'missing_fields', fields: ['status'] });

  const validStatuses = ['on_duty', 'off_duty', 'driving', 'sleeper', 'arrived_pickup', 'loading', 'departed_pickup', 'arrived_delivery', 'unloading', 'delivered'];
  if (!validStatuses.includes(status)) {
    return json(400, { error: 'invalid_status', message: `Status must be one of: ${validStatuses.join(', ')}` });
  }

  const db = getDatabase();
  const driverRows = await db.sql`SELECT id FROM drivers WHERE user_id = ${user.sub} LIMIT 1`;
  if (driverRows.length === 0) return json(404, { error: 'no_driver_profile' });

  const driverId = (driverRows[0] as Record<string, unknown>).id as string;
  const driverStatus = ['arrived_pickup', 'loading', 'departed_pickup'].includes(status)
    ? 'driving'
    : ['arrived_delivery', 'unloading', 'delivered'].includes(status)
      ? 'on_duty'
      : status;

  await db.sql`UPDATE drivers SET status = ${driverStatus} WHERE id = ${driverId}`;

  const loadId = text(body.loadId, 64);
  if (loadId) {
    const loadStatusMap: Record<string, string> = {
      arrived_pickup: 'at_pickup',
      loading: 'at_pickup',
      departed_pickup: 'in_transit',
      arrived_delivery: 'at_delivery',
      unloading: 'at_delivery',
      delivered: 'delivered',
    };
    const loadStatus = loadStatusMap[status];
    if (loadStatus) {
      await db.sql`UPDATE loads SET status = ${loadStatus} WHERE id = ${loadId}`;
    }
  }

  return json(200, { updated: true, driverStatus, loadStatus: status });
}

async function uploadPod(req: Request, user: TokenPayload) {
  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return json(400, { error: 'invalid_form_data' });
  }

  const file = formData.get('file') as File | null;
  const loadId = (formData.get('loadId') as string)?.trim();

  if (!file) return json(400, { error: 'missing_file' });
  if (!loadId) return json(400, { error: 'missing_fields', fields: ['loadId'] });
  if (file.size > 10 * 1024 * 1024) return json(400, { error: 'file_too_large' });

  const db = getDatabase();
  const loadCheck = await db.sql`SELECT id FROM loads WHERE id = ${loadId} LIMIT 1`;
  if (loadCheck.length === 0) return json(400, { error: 'invalid_load' });

  const id = genId();
  const blobKey = `documents/${id}/${file.name}`;
  const buffer = await file.arrayBuffer();

  const store = getStore('freight-documents');
  await store.set(blobKey, new Uint8Array(buffer), {
    metadata: {
      fileName: file.name,
      mimeType: file.type || 'image/jpeg',
      docType: 'POD',
      loadId,
      uploadedBy: user.sub,
    },
  });

  const [row] = await db.sql`
    INSERT INTO documents (id, load_id, type, file_name, blob_key, file_size, mime_type, uploaded_by)
    VALUES (${id}, ${loadId}, 'POD', ${file.name}, ${blobKey}, ${file.size}, ${file.type || 'image/jpeg'}, ${user.sub})
    RETURNING *
  `;

  return json(201, {
    document: {
      id: row.id,
      loadId: row.load_id,
      type: row.type,
      fileName: row.file_name,
      createdAt: row.created_at,
    },
  });
}

async function getEarnings(user: TokenPayload) {
  const db = getDatabase();
  const driverRows = await db.sql`SELECT id, carrier_id FROM drivers WHERE user_id = ${user.sub} LIMIT 1`;
  if (driverRows.length === 0) return json(404, { error: 'no_driver_profile' });

  const driverId = (driverRows[0] as Record<string, unknown>).id as string;

  const deliveredRows = await db.sql`
    SELECT COALESCE(SUM(rate), 0) as total_revenue, COUNT(*) as load_count
    FROM loads WHERE driver_id = ${driverId} AND status = 'delivered'
  `;
  const stats = deliveredRows[0] as Record<string, unknown>;
  const totalRevenue = Number(stats?.total_revenue || 0);
  const loadCount = Number(stats?.load_count || 0);

  const currentMonthRows = await db.sql`
    SELECT COALESCE(SUM(rate), 0) as month_revenue, COUNT(*) as month_loads
    FROM loads WHERE driver_id = ${driverId} AND status = 'delivered'
    AND created_at >= date_trunc('month', NOW())
  `;
  const monthly = currentMonthRows[0] as Record<string, unknown>;

  return json(200, {
    earnings: {
      totalRevenue,
      totalLoads: loadCount,
      monthRevenue: Number(monthly?.month_revenue || 0),
      monthLoads: Number(monthly?.month_loads || 0),
      averagePerLoad: loadCount > 0 ? Math.round((totalRevenue / loadCount) * 100) / 100 : 0,
    },
  });
}

async function getLoadHistory(user: TokenPayload) {
  const db = getDatabase();
  const driverRows = await db.sql`SELECT id FROM drivers WHERE user_id = ${user.sub} LIMIT 1`;
  if (driverRows.length === 0) return json(404, { error: 'no_driver_profile' });

  const driverId = (driverRows[0] as Record<string, unknown>).id as string;
  const rows = await db.sql`
    SELECT * FROM loads WHERE driver_id = ${driverId}
    ORDER BY created_at DESC LIMIT 20
  `;

  return json(200, { loads: rows.map((r: Record<string, unknown>) => rowToLoad(r)) });
}

export default withSentry(async (req: Request) => {
  if (req.method === 'OPTIONS') return options();

  const auth = await requireAuth(req);
  if (auth instanceof Response) return auth;

  const url = parseUrl(req);
  const path = url.pathname;

  if (req.method === 'GET' && path === '/api/mobile/profile') return getDriverProfile(auth);
  if (req.method === 'GET' && path === '/api/mobile/current-load') return getCurrentLoad(auth);
  if (req.method === 'POST' && path === '/api/mobile/status') return updateStatus(req, auth);
  if (req.method === 'POST' && path === '/api/mobile/pod-upload') return uploadPod(req, auth);
  if (req.method === 'GET' && path === '/api/mobile/earnings') return getEarnings(auth);
  if (req.method === 'GET' && path === '/api/mobile/load-history') return getLoadHistory(auth);

  return json(405, { error: 'method_not_allowed' });
});

export const config: Config = {
  path: [
    '/api/mobile/profile',
    '/api/mobile/current-load',
    '/api/mobile/status',
    '/api/mobile/pod-upload',
    '/api/mobile/earnings',
    '/api/mobile/load-history',
  ],
};
