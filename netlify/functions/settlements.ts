import { getDatabase } from '@netlify/database';
import type { Config } from '@netlify/functions';
import { requireAuth, type TokenPayload } from './lib/auth.ts';
import { json, options, genId } from './lib/http.ts';
import { text, toNumber, toInt, parseBody, parseUrl, extractParam } from './lib/validate.ts';

const MAX_LIST = 50;

function rowToSettlement(row: Record<string, unknown>) {
  return {
    id: row.id,
    driverId: row.driver_id,
    loadId: row.load_id,
    carrierId: row.carrier_id,
    amount: row.amount ? Number(row.amount) : 0,
    rateType: row.rate_type,
    miles: row.miles,
    deductions: row.deductions ? Number(row.deductions) : 0,
    netAmount: row.net_amount ? Number(row.net_amount) : 0,
    periodStart: row.period_start,
    periodEnd: row.period_end,
    paidAt: row.paid_at,
    status: row.status,
    notes: row.notes,
    createdAt: row.created_at,
  };
}

async function getSettlements(driverId: string) {
  const db = getDatabase();
  const rows = await db.sql`
    SELECT * FROM settlements WHERE driver_id = ${driverId}
    ORDER BY created_at DESC LIMIT ${MAX_LIST}
  `;

  const totalRows = await db.sql`
    SELECT
      COALESCE(SUM(net_amount), 0) as total_paid,
      COUNT(*) FILTER (WHERE status = 'paid') as paid_count,
      COUNT(*) FILTER (WHERE status = 'pending') as pending_count,
      COALESCE(SUM(net_amount) FILTER (WHERE status = 'pending'), 0) as pending_amount
    FROM settlements WHERE driver_id = ${driverId}
  `;

  const stats = totalRows[0] as Record<string, unknown>;

  return json(200, {
    settlements: rows.map((r: Record<string, unknown>) => rowToSettlement(r)),
    stats: {
      totalPaid: Number(stats.total_paid || 0),
      paidCount: Number(stats.paid_count || 0),
      pendingCount: Number(stats.pending_count || 0),
      pendingAmount: Number(stats.pending_amount || 0),
    },
  });
}

async function getEarnings(driverId: string) {
  const db = getDatabase();

  const deliveredRows = await db.sql`
    SELECT COALESCE(SUM(rate), 0) as total_revenue, COUNT(*) as load_count
    FROM loads WHERE driver_id = ${driverId} AND status IN ('delivered', 'pod_uploaded', 'invoiced', 'paid')
  `;
  const delivered = deliveredRows[0] as Record<string, unknown>;

  const monthRows = await db.sql`
    SELECT COALESCE(SUM(rate), 0) as month_revenue, COUNT(*) as month_loads
    FROM loads WHERE driver_id = ${driverId} AND status IN ('delivered', 'pod_uploaded', 'invoiced', 'paid')
    AND created_at >= date_trunc('month', NOW())
  `;
  const monthly = monthRows[0] as Record<string, unknown>;

  const weekRows = await db.sql`
    SELECT COALESCE(SUM(rate), 0) as week_revenue, COUNT(*) as week_loads
    FROM loads WHERE driver_id = ${driverId} AND status IN ('delivered', 'pod_uploaded', 'invoiced', 'paid')
    AND created_at >= date_trunc('week', NOW())
  `;
  const weekly = weekRows[0] as Record<string, unknown>;

  const settlementRows = await db.sql`
    SELECT COALESCE(SUM(net_amount), 0) as total_settled
    FROM settlements WHERE driver_id = ${driverId} AND status = 'paid'
  `;
  const settled = settlementRows[0] as Record<string, unknown>;

  const totalRevenue = Number(delivered.total_revenue || 0);
  const totalLoads = Number(delivered.load_count || 0);

  return json(200, {
    earnings: {
      totalRevenue,
      totalLoads,
      monthRevenue: Number(monthly.month_revenue || 0),
      monthLoads: Number(monthly.month_loads || 0),
      weekRevenue: Number(weekly.week_revenue || 0),
      weekLoads: Number(weekly.week_loads || 0),
      averagePerLoad: totalLoads > 0 ? Math.round((totalRevenue / totalLoads) * 100) / 100 : 0,
      totalSettled: Number(settled.total_settled || 0),
    },
  });
}

