export type AmazonDeliveryRoute = 'AMAZON_MCF' | 'AMAZON_SHIPPING' | 'LOCAL_CARRIER' | 'MANUAL_REVIEW';

export type AmazonDeliveryRisk = 'none' | 'missing_inventory' | 'missing_address' | 'missing_package' | 'manual_review_required' | 'amazon_credentials_missing';

export type AmazonDeliveryAddress = {
  name?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  stateOrRegion?: string;
  postalCode: string;
  countryCode: string;
  phone?: string;
  email?: string;
};

export type AmazonDeliveryDimensions = {
  length: number;
  width: number;
  height: number;
  unit: 'IN' | 'CM';
};

export type AmazonDeliveryWeight = {
  value: number;
  unit: 'LB' | 'KG' | 'OZ' | 'G';
};

export type AmazonDeliveryPackage = {
  clientReferenceId: string;
  weight: AmazonDeliveryWeight;
  dimensions: AmazonDeliveryDimensions;
  declaredValue?: {
    amount: number;
    currencyCode: string;
  };
};

export type AmazonDeliveryOrderItem = {
  sku: string;
  quantity: number;
};

export type AmazonDeliveryOrder = {
  orderId: string;
  channel: 'website' | 'manual' | 'marketplace' | 'other';
  destination: AmazonDeliveryAddress;
  origin?: AmazonDeliveryAddress;
  returnTo?: AmazonDeliveryAddress;
  items: AmazonDeliveryOrderItem[];
  packages?: AmazonDeliveryPackage[];
  promisedDeliveryDate?: string;
  serviceLevel?: 'Standard' | 'Expedited' | 'Priority' | 'ScheduledDelivery';
  allowAmazonMcf?: boolean;
  allowAmazonShipping?: boolean;
};

export type AmazonInventorySummary = {
  sku: string;
  asin?: string;
  fulfillableQuantity: number;
  inboundQuantity?: number;
  reservedQuantity?: number;
  unfulfillableQuantity?: number;
  lastSyncedAt: string;
};

export type AmazonInventorySnapshot = Record<string, AmazonInventorySummary>;

export type AmazonRouteDecision = {
  route: AmazonDeliveryRoute;
  reason: string;
  fallback: AmazonDeliveryRoute;
  risks: AmazonDeliveryRisk[];
  requiredSkus: string[];
  createdAt: string;
};

export type AmazonShippingRate = {
  rateId: string;
  carrierName: string;
  serviceName: string;
  amount: number;
  currencyCode: string;
  promise?: {
    pickupWindow?: unknown;
    deliveryWindow?: unknown;
  };
  raw?: unknown;
};

export type AmazonShippingRatesResult = {
  requestToken: string;
  rates: AmazonShippingRate[];
  raw?: unknown;
  dryRun: boolean;
};

export type AmazonPurchasedShipment = {
  shipmentId: string;
  trackingId?: string;
  labelDocuments?: unknown[];
  raw?: unknown;
  dryRun: boolean;
};

export type AmazonMcfOrderResult = {
  fulfillmentOrderId: string;
  status: 'accepted' | 'dry_run' | 'failed';
  raw?: unknown;
  dryRun: boolean;
};

export type AmazonTrackingResult = {
  trackingId: string;
  summary?: string;
  events: unknown[];
  raw?: unknown;
  dryRun: boolean;
};

export type AmazonInventorySyncResult = {
  inventory: AmazonInventorySummary[];
  raw?: unknown;
  dryRun: boolean;
};
