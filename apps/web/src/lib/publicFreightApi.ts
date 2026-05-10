export type PublicQuotePayload = {
  company: string;
  contact: string;
  email: string;
  phone: string;
  origin: string;
  destination: string;
  freightType: string;
  equipment: string;
  weight: string;
  miles: string;
  dimensions: string;
  pickupDate: string;
  deliveryDate: string;
  instructions: string;
  estimate?: {
    low: number;
    mid: number;
    high: number;
    rpm: number;
    confidence: number;
  };
};

export type PublicQuoteResponse = {
  quote: {
    id: string;
    trackingNumber: string;
    status: string;
    createdAt: string;
  };
};

export type PublicShipment = {
  trackingNumber: string;
  route: string;
  origin: string;
  destination: string;
  status: string;
  pickupDate: string | null;
  deliveryDate: string | null;
  eta: string | null;
  equipment: string | null;
  notes: string | null;
  timeline?: Array<{ label: string; status?: string; timestamp?: string }>;
  updatedAt: string;
};

export async function createPublicQuoteRequest(payload: PublicQuotePayload): Promise<PublicQuoteResponse> {
  const response = await fetch('/api/public/quote-requests', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error('Dispatch intake is temporarily unavailable. Your form details were not saved to tracking.');
  }

  return response.json() as Promise<PublicQuoteResponse>;
}

export async function getPublicShipment(trackingNumber: string): Promise<PublicShipment | null> {
  const response = await fetch(`/api/public/shipments/${encodeURIComponent(trackingNumber)}`);

  if (response.status === 404) return null;

  if (!response.ok) {
    throw new Error('Tracking lookup is temporarily unavailable.');
  }

  const body = (await response.json()) as { shipment: PublicShipment };
  return body.shipment;
}