async function createSettlement(req: Request, user: TokenPayload) {
  let body: {
    driverId?: unknown; loadId?: unknown; carrierId?: unknown;
    amount?: unknown; rateType?: unknown; miles?: unknown;
    deductions?: unknown; periodStart?: unknown; periodEnd?: unknown;
    notes?: unknown;
  };
  try {
    body = await parseBody<typeof body>(req);
  } catch {
    return json(400, { error: 'invalid_json' });
  }

  const driverId = text(body.driverId, 64);
  const amount = toNumber(body.amount);

  if (!driverId || amount === null) {
    return json(400, { error: 'missing_fields', fields: ['driverId', 'amount'] });
  }

  const id = genId();
  const loadId = text(body.loadId, 64) || null;
  const carrierId = text(body.carrierId, 64) || null;
  const rateType = text(body.rateType, 32) || 'per_mile';
  const miles = toInt(body.miles);
  const deductions = toNumber(body.deductions) || 0;
  const netAmount = Math.round((amount - deductions) * 100) / 100;
  const periodStart = text(body.periodStart, 32) || null;
  const periodEnd = text(body.periodEnd, 32) || null;
  const notes = text(body.notes, 1000) || null;

  const db = getDatabase();
  const [row] = await db.sql`
    INSERT INTO settlements (id, driver_id, load_id, carrier_id, amount, rate_type, miles, deductions, net_amount, period_start, period_end, notes)
    VALUES (${id}, ${driverId}, ${loadId}, ${carrierId}, ${amount}, ${rateType}, ${miles}, ${deductions}, ${netAmount}, ${periodStart}::date, ${periodEnd}::date, ${notes})
    RETURNING *
  `;

  return json(201, { settlement: rowToSettlement(row as Record<string, unknown>) });
}

async function markSettlementPaid(settlementId: string) {
  const db = getDatabase();
  const rows = await db.sql`SELECT id FROM settlements WHERE id = ${settlementId} LIMIT 1`;
  if (rows.length === 0) return json(404, { error: 'not_found' });

  await db.sql`UPDATE settlements SET status = 'paid', paid_at = NOW() WHERE id = ${settlementId}`;
  return json(200, { paid: true });
}

async function getThreads(user: TokenPayload) {
  const db = getDatabase();
  const rows = await db.sql`
    SELECT ct.*, u.name as creator_name
    FROM chat_threads ct
    JOIN chat_thread_members ctm ON ct.id = ctm.thread_id
    LEFT JOIN users u ON ct.created_by = u.id
    WHERE ctm.user_id = ${user.sub}
    ORDER BY ct.updated_at DESC LIMIT ${MAX_LIST}
  `;

  const threads = await Promise.all(rows.map(async (r: Record<string, unknown>) => {
    const lastMsg = await db.sql`
      SELECT body, sender_id, created_at FROM chat_messages
      WHERE thread_id = ${r.id as string} ORDER BY created_at DESC LIMIT 1
    `;
    const last = lastMsg[0] as Record<string, unknown> | undefined;
    return {
      id: r.id,
      subject: r.subject,
      loadId: r.load_id,
      createdBy: r.created_by,
      creatorName: r.creator_name,
      lastMessage: last ? { body: last.body, senderId: last.sender_id, createdAt: last.created_at } : null,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    };
  }));

  return json(200, { threads });
}

async function getMessages(threadId: string, user: TokenPayload) {
  const db = getDatabase();

  const memberCheck = await db.sql`
    SELECT 1 FROM chat_thread_members WHERE thread_id = ${threadId} AND user_id = ${user.sub} LIMIT 1
  `;
  if (memberCheck.length === 0) return json(403, { error: 'not_a_member' });

  const rows = await db.sql`
    SELECT cm.*, u.name as sender_name
    FROM chat_messages cm
    LEFT JOIN users u ON cm.sender_id = u.id
    WHERE cm.thread_id = ${threadId}
    ORDER BY cm.created_at ASC LIMIT 100
  `;

  const messages = rows.map((r: Record<string, unknown>) => ({
    id: r.id,
    threadId: r.thread_id,
    senderId: r.sender_id,
    senderName: r.sender_name,
    body: r.body,
    createdAt: r.created_at,
  }));

  return json(200, { messages });
}

async function sendMessage(req: Request, threadId: string, user: TokenPayload) {
  let body: { body?: unknown };
  try {
    body = await parseBody<typeof body>(req);
  } catch {
    return json(400, { error: 'invalid_json' });
  }

  const messageBody = text(body.body, 2000);
  if (!messageBody) return json(400, { error: 'missing_fields', fields: ['body'] });

  const db = getDatabase();

  const memberCheck = await db.sql`
    SELECT 1 FROM chat_thread_members WHERE thread_id = ${threadId} AND user_id = ${user.sub} LIMIT 1
  `;
  if (memberCheck.length === 0) return json(403, { error: 'not_a_member' });

  const id = genId();
  const [row] = await db.sql`
    INSERT INTO chat_messages (id, thread_id, sender_id, body)
    VALUES (${id}, ${threadId}, ${user.sub}, ${messageBody})
    RETURNING *
  `;

  await db.sql`UPDATE chat_threads SET updated_at = NOW() WHERE id = ${threadId}`;

  return json(201, {
    message: {
      id: row.id,
      threadId: row.thread_id,
      senderId: row.sender_id,
      senderName: user.name,
      body: row.body,
      createdAt: row.created_at,
    },
  });
}

