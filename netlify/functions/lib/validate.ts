export const isString = (v: unknown): v is string => typeof v === 'string';

export function text(v: unknown, max = 240): string {
  return isString(v) ? v.trim().slice(0, max) : '';
}

export function toNumber(v: unknown): number | null {
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (isString(v) && v.trim() !== '') {
    const parsed = Number(v);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

export function toInt(v: unknown): number | null {
  const n = toNumber(v);
  return n !== null ? Math.round(n) : null;
}

export function toDate(v: unknown): string | null {
  const raw = text(v, 32);
  if (!raw) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) return null;
  return Number.isNaN(Date.parse(`${raw}T00:00:00Z`)) ? null : raw;
}

export function toTimestamp(v: unknown): string | null {
  const raw = text(v, 64);
  if (!raw) return null;
  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

export function isEmail(v: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

export function requireFields(obj: Record<string, string>, fields: string[]): string[] {
  return fields.filter((f) => !obj[f]);
}

export function parseBody<T>(req: Request): Promise<T> {
  return req.json() as Promise<T>;
}

export function parseUrl(req: Request) {
  return new URL(req.url);
}

export function extractParam(pathname: string, pattern: RegExp): string | null {
  const match = pathname.match(pattern);
  return match?.[1] ? decodeURIComponent(match[1]) : null;
}
