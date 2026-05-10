import { getDatabase } from '@netlify/database';
import type { Config } from '@netlify/functions';
import { requireAuth, type TokenPayload } from './lib/auth.ts';
import { json, options } from './lib/http.ts';
import { text, toNumber, parseBody, parseUrl, extractParam } from './lib/validate.ts';

async function getRateTrend(req: Request) {
  const url = parseUrl(req);
  const origin = url.searchParams.get('origin');
  const destination = url.searchParams.get('destination');
  const equipment = url.searchParams.get('equipment') || 'Dry van';

  if (!origin || !destination) {
    return json(400, { error: 'missing_fields', fields: ['origin', 'destination'] });
  }

  const db = getDatabase();
  const rows = await db.sql`
    SELECT period_start, period_end, avg_rate_per_mile, min_rate, max_rate, sample_count
    FROM rate_analytics
    WHERE origin_state ILIKE ${origin} AND dest_state ILIKE ${destination} AND equipment ILIKE ${equipment}
    ORDER BY period_end DESC
    LIMIT 12
  `;

  if (rows.length === 0) {
    const loadRows = await db.sql`
      SELECT rate, miles FROM loads
      WHERE origin ILIKE ${'%' + origin + '%'} AND destination ILIKE ${'%' + destination + '%'}
      AND equipment ILIKE ${'%' + equipment + '%'} AND rate IS NOT NULL AND miles IS NOT NULL AND miles > 0
      ORDER BY created_at DESC LIMIT 50
    `;

    if (loadRows.length === 0) {
      return json(200, { trend: [], source: 'no_data', message: 'No rate data for this lane.' });
    }

    const rates = loadRows.map((r: Record<string, unknown>) => Number(r.rate) / Math.max(Number(r.miles), 1));
    const avg = rates.reduce((a, b) => a + b, 0) / rates.length;

    return json(200, {
      trend: [{
        avgRatePerMile: Math.round(avg * 100) / 100,
        minRate: Math.round(Math.min(...rates.map((_, i) => Number((loadRows[i] as Record<string, unknown>).rate))) * 100) / 100,
        maxRate: Math.round(Math.max(...rates.map((_, i) => Number((loadRows[i] as Record<string, unknown>).rate))) * 100) / 100,
        sampleCount: loadRows.length,
        period: 'all_time',
      }],
      source: 'computed_from_loads',
    });
  }

  const trend = rows.map((r: Record<string, unknown>) => ({
    periodStart: r.period_start,
    periodEnd: r.period_end,
    avgRatePerMile: Number(r.avg_rate_per_mile),
    minRate: r.min_rate ? Number(r.min_rate) : null,
    maxRate: r.max_rate ? Number(r.max_rate) : null,
    sampleCount: r.sample_count,
  }));

  return json(200, { trend, source: 'rate_analytics' });
}

async function compareRate(req: Request) {
  let body: { originState?: unknown; destState?: unknown; equipmentType?: unknown; brokerOffer?: unknown };
  try {
    body = await parseBody<typeof body>(req);
  } catch {
    return json(400, { error: 'invalid_json' });
  }

  const originState = text(body.originState, 32);
  const destState = text(body.destState, 32);
  const equipmentType = text(body.equipmentType, 64) || 'Dry van';
  const brokerOffer = toNumber(body.brokerOffer);

  if (!originState || !destState || brokerOffer === null) {
    return json(400, { error: 'missing_fields', fields: ['originState', 'destState', 'brokerOffer'] });
  }

  const db = getDatabase();

  const analyticsRows = await db.sql`
    SELECT avg_rate_per_mile, min_rate, max_rate, sample_count
    FROM rate_analytics
    WHERE origin_state ILIKE ${originState} AND dest_state ILIKE ${destState} AND equipment ILIKE ${equipmentType}
    ORDER BY period_end DESC LIMIT 1
  `;

  let marketAvg: number;
  let sampleCount: number;

  if (analyticsRows.length > 0) {
    const row = analyticsRows[0] as Record<string, unknown>;
    marketAvg = Number(row.avg_rate_per_mile);
    sampleCount = Number(row.sample_count);
  } else {
    const loadRows = await db.sql`
      SELECT AVG(rate / NULLIF(miles, 0)) as avg_rpm, COUNT(*) as cnt
      FROM loads
      WHERE origin ILIKE ${'%' + originState + '%'} AND destination ILIKE ${'%' + destState + '%'}
      AND rate IS NOT NULL AND miles > 0
    `;
    const row = loadRows[0] as Record<string, unknown>;
    marketAvg = Number(row.avg_rpm || 0);
    sampleCount = Number(row.cnt || 0);
  }

  if (marketAvg === 0) {
    return json(200, {
      verdict: 'insufficient_data',
      brokerOffer,
      message: 'Not enough lane data to compare.',
    });
  }

  const diff = brokerOffer - marketAvg;
  const pctDiff = Math.round((diff / marketAvg) * 10000) / 100;
  const verdict = pctDiff >= 5 ? 'above_market' : pctDiff <= -5 ? 'below_market' : 'at_market';

  return json(200, {
    verdict,
    brokerOffer,
    marketAvgRatePerMile: Math.round(marketAvg * 100) / 100,
    differencePercent: pctDiff,
    sampleCount,
    recommendation: verdict === 'below_market'
      ? `Offer is ${Math.abs(pctDiff)}% below market. Consider negotiating.`
      : verdict === 'above_market'
        ? `Offer is ${pctDiff}% above market average.`
        : 'Offer is within market range.',
  });
}