async function createThread(req: Request, user: TokenPayload) {
  let body: { subject?: unknown; loadId?: unknown; memberIds?: unknown };
  try {
    body = await parseBody<typeof body>(req);
  } catch {
    return json(400, { error: 'invalid_json' });
  }

  const subject = text(body.subject, 200) || null;
  const loadId = text(body.loadId, 64) || null;
  const memberIds = Array.isArray(body.memberIds) ? body.memberIds.filter((id: unknown) => typeof id === 'string').slice(0, 20) as string[] : [];

  const id = genId();
  const db = getDatabase();

  await db.sql`
    INSERT INTO chat_threads (id, subject, load_id, created_by)
    VALUES (${id}, ${subject}, ${loadId}, ${user.sub})
  `;

  await db.sql`INSERT INTO chat_thread_members (thread_id, user_id) VALUES (${id}, ${user.sub})`;

  for (const memberId of memberIds) {
    if (memberId !== user.sub) {
      await db.sql`INSERT INTO chat_thread_members (thread_id, user_id) VALUES (${id}, ${memberId})`;
    }
  }

  return json(201, { thread: { id, subject, loadId, createdBy: user.sub } });
}

async function generateRateCon(req: Request, user: TokenPayload) {
  let body: { loadId?: unknown };
  try {
    body = await parseBody<typeof body>(req);
  } catch {
    return json(400, { error: 'invalid_json' });
  }

  const loadId = text(body.loadId, 64);
  if (!loadId) return json(400, { error: 'missing_fields', fields: ['loadId'] });

  const db = getDatabase();
  const rows = await db.sql`SELECT * FROM loads WHERE id = ${loadId} LIMIT 1`;
  if (rows.length === 0) return json(404, { error: 'load_not_found' });

  const load = rows[0] as Record<string, unknown>;
  let carrierName = '';
  if (load.carrier_id) {
    const cRows = await db.sql`SELECT name FROM carriers WHERE id = ${load.carrier_id as string} LIMIT 1`;
    carrierName = (cRows[0] as Record<string, unknown>)?.name as string || '';
  }

  return json(200, {
    rateConfirmation: {
      loadId,
      trackingNumber: load.tracking_number,
      origin: load.origin,
      destination: load.destination,
      pickupAt: load.pickup_at,
      deliveryAt: load.delivery_at,
      rate: load.rate ? Number(load.rate) : null,
      equipment: load.equipment,
      carrierName,
      shipperName: load.shipper_name,
      specialInstructions: load.special_instructions,
      generatedAt: new Date().toISOString(),
    },
  });
}

export default async (req: Request) => {
  if (req.method === 'OPTIONS') return options();

  const auth = await requireAuth(req);
  if (auth instanceof Response) return auth;

  const url = parseUrl(req);
  const path = url.pathname;

  // Settlements / Payroll
  const settlementsDriver = extractParam(path, /^\/api\/payroll\/settlements\/([^/]+)$/);
  if (settlementsDriver && req.method === 'GET') return getSettlements(settlementsDriver);

  const earningsDriver = extractParam(path, /^\/api\/payroll\/earnings\/([^/]+)$/);
  if (earningsDriver && req.method === 'GET') return getEarnings(earningsDriver);

  if (req.method === 'POST' && path === '/api/payroll/settlements') return createSettlement(req, auth);

  const paidId = extractParam(path, /^\/api\/payroll\/settlements\/([^/]+)\/pay$/);
  if (paidId && req.method === 'POST') return markSettlementPaid(paidId);

  // Chat
  if (req.method === 'GET' && path === '/api/chat/threads') return getThreads(auth);
  if (req.method === 'POST' && path === '/api/chat/threads') return createThread(req, auth);

  const msgThread = extractParam(path, /^\/api\/chat\/threads\/([^/]+)\/messages$/);
  if (msgThread && req.method === 'GET') return getMessages(msgThread, auth);
  if (msgThread && req.method === 'POST') return sendMessage(req, msgThread, auth);

  // Rate Confirmations
  if (req.method === 'POST' && path === '/api/ratecons/generate') return generateRateCon(req, auth);

  return json(405, { error: 'method_not_allowed' });
};

export const config: Config = {
  path: [
    '/api/payroll/settlements',
    '/api/payroll/settlements/:driverId',
    '/api/payroll/settlements/:id/pay',
    '/api/payroll/earnings/:driverId',
    '/api/chat/threads',
    '/api/chat/threads/:threadId/messages',
    '/api/ratecons/generate',
  ],
};
