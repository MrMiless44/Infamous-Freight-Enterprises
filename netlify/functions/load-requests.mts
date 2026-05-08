import { db } from "../../db/index.js";
import { loadRequests } from "../../db/schema.js";
import { desc } from "drizzle-orm";

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

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });

export default async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204 });
  }

  if (req.method === 'GET') {
    const records = await db
      .select()
      .from(loadRequests)
      .orderBy(desc(loadRequests.createdAt))
      .limit(MAX_LIST);

    const mapped = records.map((r) => ({
      id: r.externalId,
      loadId: r.loadId,
      lane: r.lane,
      equipment: r.equipment,
      totalPay: r.totalPay,
      ratePerMile: r.ratePerMile,
      carrierName: r.carrierName,
      mcNumber: r.mcNumber,
      contactEmail: r.contactEmail,
      contactPhone: r.contactPhone,
      askingRate: r.askingRate,
      notes: r.notes,
      status: r.status,
      createdAt: r.createdAt.toISOString(),
    }));

    return json(200, { requests: mapped });
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

  const externalId = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

  const [record] = await db
    .insert(loadRequests)
    .values({
      externalId,
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
    })
    .returning();

  return json(201, {
    request: {
      id: record.externalId,
      loadId: record.loadId,
      lane: record.lane,
      equipment: record.equipment,
      totalPay: record.totalPay,
      ratePerMile: record.ratePerMile,
      carrierName: record.carrierName,
      mcNumber: record.mcNumber,
      contactEmail: record.contactEmail,
      contactPhone: record.contactPhone,
      askingRate: record.askingRate,
      notes: record.notes,
      status: record.status,
      createdAt: record.createdAt.toISOString(),
    },
  });
};
