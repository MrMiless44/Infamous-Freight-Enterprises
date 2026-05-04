export type SubscriptionStatus =
  | 'active'
  | 'trialing'
  | 'trial'
  | 'past_due'
  | 'unpaid'
  | 'canceled'
  | 'incomplete'
  | 'none'
  | 'unknown';

export const PAID_SUBSCRIPTION_STATUSES: ReadonlySet<SubscriptionStatus> = new Set([
  'active',
  'trialing',
  'trial',
]);

export const BILLING_ALLOWED_PATH_PREFIXES = [
  '/billing',
  '/pay-per-load',
  '/settings',
] as const;

export function normalizeSubscriptionStatus(value: unknown): SubscriptionStatus {
  if (typeof value !== 'string') {
    return 'unknown';
  }

  const normalized = value.trim().toLowerCase();

  switch (normalized) {
    case 'active':
    case 'trialing':
    case 'trial':
    case 'past_due':
    case 'unpaid':
    case 'canceled':
    case 'incomplete':
    case 'none':
      return normalized;
    default:
      return 'unknown';
  }
}

export function isPaidSubscription(status: unknown): boolean {
  return PAID_SUBSCRIPTION_STATUSES.has(normalizeSubscriptionStatus(status));
}

export function isBillingAllowedPath(pathname: string): boolean {
  return BILLING_ALLOWED_PATH_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}