async function getBrokerCredit(mcNumber: string) {
  const db = getDatabase();
  const rows = await db.sql`
    SELECT id, name, mc_number, rating, total_loads, on_time_rate, status
    FROM carriers WHERE mc_number = ${mcNumber} LIMIT 1
  `;

  if (rows.length === 0) {
    return json(200, {
      mcNumber,
      found: false,
      message: 'No carrier found with this MC number.',
    });
  }

  const carrier = rows[0] as Record<string, unknown>;
  const totalLoads = Number(carrier.total_loads || 0);
  const onTimeRate = Number(carrier.on_time_rate || 0);
  const rating = Number(carrier.rating || 0);
  const creditScore = Math.min(Math.round((rating * 30 + onTimeRate * 0.4 + Math.min(totalLoads, 100) * 0.3) * 10) / 10, 100);

  return json(200, {
    mcNumber,
    found: true,
    carrierName: carrier.name,
    creditScore,
    rating,
    totalLoads,
    onTimeRate,
    status: carrier.status,
    source: 'internal',
    message: 'Credit score based on internal performance data. Connect to external credit APIs for comprehensive scoring.',
  });
}

async function getFactoringComparison(req: Request) {
  let body: { amount?: unknown };
  try {
    body = await parseBody<typeof body>(req);
  } catch {
    return json(400, { error: 'invalid_json' });
  }

  const amount = toNumber(body.amount);
  if (amount === null || amount <= 0) {
    return json(400, { error: 'invalid_amount' });
  }

  const options = [
    { provider: 'Standard Factoring', ratePercent: 3.0, fee: Math.round(amount * 0.03 * 100) / 100, net: Math.round(amount * 0.97 * 100) / 100, terms: 'Same day funding, 90-day recourse' },
    { provider: 'Premium Factoring', ratePercent: 2.5, fee: Math.round(amount * 0.025 * 100) / 100, net: Math.round(amount * 0.975 * 100) / 100, terms: '24-hour funding, non-recourse' },
    { provider: 'Quick Pay', ratePercent: 1.5, fee: Math.round(amount * 0.015 * 100) / 100, net: Math.round(amount * 0.985 * 100) / 100, terms: '3-5 day funding, direct from broker' },
  ];

  return json(200, {
    invoiceAmount: amount,
    options,
    recommendation: 'Quick Pay offers the lowest rate if the broker supports it. Use Standard Factoring for immediate cash flow needs.',
  });
}

export default async (req: Request) => {
  if (req.method === 'OPTIONS') return options();

  const auth = await requireAuth(req);
  if (auth instanceof Response) return auth;

  const url = parseUrl(req);
  const path = url.pathname;

  if (req.method === 'GET' && path === '/api/rate-analytics/trend') return getRateTrend(req);
  if (req.method === 'POST' && path === '/api/rate-analytics/compare') return compareRate(req);

  const brokerMc = extractParam(path, /^\/api\/broker-credit\/([^/]+)$/);
  if (brokerMc && req.method === 'GET') return getBrokerCredit(brokerMc);

  if (req.method === 'POST' && path === '/api/factoring/compare') return getFactoringComparison(req);

  return json(405, { error: 'method_not_allowed' });
};

export const config: Config = {
  path: [
    '/api/rate-analytics/trend',
    '/api/rate-analytics/compare',
    '/api/broker-credit/:mcNumber',
    '/api/factoring/compare',
  ],
};
