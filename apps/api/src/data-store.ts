import { randomUUID } from 'crypto';
import { PrismaClient } from '@prisma/client';
import { createPrismaClient } from './prisma-client';
import { BillingSyncPayload } from './billing';

type BaseRecord = {
  id: string;
  tenantId: string;
};

export type FreightOperationResource =
  | 'quoteRequests'
  | 'loadAssignments'
  | 'loadDispatches'
  | 'shipmentTracking'
  | 'deliveryConfirmations'
  | 'carrierPayments'
  | 'rateAgreements'
  | 'operationalMetrics'
  | 'loadBoardPosts';

export type LoadAssignmentDecision = 'accepted' | 'rejected';
export type FreightWorkflowResult = Record<string, unknown>;
export type LoadRecord = BaseRecord & Record<string, unknown>;
export type DriverRecord = BaseRecord & Record<string, unknown>;
export type ShipmentRecord = BaseRecord & Record<string, unknown>;
export type FreightOperationRecord = BaseRecord & Record<string, unknown>;

export type QuoteLeadRecord = {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  originCity: string;
  destCity: string;
  freightType: string;
  weight: number;
  pickupDate: string;
  notes: string;
  source: string;
  status: string;
  receivedAt: string;
};

type PrismaPublicLeadRecord = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  originCity: string | null;
  destCity: string | null;
  freightType: string | null;
  weight: number;
  pickupDate: Date | null;
  notes: string | null;
  source: string;
  status: string;
  receivedAt: Date;
};

type PrismaLoadRecord = {
  id: string;
  carrierId: string;
  driverId: string | null;
  brokerName: string;
  brokerMc: string | null;
  originCity: string;
  originState: string;
  originLat: number;
  originLng: number;
  destCity: string;
  destState: string;
  destLat: number;
  destLng: number;
  distance: number;
  rate: number;
  ratePerMile: number;
  equipmentType: string;
  weight: number;
  status: string;
  pickupDate: Date;
  deliveryDate: Date | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
};

type PrismaDriverRecord = {
  id: string;
  carrierId: string;
  name: string;
  phone: string | null;
  licenseNumber: string | null;
  licenseState: string | null;
  equipmentType: string | null;
  status: string;
  currentLat: number | null;
  currentLng: number | null;
  hosStatus: string;
  hoursRemaining: number;
  lastLocationAt: Date;
  createdAt: Date;
};

type OperationConfig = {
  delegate: string;
  tenantField?: string;
  tenantRelation?: string;
  numberFields?: string[];
  booleanFields?: string[];
  dateFields?: string[];
};

const OPERATION_CONFIG: Record<FreightOperationResource, OperationConfig> = {
  quoteRequests: {
    delegate: 'quoteRequest',
    tenantField: 'carrierId',
    numberFields: ['weight', 'shipperRate', 'carrierCost', 'profitMargin'],
    dateFields: ['pickupDate', 'deliveryDeadline', 'expiresAt'],
  },
  loadAssignments: {
    delegate: 'loadAssignment',
    tenantField: 'carrierId',
    numberFields: ['rateConfirmed'],
    dateFields: ['acceptedAt', 'rejectedAt'],
  },
  loadDispatches: {
    delegate: 'loadDispatch',
    tenantField: 'carrierId',
    dateFields: ['pickupAppointment', 'deliveryAppointment', 'dispatchedAt', 'confirmedAt'],
  },
  shipmentTracking: {
    delegate: 'shipmentTracking',
    tenantRelation: 'load',
    numberFields: ['latitude', 'longitude'],
    booleanFields: ['podReceived', 'podVerified'],
    dateFields: ['pickupConfirmedAt', 'deliveryETA', 'deliveredAt'],
  },
  deliveryConfirmations: {
    delegate: 'deliveryConfirmation',
    tenantRelation: 'load',
    dateFields: ['podDate', 'deliveryTime', 'verifiedAt'],
  },
  carrierPayments: {
    delegate: 'carrierPayment',
    tenantField: 'carrierId',
    numberFields: ['amount'],
    dateFields: ['paymentDate'],
  },
  rateAgreements: {
    delegate: 'rateAgreement',
    tenantField: 'carrierId',
    numberFields: ['baseRate', 'fuelSurcharge'],
    dateFields: ['effectiveDate', 'expiryDate'],
  },
  operationalMetrics: {
    delegate: 'operationalMetric',
    numberFields: ['loadsBooked', 'grossMargin', 'onTimePickup', 'onTimeDelivery', 'daysOutstanding'],
    dateFields: ['date'],
  },
  loadBoardPosts: {
    delegate: 'loadBoardPost',
    tenantRelation: 'load',
    dateFields: ['postedAt', 'expiresAt'],
  },
};

