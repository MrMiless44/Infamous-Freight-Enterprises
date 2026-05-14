export type RouteReadinessStatus = 'live' | 'demo-backed' | 'not-ready';

export interface RouteReadiness {
  path: string;
  label: string;
  status: RouteReadinessStatus;
  summary: string;
  operatorGuidance: string;
}

export const routeReadinessByPath = {
  '/ops': {
    path: '/ops',
    label: 'Operations dashboard',
    status: 'demo-backed',
    summary: 'Shows command-center metrics and operational cards, but some dashboard data is still sample-backed.',
    operatorGuidance: 'Use for demos and operator orientation. Verify live load, driver, and invoice data before using it as the production source of truth.',
  },
  '/loads': {
    path: '/loads',
    label: 'Loads',
    status: 'live',
    summary: 'Load workflows are supported by tenant-aware backend services.',
    operatorGuidance: 'Use after confirming the current tenant, carrier, and assignment records are present in production.',
  },
  '/dispatch': {
    path: '/dispatch',
    label: 'Dispatch board',
    status: 'demo-backed',
    summary: 'Dispatch board UI is available, but board data may still include sample/demo-backed records.',
    operatorGuidance: 'Do not treat this as the final dispatcher board until live assignment and status feeds are verified end-to-end.',
  },
  '/drivers': {
    path: '/drivers',
    label: 'Drivers',
    status: 'live',
    summary: 'Driver management is available for authenticated operators.',
    operatorGuidance: 'Use for verified carrier-scoped driver records only.',
  },
  '/invoices': {
    path: '/invoices',
    label: 'Invoices',
    status: 'demo-backed',
    summary: 'Invoice and payment surfaces exist, but accounting reconciliation should still be verified manually.',
    operatorGuidance: 'Do not rely on this page as the final accounting ledger until Stripe, invoice, and accounting exports are reconciled.',
  },
  '/analytics': {
    path: '/analytics',
    label: 'Analytics',
    status: 'demo-backed',
    summary: 'Analytics dashboards are available, but some KPI cards may still be sample-backed.',
    operatorGuidance: 'Use for trend demos only until production metric sources are verified.',
  },
  '/compliance': {
    path: '/compliance',
    label: 'Compliance',
    status: 'not-ready',
    summary: 'Compliance workflows are still being hardened and should not be presented as production-ready.',
    operatorGuidance: 'Use manual compliance checks and verified document workflows until this route is promoted.',
  },
  '/settings': {
    path: '/settings',
    label: 'Settings',
    status: 'live',
    summary: 'Administrative settings are available for authorized operators.',
    operatorGuidance: 'Use carefully; verify environment-backed integrations before changing production configuration.',
  },
  '/billing': {
    path: '/billing',
    label: 'Billing',
    status: 'live',
    summary: 'Stripe billing surfaces and paywall enforcement are implemented.',
    operatorGuidance: 'Confirm the active Stripe account, mode, plans, and webhook health before collecting real customer payments.',
  },
  '/carriers': {
    path: '/carriers',
    label: 'Carriers',
    status: 'live',
    summary: 'Carrier records and operational carrier surfaces are available.',
    operatorGuidance: 'Use only with verified carrier onboarding and payment status records.',
  },
  '/accounting': {
    path: '/accounting',
    label: 'Accounting',
    status: 'not-ready',
    summary: 'Accounting integrations such as QuickBooks and Xero are planned but not fully integrated.',
    operatorGuidance: 'Keep accounting reconciliation outside the app until exports and third-party accounting sync are verified.',
  },
  '/quotes': {
    path: '/quotes',
    label: 'Quote requests',
    status: 'live',
    summary: 'Quote intake and approval workflows are available.',
    operatorGuidance: 'Use with manual rate confirmation before committing freight pricing.',
  },
  '/messages': {
    path: '/messages',
    label: 'Messages',
    status: 'demo-backed',
    summary: 'Messaging UI is available, but production communication flows still need operator verification.',
    operatorGuidance: 'Use only after confirming participants, permissions, and notification behavior in the current environment.',
  },
  '/driver-app': {
    path: '/driver-app',
    label: 'Driver app',
    status: 'not-ready',
    summary: 'Driver app experience is reserved for hardening and should not be exposed as production-ready.',
    operatorGuidance: 'Use existing driver communication and tracking procedures until this route is promoted.',
  },
} as const satisfies Record<string, RouteReadiness>;

export type RouteReadinessPath = keyof typeof routeReadinessByPath;
