export type RouteReadinessState = 'live' | 'demo' | 'not_ready';

export type RouteReadiness = {
  state: RouteReadinessState;
  message: string;
};

export const AUTHENTICATED_ROUTE_READINESS: Record<string, RouteReadiness> = {
  '/ops': {
    state: 'demo',
    message: 'Operations dashboard currently uses sample operational data while live integrations are being wired in.',
  },
  '/loads': {
    state: 'demo',
    message: 'Load board currently uses demo-backed records and does not reflect live broker feed activity.',
  },
  '/dispatch': {
    state: 'demo',
    message: 'Dispatch board workflows are demo-backed and should not be treated as production dispatch execution.',
  },
  '/drivers': {
    state: 'demo',
    message: 'Driver roster and performance widgets are demo-backed while live driver services are being integrated.',
  },
  '/invoices': {
    state: 'demo',
    message: 'Invoice management currently contains demo-backed records and requires live billing integration completion.',
  },
  '/analytics': {
    state: 'demo',
    message: 'Analytics metrics are demo-backed and should be treated as non-final until production data verification is complete.',
  },
  '/compliance': {
    state: 'demo',
    message: 'Compliance views currently use sample records and must be cross-checked with source systems for live operations.',
  },
  '/settings': {
    state: 'demo',
    message: 'Settings contains mixed readiness surfaces; treat profile, security, and integrations controls as demo-backed unless documented otherwise.',
  },
  '/billing': {
    state: 'live',
    message: 'Billing activation and paywall access controls are production-enabled.',
  },
  '/carriers': {
    state: 'demo',
    message: 'Carrier onboarding and approval views are demo-backed and are not yet the source of truth for production onboarding.',
  },
  '/accounting': {
    state: 'demo',
    message: 'Accounting workflows currently use demo-backed finance records while production systems are hardened.',
  },
  '/quotes': {
    state: 'demo',
    message: 'Internal quote workflow is demo-backed; use public intake and verified dispatch processes for live commitments.',
  },
  '/messages': {
    state: 'not_ready',
    message: 'Messaging is not production-ready yet and remains unavailable for live operational communication.',
  },
  '/driver-app': {
    state: 'not_ready',
    message: 'Driver app is not production-ready yet and remains unavailable for live dispatch execution.',
  },
};

export function resolveRouteReadiness(pathname: string): RouteReadiness | null {
  const matchedPath = Object.keys(AUTHENTICATED_ROUTE_READINESS).find(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );
  return matchedPath ? AUTHENTICATED_ROUTE_READINESS[matchedPath] : null;
}