export interface DataStore {
  listLoads(tenantId: string): Promise<LoadRecord[]>;
  createLoad(tenantId: string, payload: Record<string, unknown>): Promise<LoadRecord>;
  listDrivers(tenantId: string): Promise<DriverRecord[]>;
  createDriver(tenantId: string, payload: Record<string, unknown>): Promise<DriverRecord>;
  listShipments(tenantId: string): Promise<ShipmentRecord[]>;
  createShipment(tenantId: string, payload: Record<string, unknown>): Promise<ShipmentRecord>;
  listFreightOperations(
    resource: FreightOperationResource,
    tenantId: string,
  ): Promise<FreightOperationRecord[]>;
  createFreightOperation(
    resource: FreightOperationResource,
    tenantId: string,
    payload: Record<string, unknown>,
  ): Promise<FreightOperationRecord>;
  updateFreightOperation(
    resource: FreightOperationResource,
    tenantId: string,
    id: string,
    payload: Record<string, unknown>,
  ): Promise<FreightOperationRecord>;
  convertQuoteToLoad(
    tenantId: string,
    quoteRequestId: string,
    payload: Record<string, unknown>,
  ): Promise<FreightWorkflowResult>;
  respondToLoadAssignment(
    tenantId: string,
    assignmentId: string,
    decision: LoadAssignmentDecision,
    payload?: Record<string, unknown>,
  ): Promise<FreightOperationRecord>;
  confirmDispatch(
    tenantId: string,
    dispatchId: string,
    payload?: Record<string, unknown>,
  ): Promise<FreightOperationRecord>;
  recordTrackingUpdate(
    tenantId: string,
    loadId: string,
    payload: Record<string, unknown>,
  ): Promise<FreightOperationRecord>;
  verifyDelivery(
    tenantId: string,
    loadId: string,
    payload: Record<string, unknown>,
  ): Promise<FreightWorkflowResult>;
  updateCarrierPaymentStatus(
    tenantId: string,
    paymentId: string,
    payload: Record<string, unknown>,
  ): Promise<FreightOperationRecord>;
  rollupOperationalMetrics(
    tenantId: string,
    payload: Record<string, unknown>,
  ): Promise<FreightOperationRecord>;
  updateLoadBoardPostStatus(
    tenantId: string,
    postId: string,
    payload: Record<string, unknown>,
  ): Promise<FreightOperationRecord>;
  submitQuoteLead(payload: Record<string, unknown>): Promise<QuoteLeadRecord>;
  syncCarrierBilling(payload: BillingSyncPayload): Promise<boolean>;
  getCarrierStripeCustomerId(tenantId: string): Promise<string | null>;
  getCarrierSubscriptionStatus(tenantId: string): Promise<string | null>;
  healthCheck(): Promise<'connected' | 'disconnected'>;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function normalizePayload(
  payload: Record<string, unknown>,
  config: OperationConfig,
): Record<string, unknown> {
  const data = { ...payload };

  for (const field of config.numberFields ?? []) {
    if (data[field] !== undefined && data[field] !== null) {
      data[field] = Number(data[field]);
    }
  }

  for (const field of config.booleanFields ?? []) {
    if (data[field] !== undefined && data[field] !== null) {
      data[field] = Boolean(data[field]);
    }
  }

  for (const field of config.dateFields ?? []) {
    if (data[field] !== undefined && data[field] !== null) {
      data[field] = new Date(String(data[field]));
    }
  }

  delete data.tenantId;
  return data;
}

function normalizeOperationRecord(
  record: Record<string, unknown>,
  tenantId: string,
): FreightOperationRecord {
  return { ...record, id: String(record.id), tenantId };
}

function buildTenantWhere(config: OperationConfig, tenantId: string): Record<string, unknown> {
  if (config.tenantField) {
    return { [config.tenantField]: tenantId };
  }

  if (config.tenantRelation) {
    return { [config.tenantRelation]: { carrierId: tenantId } };
  }

  return {};
}

function getNestedPayload(
  payload: Record<string, unknown>,
  key: string,
): Record<string, unknown> {
  return isRecord(payload[key]) ? payload[key] as Record<string, unknown> : payload;
}

function normalizeLeadPayload(payload: Record<string, unknown>): Omit<QuoteLeadRecord, 'id' | 'receivedAt'> {
  const rawWeight = parseFloat(String(payload.weight ?? '0'));

  return {
    name: String(payload.name ?? ''),
    email: String(payload.email ?? ''),
    phone: String(payload.phone ?? ''),
    company: String(payload.company ?? ''),
    originCity: String(payload.originCity ?? ''),
    destCity: String(payload.destCity ?? ''),
    freightType: String(payload.freightType ?? ''),
    weight: isFinite(rawWeight) ? rawWeight : 0,
    pickupDate: String(payload.pickupDate ?? ''),
    notes: String(payload.notes ?? ''),
    source: String(payload.source ?? 'web-form'),
    status: 'new',
  };
}

function normalizePublicLead(record: PrismaPublicLeadRecord): QuoteLeadRecord {
  return {
    id: record.id,
    name: record.name,
    email: record.email,
    phone: record.phone ?? '',
    company: record.company ?? '',
    originCity: record.originCity ?? '',
    destCity: record.destCity ?? '',
    freightType: record.freightType ?? '',
    weight: record.weight,
    pickupDate: record.pickupDate?.toISOString() ?? '',
    notes: record.notes ?? '',
    source: record.source,
    status: record.status,
    receivedAt: record.receivedAt.toISOString(),
  };
}

async function assertLoadBelongsToTenant(
  prisma: PrismaClient,
  tenantId: string,
  loadId: unknown,
): Promise<void> {
  if (typeof loadId !== 'string' || !loadId.trim()) {
    return;
  }

  const load = await prisma.load.findFirst({
    where: { id: loadId, carrierId: tenantId },
    select: { id: true },
  });

  if (!load) {
    throw new Error('load_not_found_for_tenant');
  }
}

class MemoryDataStore implements DataStore {
  private loads: LoadRecord[] = [];
  private drivers: DriverRecord[] = [];
  private shipments: ShipmentRecord[] = [];
  private leads: QuoteLeadRecord[] = [];
  private carrierBilling = new Map<string, {
    stripeCustomerId: string | null;
    subscriptionTier: string;
    status: string;
  }>();
  private freightOperations: Record<FreightOperationResource, FreightOperationRecord[]> = {
    quoteRequests: [],
    loadAssignments: [],
    loadDispatches: [],
    shipmentTracking: [],
    deliveryConfirmations: [],
    carrierPayments: [],
    rateAgreements: [],
    operationalMetrics: [],
    loadBoardPosts: [],
  };

