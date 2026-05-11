import { getDatabase } from '@netlify/database';
import type { Config } from '@netlify/functions';

const MAX_LIST = 50;

type LoadRequestInput = {
  loadId?: unknown;
  lane?: unknown;
  equipment?: unknown;
  totalPay?: unknown;
  ratePerMile?: unknown;
  carrierName?: unknown;
  mcNumber?: unknown;
  contactEmail?: unknown;
  contactPhone?: unknown;
  askingRate?: unknown;
  notes?: unknown;
};

type SavedLoadRequest = {
  id: string;
  loadId: string;
  lane: string;
  equipment: string;
  totalPay: number | null;
  ratePerMile: number | null;
  carrierName: string;
  mcNumber: string;
  contactEmail: string;
  contactPhone: string;
  askingRate: number | null;
  notes: string;
  status: 'pending';
  createdAt?: string;
};

const isString = (v: unknown): v is string => typeof v === 'string';
const trimOrEmpty = (v: unknown, max = 240): string =>
  isString(v) ? v.trim().slice(0, max) : '';
const toFiniteNumber = (v: unknown): number | null => {
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (isString(v) && v.trim() !== '') {
    const parsed = Number(v);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
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
  new Response(JSON.stringify(body), {
    status,
    headers: SECURITY_HEADERS,
  });

export default async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: SECURITY_HEADERS,
    });
  }

  const db = getDatabase();

  if (req.method === 'GET') {
    const rows = await db.sql`
      SELECT
        id,
        load_id,
        lane,
        equipment,
        total_pay,
        rate_per_mile,
        carrier_name,
        mc_number,
        contact_email,
        contact_phone,
        asking_rate,
        notes,
        status,
        created_at
      FROM carrier_load_requests
      ORDER BY created_at DESC
      LIMIT ${MAX_LIST}
    `;
    const records = rows.map((row: Record<string, unknown>) => ({
      id: row.id,
      loadId: row.load_id,
      lane: row.lane,
      equipment: row.equipment,
      totalPay: row.total_pay,
      ratePerMile: row.rate_per_mile,
      carrierName: row.carrier_name,
      mcNumber: row.mc_number,
      contactEmail: row.contact_email,
      contactPhone: row.contact_phone,
      askingRate: row.asking_rate,
      notes: row.notes,
      status: row.status,
      createdAt: row.created_at,
    }));
    return json(200, { requests: records });
  }

  if (req.method !== 'POST') {
    return json(405, { error: 'method_not_allowed' });
  }

  let body: LoadRequestInput;
  try {
    body = (await req.json()) as LoadRequestInput;
  } catch {
    return json(400, { error: 'invalid_json' });
  }

  const loadId = trimOrEmpty(body.loadId, 64);
  const carrierName = trimOrEmpty(body.carrierName, 120);
  const mcNumber = trimOrEmpty(body.mcNumber, 32);
  const contactEmail = trimOrEmpty(body.contactEmail, 160);
  const contactPhone = trimOrEmpty(body.contactPhone, 32);

  const missing: string[] = [];
  if (!loadId) missing.push('loadId');
  if (!carrierName) missing.push('carrierName');
  if (!mcNumber) missing.push('mcNumber');
  if (!contactEmail && !contactPhone) missing.push('contactEmailOrPhone');
  if (missing.length > 0) {
    return json(400, { error: 'missing_fields', fields: missing });
  }

  const id = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  const record: SavedLoadRequest = {
    id,
    loadId,
    lane: trimOrEmpty(body.lane, 200),
    equipment: trimOrEmpty(body.equipment, 64),
    totalPay: toFiniteNumber(body.totalPay),
    ratePerMile: toFiniteNumber(body.ratePerMile),
    carrierName,
    mcNumber,
    contactEmail,
    contactPhone,
    askingRate: toFiniteNumber(body.askingRate),
    notes: trimOrEmpty(body.notes, 1000),
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  const [saved] = await db.sql`
    INSERT INTO carrier_load_requests (
      id,
      load_id,
      lane,
      equipment,
      total_pay,
      rate_per_mile,
      carrier_name,
      mc_number,
      contact_email,
      contact_phone,
      asking_rate,
      notes,
      status
    )
    VALUES (
      ${record.id},
      ${record.loadId},
      ${record.lane || null},
      ${record.equipment || null},
      ${record.totalPay},
      ${record.ratePerMile},
      ${record.carrierName},
      ${record.mcNumber},
      ${record.contactEmail || null},
      ${record.contactPhone || null},
      ${record.askingRate},
      ${record.notes || null},
      ${record.status}
    )
    RETURNING created_at
  `;

  return json(201, { request: { ...record, createdAt: saved.created_at } });
};

export const config: Config = {
  path: ['/api/load-requests', '/api/load-requests/:id'],
};
