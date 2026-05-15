export type RouteReadinessStatus = 'live' | 'demo-backed' | 'not-ready';

export interface RouteReadiness {
  path: string;
  label: string;
  status: RouteReadinessStatus;
  summary: string;
  operatorGuidance: string;
}

export const routeReadinessByPath = {
  '/ops': { path: '/ops', label: 'Operations dashboard', status: 'demo-backed', summary: 'Command-center metrics exist, but some dashboard data is sample-backed.', operatorGuidance: 'Verify live operational data before using this as production truth.' },
  '/loads': { path: '/loads', label: 'Loads', status: 'live', summary: 'Load workflows are supported by backend services.', operatorGuidance: 'Confirm current tenant and assignment records before operational use.' },
  '/dispatch': { path: '/dispatch', label: 'Dispatch board', status: 'demo-backed', summary: 'Board UI exists, but live feeds need end-to-end verification.', operatorGuidance: 'Do not treat this as final dispatcher truth until live feeds are verified.' },
  '/drivers': { path: '/drivers', label: 'Drivers', status: 'live', summary: 'Driver management is available.', operatorGuidance: 'Use with verified carrier-scoped driver records.' },
  '/invoices': { path: '/invoices', label: 'Invoices', status: 'demo-backed', summary: 'Invoice surfaces exist, but reconciliation needs manual verification.', operatorGuidance: 'Do not use as the final accounting ledger yet.' },
  '/analytics': { path: '/analytics', label: 'Analytics', status: 'demo-backed', summary: 'Analytics exist, but some KPI sources need verification.', operatorGuidance: 'Use for trend demos until production metrics are verified.' },
  '/compliance': { path: '/compliance', label: 'Compliance', status: 'not-ready', summary: 'Compliance workflows are still being hardened.', operatorGuidance: 'Use manual compliance checks until promoted.' },
  '/settings': { path: '/settings', label: 'Settings', status: 'live', summary: 'Admin settings are available.', operatorGuidance: 'Verify integrations before production configuration changes.' },
  '/billing': { path: '/billing', label: 'Billing', status: 'live', summary: 'Stripe billing surfaces are implemented.', operatorGuidance: 'Confirm live account, plans, and webhook health before real collection.' },
  '/carriers': { path: '/carriers', label: 'Carriers', status: 'live', summary: 'Carrier surfaces are available.', operatorGuidance: 'Use with verified onboarding and payment records.' },
  '/accounting': { path: '/accounting', label: 'Accounting', status: 'not-ready', summary: 'Accounting integrations are not fully connected.', operatorGuidance: 'Keep reconciliation outside the app until sync is verified.' },
  '/quotes': { path: '/quotes', label: 'Quote requests', status: 'live', summary: 'Quote intake workflows are available.', operatorGuidance: 'Use with manual rate confirmation before commitments.' },
  '/messages': { path: '/messages', label: 'Messages', status: 'demo-backed', summary: 'Messaging UI exists, but production behavior needs verification.', operatorGuidance: 'Confirm participants, permissions, and notifications before use.' },
  '/driver-app': { path: '/driver-app', label: 'Driver app', status: 'not-ready', summary: 'Driver app experience is reserved for hardening.', operatorGuidance: 'Use existing driver communication procedures until promoted.' },
} as const satisfies Record<string, RouteReadiness>;

export type RouteReadinessPath = keyof typeof routeReadinessByPath;