  async listLoads(tenantId: string): Promise<LoadRecord[]> {
    return this.loads.filter((item) => item.tenantId === tenantId);
  }

  async createLoad(tenantId: string, payload: Record<string, unknown>): Promise<LoadRecord> {
    const record = { id: randomUUID(), tenantId, ...payload };
    this.loads.push(record);
    return record;
  }

  async listDrivers(tenantId: string): Promise<DriverRecord[]> {
    return this.drivers.filter((item) => item.tenantId === tenantId);
  }

  async createDriver(tenantId: string, payload: Record<string, unknown>): Promise<DriverRecord> {
    const record = { id: randomUUID(), tenantId, ...payload };
    this.drivers.push(record);
    return record;
  }

  async listShipments(tenantId: string): Promise<ShipmentRecord[]> {
    return this.shipments.filter((item) => item.tenantId === tenantId);
  }

  async createShipment(tenantId: string, payload: Record<string, unknown>): Promise<ShipmentRecord> {
    const record = { id: randomUUID(), tenantId, ...payload };
    this.shipments.push(record);
    return record;
  }

  async listFreightOperations(
    resource: FreightOperationResource,
    tenantId: string,
  ): Promise<FreightOperationRecord[]> {
    return this.freightOperations[resource].filter((item) => item.tenantId === tenantId);
  }

