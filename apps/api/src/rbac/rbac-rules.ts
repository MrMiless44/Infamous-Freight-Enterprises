/**
 * Pure RBAC business logic – no framework dependencies.
 * Import from this file in API route code and plain Jest tests.
 */

export type UserRole =
  | 'admin'
  | 'owner'
  | 'dispatcher'
  | 'sales'
  | 'carrier_manager'
  | 'accounting'
  | 'safety_manager'
  | 'accountant'
  | 'shipper'
  | 'carrier'
  | 'driver';

export interface TeamMember {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  carrierId: string;
  invitedBy: string;
  status: 'active' | 'pending' | 'inactive';
  permissions: Permission[];
  /** For external roles (shipper/carrier/driver): the entity id they own */
  ownerId?: string;
  createdAt: Date;
  lastActiveAt?: Date;
}

export type Permission =
  // Loads
  | 'loads:view' | 'loads:create' | 'loads:assign' | 'loads:delete'
  // Drivers
  | 'drivers:view' | 'drivers:create' | 'drivers:edit' | 'drivers:delete'
  // Invoices
  | 'invoices:view' | 'invoices:create' | 'invoices:send' | 'invoices:delete'
  // Analytics
  | 'analytics:view' | 'analytics:export'
  // Settings
  | 'settings:view' | 'settings:edit'
  // Team
  | 'team:view' | 'team:invite' | 'team:edit' | 'team:remove'
  // Safety
  | 'safety:view' | 'safety:hos' | 'safety:violations'
  // Documents
  | 'documents:view' | 'documents:upload' | 'documents:delete'
  // ELD
  | 'eld:view' | 'eld:connect' | 'eld:disconnect'
  // Carriers
  | 'carriers:view' | 'carriers:create' | 'carriers:edit' | 'carriers:approve'
  // Shippers
  | 'shippers:view' | 'shippers:create' | 'shippers:edit'
  // Quotes
  | 'quotes:view' | 'quotes:create' | 'quotes:edit' | 'quotes:approve'
  // Tracking
  | 'tracking:view' | 'tracking:submit'
  // PODs
  | 'pods:view' | 'pods:upload';

/** Fields that must never be exposed to external users (shipper/carrier/driver). */
export const SENSITIVE_FINANCIAL_FIELDS: ReadonlyArray<string> = [
  'shipperRate',
  'carrierRate',
  'grossMargin',
  'grossMarginPercentage',
  'targetMargin',
  'estimatedCarrierCost',
  'carrierCost',
  'profitMargin',
  'notes',
  'internalNotes',
];

/** Roles that belong to external (non-internal-staff) users. */
export const EXTERNAL_ROLES: ReadonlyArray<UserRole> = ['shipper', 'carrier', 'driver'];

const ALL_PERMISSIONS: Permission[] = [
  'loads:view', 'loads:create', 'loads:assign', 'loads:delete',
  'drivers:view', 'drivers:create', 'drivers:edit', 'drivers:delete',
  'invoices:view', 'invoices:create', 'invoices:send', 'invoices:delete',
  'analytics:view', 'analytics:export',
  'settings:view', 'settings:edit',
  'team:view', 'team:invite', 'team:edit', 'team:remove',
  'safety:view', 'safety:hos', 'safety:violations',
  'documents:view', 'documents:upload', 'documents:delete',
  'eld:view', 'eld:connect', 'eld:disconnect',
  'carriers:view', 'carriers:create', 'carriers:edit', 'carriers:approve',
  'shippers:view', 'shippers:create', 'shippers:edit',
  'quotes:view', 'quotes:create', 'quotes:edit', 'quotes:approve',
  'tracking:view', 'tracking:submit',
  'pods:view', 'pods:upload',
];

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  // Admin and owner have full access to everything
  admin: ALL_PERMISSIONS,
  owner: ALL_PERMISSIONS,

  // Dispatcher: loads, tracking, carriers, documents
  dispatcher: [
    'loads:view', 'loads:create', 'loads:assign',
    'carriers:view',
    'tracking:view', 'tracking:submit',
    'drivers:view', 'drivers:edit',
    'documents:view', 'documents:upload',
    'pods:view',
    'invoices:view', 'invoices:create',
    'analytics:view',
    'eld:view',
  ],

  // Sales: shippers and quote requests
  sales: [
    'shippers:view', 'shippers:create', 'shippers:edit',
    'quotes:view', 'quotes:create', 'quotes:edit', 'quotes:approve',
    'loads:view',
  ],

  // Carrier Manager: carriers and carrier documents
  carrier_manager: [
    'carriers:view', 'carriers:create', 'carriers:edit', 'carriers:approve',
    'documents:view', 'documents:upload',
    'pods:view',
  ],

  // Accounting: invoices and PODs
  accounting: [
    'invoices:view', 'invoices:create', 'invoices:send', 'invoices:delete',
    'pods:view', 'pods:upload',
    'documents:view', 'documents:upload',
    'analytics:view', 'analytics:export',
  ],

  // Safety manager: safety records, driver compliance
  safety_manager: [
    'drivers:view', 'drivers:edit',
    'safety:view', 'safety:hos', 'safety:violations',
    'documents:view', 'documents:upload',
    'eld:view',
    'analytics:view',
  ],

  // Accountant (legacy alias for accounting role)
  accountant: [
    'invoices:view', 'invoices:create', 'invoices:send',
    'pods:view',
    'analytics:view', 'analytics:export',
    'documents:view', 'documents:upload',
  ],

  // Shipper (external): own quotes, own loads, customer-visible tracking only
  shipper: [
    'quotes:view',
    'loads:view',
    'tracking:view',
    'documents:view',
    'pods:view',
  ],

  // Carrier (external): own profile and assigned loads only
  carrier: [
    'loads:view',
    'tracking:view',
    'documents:view', 'documents:upload',
    'pods:upload',
    'eld:view',
  ],

  // Driver (external): submit assigned tracking updates only
  driver: [
    'loads:view',
    'tracking:submit',
    'documents:view', 'documents:upload',
    'eld:view',
  ],
};

