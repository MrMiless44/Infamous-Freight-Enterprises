// Shared domain types for the carrier-facing app. Server responses, Zustand
// store slices, and component props should all import from here so the shapes
// stay aligned without ad-hoc duplication.

export type UserRole = 'driver' | 'dispatcher' | 'admin' | 'owner' | 'viewer' | 'customer' | 'carrier';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole | string;
  carrierId: string;
  companyId?: string;
  avatar?: string;
  phone?: string;
  subscriptionStatus?: string;
}

export type LoadStatus =
  | 'quote_pending'
  | 'available'
  | 'booked'
  | 'carrier_assigned'
  | 'pickup_scheduled'
  | 'picked_up'
  | 'in_transit'
  | 'delayed'
  | 'out_for_delivery'
  | 'delivered'
  | 'pod_uploaded'
  | 'invoiced'
  | 'paid'
  | 'cancelled'
  | 'exception';

export interface Load {
  id: string;
  trackingNumber: string;
  origin: string;
  destination: string;
  pickupAt: string;
  deliveryAt: string;
  rate: number;
  miles: number;
  equipment: string;
  weightLbs?: number;
  commodity?: string;
  status: LoadStatus | string;
  driverId?: string;
  carrierId?: string;
  shipperName?: string;
  shipperEmail?: string;
  shipperCompanyId?: string;
  specialInstructions?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface StatusEvent {
  id: string;
  loadId: string;
  status: string;
  changedBy?: string;
  notes?: string;
  lat?: number;
  lng?: number;
  address?: string;
  createdAt: string;
}

export type DriverStatus = 'on_duty' | 'off_duty' | 'sleeper' | 'driving';

export interface Driver {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  carrierId: string;
  userId?: string;
  licenseNumber?: string;
  licenseState?: string;
  licenseExpiry?: string;
  status: DriverStatus | string;
  hosRemainingHours?: number;
  currentLocation?: string;
  currentLat?: number;
  currentLng?: number;
}

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'void';

export interface Invoice {
  id: string;
  invoiceNumber: string;
  loadId?: string;
  customerName: string;
  customerEmail?: string;
  amount: number;
  currency: string;
  issuedAt: string;
  dueAt?: string;
  paidAt?: string;
  status: InvoiceStatus | string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface InvoiceLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  sortOrder: number;
}

export interface Company {
  id: string;
  name: string;
  type: 'shipper' | 'carrier' | 'broker' | string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  status: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Carrier {
  id: string;
  name: string;
  mcNumber?: string;
  dotNumber?: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  insuranceExpiry?: string;
  authorityStatus: string;
  rating?: number;
  totalLoads: number;
  onTimeRate?: number;
  status: string;
}

export interface Quote {
  id: string;
  quoteNumber: string;
  shipper: string;
  origin: string;
  destination: string;
  commodity?: string;
  freightType: string;
  weightLbs?: number;
  equipment: string;
  pickupDate?: string;
  deliveryDeadline?: string;
  laneMiles?: number;
  quotedAmount?: number;
  estimatedCarrierCost?: number;
  targetMargin?: number;
  ratePerMile?: number;
  status: string;
  convertedLoadId?: string;
  notes?: string;
  createdAt?: string;
}

export interface FreightEstimate {
  low: number;
  mid: number;
  high: number;
  ratePerMile: number;
  carrierCost: number;
  margin: number;
  equipment: string;
  miles: number;
  weight?: number;
  breakdown: {
    baseCost: number;
    fuelSurcharge: number;
    fuelSurchargePercent: number;
    weightSurcharge: number;
    marginAmount: number;
    marginPercent: number;
  };
  confidence: number;
}

export interface FreightDocument {
  id: string;
  loadId?: string;
  type: 'BOL' | 'POD' | 'RATE_CONFIRMATION' | 'INSURANCE' | 'LICENSE' | 'INVOICE' | 'OTHER' | string;
  fileName: string;
  fileSize?: number;
  mimeType?: string;
  uploadedBy?: string;
  createdAt: string;
}

export interface GpsPosition {
  id: string;
  loadId?: string;
  driverId?: string;
  lat: number;
  lng: number;
  speedMph?: number;
  heading?: number;
  address?: string;
  recordedAt: string;
}

export interface Payment {
  id: string;
  invoiceId: string;
  stripeSessionId?: string;
  stripePaymentIntent?: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | string;
  createdAt?: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  read: boolean;
  createdAt: string;
}

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
}

export interface DispatchAssignment {
  id: string;
  loadId: string;
  carrierId?: string;
  driverId?: string;
  score?: number;
  method: 'manual' | 'auto' | string;
  status: 'pending' | 'accepted' | 'rejected' | string;
  assignedBy?: string;
  notes?: string;
  createdAt?: string;
}

export interface DispatchBoardColumn {
  available: DispatchBoardLoad[];
  booked: DispatchBoardLoad[];
  carrier_assigned: DispatchBoardLoad[];
  in_transit: DispatchBoardLoad[];
  delivered: DispatchBoardLoad[];
}

export interface DispatchBoardLoad {
  id: string;
  trackingNumber: string;
  origin: string;
  destination: string;
  pickupAt?: string;
  deliveryAt?: string;
  rate?: number | null;
  miles?: number;
  equipment: string;
  status: string;
  carrierName?: string;
  driverName?: string;
  driverId?: string;
  carrierId?: string;
}

export interface RateTrendEntry {
  periodStart?: string;
  periodEnd?: string;
  avgRatePerMile: number;
  minRate?: number | null;
  maxRate?: number | null;
  sampleCount: number;
  period?: string;
}

export interface RateComparison {
  verdict: 'above_market' | 'below_market' | 'at_market' | 'insufficient_data';
  brokerOffer: number;
  marketAvgRatePerMile?: number;
  differencePercent?: number;
  sampleCount?: number;
  recommendation?: string;
}

export interface BrokerCredit {
  mcNumber: string;
  found: boolean;
  carrierName?: string;
  creditScore?: number;
  rating?: number;
  totalLoads?: number;
  onTimeRate?: number;
  status?: string;
  source: string;
  message?: string;
}

export interface ComplianceAlert {
  id: string;
  entityType: string;
  entityId: string;
  alertType: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | string;
  title: string;
  description?: string;
  dueDate?: string;
  resolvedAt?: string;
  resolvedBy?: string;
  status: 'open' | 'resolved' | string;
  createdAt?: string;
}

export interface ComplianceDashboard {
  alertCounts: Record<string, number>;
  alerts: ComplianceAlert[];
  expiringInsurance: Array<{
    carrierId: string;
    carrierName: string;
    mcNumber?: string;
    insuranceExpiry: string;
    daysRemaining: number | null;
  }>;
  expiringLicenses: Array<{
    driverId: string;
    driverName: string;
    licenseExpiry: string;
    carrierId?: string;
    daysRemaining: number | null;
  }>;
}

export interface CSAScore {
  dotNumber: string;
  carrierName: string;
  scores: {
    unsafeDriving: number;
    hosFatigue: number;
    driverFitness: number;
    controlledSubstances: number;
    vehicleMaintenance: number;
    hazmat: number;
    crashIndicator: number;
  };
  source: string;
  message?: string;
}

export interface FactoringOption {
  provider: string;
  ratePercent: number;
  fee: number;
  net: number;
  terms: string;
}

export interface FactoringComparison {
  invoiceAmount: number;
  options: FactoringOption[];
  recommendation: string;
}

export interface ChatThread {
  id: string;
  subject?: string;
  loadId?: string;
  createdBy: string;
  creatorName?: string;
  lastMessage?: {
    body: string;
    senderId: string;
    createdAt: string;
  } | null;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  threadId: string;
  senderId: string;
  senderName?: string;
  body: string;
  createdAt: string;
}

export interface Settlement {
  id: string;
  driverId: string;
  loadId?: string;
  carrierId?: string;
  amount: number;
  rateType: string;
  miles?: number;
  deductions: number;
  netAmount: number;
  periodStart?: string;
  periodEnd?: string;
  paidAt?: string;
  status: 'pending' | 'paid' | string;
  notes?: string;
  createdAt?: string;
}

export interface DriverEarnings {
  totalRevenue: number;
  totalLoads: number;
  monthRevenue: number;
  monthLoads: number;
  weekRevenue: number;
  weekLoads: number;
  averagePerLoad: number;
  totalSettled: number;
}

export interface RateConfirmation {
  loadId: string;
  trackingNumber: string;
  origin: string;
  destination: string;
  pickupAt?: string;
  deliveryAt?: string;
  rate?: number | null;
  equipment: string;
  carrierName: string;
  shipperName?: string;
  specialInstructions?: string;
  generatedAt: string;
}