  async createFreightOperation(
    resource: FreightOperationResource,
    tenantId: string,
    payload: Record<string, unknown>,
  ): Promise<FreightOperationRecord> {
    const record = { id: randomUUID(), tenantId, ...payload };
    this.freightOperations[resource].push(record);
    return record;
  }

  async updateFreightOperation(
    resource: FreightOperationResource,
    tenantId: string,
    id: string,
    payload: Record<string, unknown>,
  ): Promise<FreightOperationRecord> {
    const records = this.freightOperations[resource];
    const index = records.findIndex((item) => item.id === id && item.tenantId === tenantId);

    if (index === -1) {
      throw new Error('freight_operation_not_found');
    }

    records[index] = { ...records[index], ...payload, id, tenantId };
    return records[index];
  }

  async convertQuoteToLoad(
    tenantId: string,
    quoteRequestId: string,
    payload: Record<string, unknown>,
  ): Promise<FreightWorkflowResult> {
    const quoteRequest = await this.updateFreightOperation(
      'quoteRequests',
      tenantId,
      quoteRequestId,
      { status: payload.quoteStatus ?? 'converted' },
    );
    const loadPayload = getNestedPayload(payload, 'load');
    const load = await this.createLoad(tenantId, {
      ...loadPayload,
      quoteRequestId,
      brokerName: loadPayload.brokerName ?? quoteRequest.brokerName,
      originCity: loadPayload.originCity ?? quoteRequest.originCity,
      destCity: loadPayload.destCity ?? quoteRequest.destCity,
      status: loadPayload.status ?? 'booked',
    });

    return { quoteRequest, load };
  }

  async respondToLoadAssignment(
    tenantId: string,
    assignmentId: string,
    decision: LoadAssignmentDecision,
    payload: Record<string, unknown> = {},
  ): Promise<FreightOperationRecord> {
    const timestampField = decision === 'accepted' ? 'acceptedAt' : 'rejectedAt';
    return this.updateFreightOperation('loadAssignments', tenantId, assignmentId, {
      ...payload,
      status: decision,
      [timestampField]: payload[timestampField] ?? new Date().toISOString(),
    });
  }

  async confirmDispatch(
    tenantId: string,
    dispatchId: string,
    payload: Record<string, unknown> = {},
  ): Promise<FreightOperationRecord> {
    return this.updateFreightOperation('loadDispatches', tenantId, dispatchId, {
      ...payload,
      status: payload.status ?? 'confirmed',
      confirmedAt: payload.confirmedAt ?? new Date().toISOString(),
    });
  }

  async recordTrackingUpdate(
    tenantId: string,
    loadId: string,
    payload: Record<string, unknown>,
  ): Promise<FreightOperationRecord> {
    return this.createFreightOperation('shipmentTracking', tenantId, {
      ...payload,
      loadId,
      status: payload.status ?? 'in_transit',
    });
  }

  async verifyDelivery(
    tenantId: string,
    loadId: string,
    payload: Record<string, unknown>,
  ): Promise<FreightWorkflowResult> {
    const deliveryConfirmation = await this.createFreightOperation('deliveryConfirmations', tenantId, {
      ...payload,
      loadId,
      verifiedAt: payload.verifiedAt ?? new Date().toISOString(),
    });
    const tracking = await this.createFreightOperation('shipmentTracking', tenantId, {
      loadId,
      status: 'delivered',
      deliveredAt: payload.deliveryTime ?? new Date().toISOString(),
      podReceived: true,
      podVerified: true,
    });

    return { deliveryConfirmation, tracking };
  }

  async updateCarrierPaymentStatus(
    tenantId: string,
    paymentId: string,
    payload: Record<string, unknown>,
  ): Promise<FreightOperationRecord> {
    return this.updateFreightOperation('carrierPayments', tenantId, paymentId, {
      ...payload,
      status: payload.status ?? 'paid',
      paymentDate: payload.paymentDate ?? new Date().toISOString(),
    });
  }