/** Returns true for external user roles (shipper, carrier, driver). */
export function isExternalRole(role: UserRole): boolean {
  return (EXTERNAL_ROLES as ReadonlyArray<string>).includes(role);
}

/** Returns true if the member holds the given permission. */
export function hasPermission(member: TeamMember, permission: Permission): boolean {
  return member.permissions.includes(permission);
}

/** Returns true if the member holds any of the given permissions. */
export function hasAnyPermission(member: TeamMember, permissions: Permission[]): boolean {
  return permissions.some(p => member.permissions.includes(p));
}

/** Type alias for data with all sensitive financial / internal fields removed. */
export type SanitizedData<T> = Omit<T, typeof SENSITIVE_FINANCIAL_FIELDS[number]>;

/**
 * Strip sensitive financial and internal fields from a data object before
 * returning it to an external user (shipper / carrier / driver).
 * Operates shallowly – nested objects are left unchanged.
 */
export function filterSensitiveFields<T extends Record<string, unknown>>(
  data: T,
): SanitizedData<T> {
  const result = { ...data };
  for (const field of SENSITIVE_FINANCIAL_FIELDS) {
    delete (result as Record<string, unknown>)[field];
  }
  return result as SanitizedData<T>;
}

/**
 * Returns true when an external member is allowed to access a specific load.
 *   - shipper: only loads where shipperId matches member.ownerId
 *   - carrier: only loads where carrierId matches member.ownerId
 *   - driver:  only loads where driverName matches member.ownerId
 *
 * Note: `driverName` is used as the driver identifier in the current data model.
 * Set `member.ownerId` to the driver's name as it appears on assigned loads.
 * Internal roles always return true.
 */
export function canAccessLoad(
  member: TeamMember,
  load: { shipperId?: string | null; carrierId?: string | null; driverName?: string | null },
): boolean {
  if (!isExternalRole(member.role)) return true;

  switch (member.role) {
    case 'shipper':
      return !!member.ownerId && member.ownerId === load.shipperId;
    case 'carrier':
      return !!member.ownerId && member.ownerId === load.carrierId;
    case 'driver':
      return !!member.ownerId && member.ownerId === load.driverName;
    default:
      return false;
  }
}

/**
 * Returns true when a member is allowed to submit a tracking update for the given load.
 * Internal roles with tracking:submit permission always return true.
 */
export function canSubmitTrackingUpdate(
  member: TeamMember,
  load: { carrierId?: string | null; driverName?: string | null },
): boolean {
  if (!hasPermission(member, 'tracking:submit')) return false;
  if (!isExternalRole(member.role)) return true;

  if (member.role === 'driver') {
    return !!member.ownerId && member.ownerId === load.driverName;
  }
  if (member.role === 'carrier') {
    return !!member.ownerId && member.ownerId === load.carrierId;
  }
  return false;
}

/** Returns a map of UI menu items to visibility flags for the given role. */
export function getMenuVisibility(role: UserRole): Record<string, boolean> {
  const perms = ROLE_PERMISSIONS[role];
  return {
    dashboard: true,
    loads: perms.includes('loads:view'),
    dispatch: perms.includes('loads:assign'),
    drivers: perms.includes('drivers:view'),
    invoices: perms.includes('invoices:view'),
    analytics: perms.includes('analytics:view'),
    safety: perms.includes('safety:view'),
    documents: perms.includes('documents:view'),
    eld: perms.includes('eld:view'),
    team: perms.includes('team:view'),
    settings: perms.includes('settings:view'),
    carriers: perms.includes('carriers:view'),
    shippers: perms.includes('shippers:view'),
    quotes: perms.includes('quotes:view'),
    tracking: perms.includes('tracking:view') || perms.includes('tracking:submit'),
    pods: perms.includes('pods:view') || perms.includes('pods:upload'),
  };
}