  async rollupOperationalMetrics(
    tenantId: string,
    payload: Record<string, unknown>,
  ): Promise<FreightOperationRecord> {
    return this.createFreightOperation('operationalMetrics', tenantId, {
      date: payload.date ?? new Date().toISOString(),
      period: payload.period ?? 'daily',
      loadsBooked: payload.loadsBooked ?? 0,
      grossMargin: payload.grossMargin ?? 0,
      onTimePickup: payload.onTimePickup ?? 0,
      onTimeDelivery: payload.onTimeDelivery ?? 0,
      daysOutstanding: payload.daysOutstanding ?? 0,
    });
  }

  async updateLoadBoardPostStatus(
    tenantId: string,
    postId: string,
    payload: Record<string, unknown>,
  ): Promise<FreightOperationRecord> {
    return this.updateFreightOperation('loadBoardPosts', tenantId, postId, {
      ...payload,
      status: payload.status ?? 'expired',
    });
  }

  async submitQuoteLead(payload: Record<string, unknown>): Promise<QuoteLeadRecord> {
    const lead = normalizeLeadPayload(payload);
    const record: QuoteLeadRecord = {
      id: randomUUID(),
      ...lead,
      receivedAt: new Date().toISOString(),
    };
    this.leads.push(record);
    return record;
  }

  async syncCarrierBilling(payload: BillingSyncPayload): Promise<boolean> {
    const carrierId = payload.carrierId;
    if (!carrierId) {
      return false;
    }

    const current = this.carrierBilling.get(carrierId) ?? {
      stripeCustomerId: null,
      subscriptionTier: 'starter',
      status: 'trial',
    };

    this.carrierBilling.set(carrierId, {
      stripeCustomerId: payload.stripeCustomerId ?? current.stripeCustomerId,
      subscriptionTier: payload.subscriptionTier ?? current.subscriptionTier,
      status: payload.status ?? current.status,
    });

    return true;
  }

  async getCarrierStripeCustomerId(tenantId: string): Promise<string | null> {
    return this.carrierBilling.get(tenantId)?.stripeCustomerId ?? null;
  }

  async getCarrierSubscriptionStatus(tenantId: string): Promise<string | null> {
    return this.carrierBilling.get(tenantId)?.status ?? null;
  }

  async healthCheck(): Promise<'connected' | 'disconnected'> {
    return 'connected';
  }
}

class PrismaDataStore implements DataStore {
  constructor(private readonly prisma: PrismaClient) {}

  async listLoads(tenantId: string): Promise<LoadRecord[]> {
    const loads = await this.prisma.load.findMany({
      where: { carrierId: tenantId },
      orderBy: { createdAt: 'desc' },
    }) as PrismaLoadRecord[];
    return loads.map((load: PrismaLoadRecord) => ({ ...load, tenantId: load.carrierId }));
  }

  async createLoad(tenantId: string, payload: Record<string, unknown>): Promise<LoadRecord> {
    const data = payload as {
      brokerName: string;
      originCity: string;
      originState: string;
      originLat: number;
      originLng: number;
      destCity: string;
      destState: string;
      destLat: number;
      destLng: number;
      distance: number;
      rate: number;
      ratePerMile: number;
      equipmentType: string;
      weight: number;
      pickupDate: string;
      status?: string;
      brokerMc?: string;
      notes?: string;
      deliveryDate?: string;
      driverId?: string;
    };

    const load = await this.prisma.load.create({
      data: {
        carrierId: tenantId,
        brokerName: data.brokerName,
        originCity: data.originCity,
        originState: data.originState,
        originLat: Number(data.originLat),
        originLng: Number(data.originLng),
        destCity: data.destCity,
        destState: data.destState,
        destLat: Number(data.destLat),
        destLng: Number(data.destLng),
        distance: Number(data.distance),
        rate: Number(data.rate),
        ratePerMile: Number(data.ratePerMile),
        equipmentType: data.equipmentType,
        weight: Number(data.weight),
        pickupDate: new Date(data.pickupDate),
        status: data.status,
        brokerMc: data.brokerMc,
        notes: data.notes,
        deliveryDate: data.deliveryDate ? new Date(data.deliveryDate) : undefined,
        driverId: data.driverId,
      },
    }) as PrismaLoadRecord;
    return { ...load, tenantId: load.carrierId };
  }

  async listDrivers(tenantId: string): Promise<DriverRecord[]> {
    const drivers = await this.prisma.driver.findMany({
      where: { carrierId: tenantId },
      orderBy: { createdAt: 'desc' },
    }) as PrismaDriverRecord[];
    return drivers.map((driver: PrismaDriverRecord) => ({
      ...driver,
      tenantId: driver.carrierId,
    }));
  }

  async createDriver(tenantId: string, payload: Record<string, unknown>): Promise<DriverRecord> {
    const data = payload as {
      name: string;
      phone?: string;
      licenseNumber?: string;
      licenseState?: string;
      equipmentType?: string;
      status?: string;
      currentLat?: number;
      currentLng?: number;
      hosStatus?: string;
      hoursRemaining?: number;
    };

    const driver = await this.prisma.driver.create({
      data: {
        carrierId: tenantId,
        name: data.name,
        phone: data.phone,
        licenseNumber: data.licenseNumber,
        licenseState: data.licenseState,
        equipmentType: data.equipmentType,
        status: data.status,
        currentLat: data.currentLat,
        currentLng: data.currentLng,
        hosStatus: data.hosStatus,
        hoursRemaining: data.hoursRemaining,
      },
    }) as PrismaDriverRecord;
    return { ...driver, tenantId: driver.carrierId };
  }

  async listShipments(tenantId: string): Promise<ShipmentRecord[]> {
    const loads: Array<{
      id: string;
      carrierId: string;
      brokerName: string;
      originCity: string;
      originState: string;
      destCity: string;
      destState: string;
      status: string;
      pickupDate: Date;
      deliveryDate: Date | null;
      rate: number;
    }> = await this.prisma.load.findMany({
      where: { carrierId: tenantId },
      select: {
        id: true,
        carrierId: true,
        brokerName: true,
        originCity: true,
        originState: true,
        destCity: true,
        destState: true,
        status: true,
        pickupDate: true,
        deliveryDate: true,
        rate: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return loads.map((load) => ({
      id: load.id,
      tenantId: load.carrierId,
      brokerName: load.brokerName,
      originCity: load.originCity,
      originState: load.originState,
      destCity: load.destCity,
      destState: load.destState,
      status: load.status,
      pickupDate: load.pickupDate,
      deliveryDate: load.deliveryDate,
      rate: load.rate,
    }));
  }

  async createShipment(tenantId: string, payload: Record<string, unknown>): Promise<ShipmentRecord> {
    const load = await this.createLoad(tenantId, payload);
    return {
      id: load.id,
      tenantId: load.tenantId,
      brokerName: load.brokerName,
      originCity: load.originCity,
      originState: load.originState,
      destCity: load.destCity,
      destState: load.destState,
      status: load.status,
      pickupDate: load.pickupDate,
      deliveryDate: load.deliveryDate ?? null,
      rate: load.rate,
    };
  }

  async listFreightOperations(
    resource: FreightOperationResource,
    tenantId: string,
  ): Promise<FreightOperationRecord[]> {
    const config = OPERATION_CONFIG[resource];
    const delegate = (this.prisma as unknown as Record<string, any>)[config.delegate];
    const records = await delegate.findMany({
      where: buildTenantWhere(config, tenantId),
      orderBy: { createdAt: 'desc' },
    }) as Array<Record<string, unknown>>;

    return records.map((record) => normalizeOperationRecord(record, tenantId));
  }

  async createFreightOperation(
    resource: FreightOperationResource,
    tenantId: string,
    payload: Record<string, unknown>,
  ): Promise<FreightOperationRecord> {
    const config = OPERATION_CONFIG[resource];
    const data = normalizePayload(payload, config);

    if (config.tenantField) {
      data[config.tenantField] = tenantId;
    }

    if (config.tenantRelation === 'load') {
      await assertLoadBelongsToTenant(this.prisma, tenantId, data.loadId);
    }

    const delegate = (this.prisma as unknown as Record<string, any>)[config.delegate];
    const record = await delegate.create({ data }) as Record<string, unknown>;
    return normalizeOperationRecord(record, tenantId);
  }

  async updateFreightOperation(
    resource: FreightOperationResource,
    tenantId: string,
    id: string,
    payload: Record<string, unknown>,
  ): Promise<FreightOperationRecord> {
    const config = OPERATION_CONFIG[resource];
    const delegate = (this.prisma as unknown as Record<string, any>)[config.delegate];
    const existing = await delegate.findFirst({
      where: { id, ...buildTenantWhere(config, tenantId) },
      select: { id: true },
    });

    if (!existing) {
      throw new Error('freight_operation_not_found');
    }

    const data = normalizePayload(payload, config);
    delete data.id;

    if (config.tenantField) {
      delete data[config.tenantField];
    }

    if (config.tenantRelation === 'load' && data.loadId !== undefined) {
      await assertLoadBelongsToTenant(this.prisma, tenantId, data.loadId);
    }

    const record = await delegate.update({
      where: { id },
      data,
    }) as Record<string, unknown>;

    return normalizeOperationRecord(record, tenantId);
  }

  async convertQuoteToLoad(
    tenantId: string,
    quoteRequestId: string,
    payload: Record<string, unknown>,
  ): Promise<FreightWorkflowResult> {
    const quoteRequest = await this.prisma.quoteRequest.findFirst({
      where: { id: quoteRequestId, carrierId: tenantId },
    }) as Record<string, unknown> | null;

    if (!quoteRequest) {
      throw new Error('quote_request_not_found');
    }

    const loadPayload = getNestedPayload(payload, 'load');
    const load = await this.createLoad(tenantId, {
      ...loadPayload,
      brokerName: loadPayload.brokerName ?? quoteRequest.brokerName,
      originCity: loadPayload.originCity ?? quoteRequest.originCity,
      destCity: loadPayload.destCity ?? quoteRequest.destCity,
      pickupDate: loadPayload.pickupDate ?? quoteRequest.pickupDate,
      status: loadPayload.status ?? 'booked',
    });
    const updatedQuote = await this.prisma.quoteRequest.update({
      where: { id: quoteRequestId },
      data: { status: String(payload.quoteStatus ?? 'converted') },
    }) as Record<string, unknown>;

    return {
      quoteRequest: normalizeOperationRecord(updatedQuote, tenantId),
      load,
    };
  }

  async respondToLoadAssignment(
    tenantId: string,
    assignmentId: string,
    decision: LoadAssignmentDecision,
    payload: Record<string, unknown> = {},
  ): Promise<FreightOperationRecord> {
    const timestampField = decision === 'accepted' ? 'acceptedAt' : 'rejectedAt';
    return this.updateFreightOperation('loadAssignments', tenantId, assignmentId, {
      ...payload,
      status: decision,
      [timestampField]: payload[timestampField] ?? new Date().toISOString(),
    });
  }

  async confirmDispatch(
    tenantId: string,
    dispatchId: string,
    payload: Record<string, unknown> = {},
  ): Promise<FreightOperationRecord> {
    return this.updateFreightOperation('loadDispatches', tenantId, dispatchId, {
      ...payload,
      status: payload.status ?? 'confirmed',
      confirmedAt: payload.confirmedAt ?? new Date().toISOString(),
    });
  }

  async recordTrackingUpdate(
    tenantId: string,
    loadId: string,
    payload: Record<string, unknown>,
  ): Promise<FreightOperationRecord> {
    return this.createFreightOperation('shipmentTracking', tenantId, {
      ...payload,
      loadId,
      status: payload.status ?? 'in_transit',
    });
  }

  async verifyDelivery(
    tenantId: string,
    loadId: string,
    payload: Record<string, unknown>,
  ): Promise<FreightWorkflowResult> {
    const deliveryConfirmation = await this.createFreightOperation('deliveryConfirmations', tenantId, {
      ...payload,
      loadId,
      verifiedAt: payload.verifiedAt ?? new Date().toISOString(),
    });
    const tracking = await this.createFreightOperation('shipmentTracking', tenantId, {
      loadId,
      status: 'delivered',
      deliveredAt: payload.deliveryTime ?? new Date().toISOString(),
      podReceived: true,
      podVerified: true,
    });

    return { deliveryConfirmation, tracking };
  }

  async updateCarrierPaymentStatus(
    tenantId: string,
    paymentId: string,
    payload: Record<string, unknown>,
  ): Promise<FreightOperationRecord> {
    return this.updateFreightOperation('carrierPayments', tenantId, paymentId, {
      ...payload,
      status: payload.status ?? 'paid',
      paymentDate: payload.paymentDate ?? new Date().toISOString(),
    });
  }

  async rollupOperationalMetrics(
    tenantId: string,
    payload: Record<string, unknown>,
  ): Promise<FreightOperationRecord> {
    return this.createFreightOperation('operationalMetrics', tenantId, {
      date: payload.date ?? new Date().toISOString(),
      period: payload.period ?? 'daily',
      loadsBooked: payload.loadsBooked ?? 0,
      grossMargin: payload.grossMargin ?? 0,
      onTimePickup: payload.onTimePickup ?? 0,
      onTimeDelivery: payload.onTimeDelivery ?? 0,
      daysOutstanding: payload.daysOutstanding ?? 0,
    });
  }

  async updateLoadBoardPostStatus(
    tenantId: string,
    postId: string,
    payload: Record<string, unknown>,
  ): Promise<FreightOperationRecord> {
    return this.updateFreightOperation('loadBoardPosts', tenantId, postId, {
      ...payload,
      status: payload.status ?? 'expired',
    });
  }

  async submitQuoteLead(payload: Record<string, unknown>): Promise<QuoteLeadRecord> {
    const lead = normalizeLeadPayload(payload);
    const publicLeadDelegate = (this.prisma as unknown as Record<string, any>).publicLead;
    const record = await publicLeadDelegate.create({
      data: {
        name: lead.name,
        email: lead.email,
        phone: lead.phone || undefined,
        company: lead.company || undefined,
        originCity: lead.originCity || undefined,
        destCity: lead.destCity || undefined,
        freightType: lead.freightType || undefined,
        weight: lead.weight,
        pickupDate: lead.pickupDate ? new Date(lead.pickupDate) : undefined,
        notes: lead.notes || undefined,
        source: lead.source,
        status: lead.status,
      },
    }) as PrismaPublicLeadRecord;

    return normalizePublicLead(record);
  }

  async syncCarrierBilling(payload: BillingSyncPayload): Promise<boolean> {
    if (!payload.carrierId && !payload.stripeCustomerId) {
      return false;
    }

    const existing = payload.carrierId
      ? await this.prisma.carrier.findUnique({ where: { id: payload.carrierId } })
      : await this.prisma.carrier.findFirst({ where: { stripeCustomerId: payload.stripeCustomerId } });

    if (!existing) {
      return false;
    }

    await this.prisma.carrier.update({
      where: { id: existing.id },
      data: {
        stripeCustomerId: payload.stripeCustomerId ?? existing.stripeCustomerId,
        subscriptionTier: payload.subscriptionTier ?? existing.subscriptionTier,
        status: payload.status ?? existing.status,
      },
    });

    return true;
  }

  async getCarrierStripeCustomerId(tenantId: string): Promise<string | null> {
    const carrier = await this.prisma.carrier.findUnique({
      where: { id: tenantId },
      select: { stripeCustomerId: true },
    });

    return carrier?.stripeCustomerId ?? null;
  }

  async getCarrierSubscriptionStatus(tenantId: string): Promise<string | null> {
    const carrier = await this.prisma.carrier.findUnique({
      where: { id: tenantId },
      select: { status: true },
    });

    return carrier?.status ?? null;
  }

  async healthCheck(): Promise<'connected' | 'disconnected'> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return 'connected';
    } catch {
      return 'disconnected';
    }
  }
}

let prismaClient: PrismaClient | null = null;

export function createDataStore(): DataStore {
  if (process.env.NODE_ENV === 'test') {
    return new MemoryDataStore();
  }

  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is required outside of test mode.');
  }

  prismaClient ??= createPrismaClient();
  return new PrismaDataStore(prismaClient);
}
