CREATE TABLE IF NOT EXISTS public_quote_requests (
  id TEXT PRIMARY KEY,
  tracking_number TEXT NOT NULL UNIQUE,
  company TEXT NOT NULL,
  contact TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  origin TEXT NOT NULL,
  destination TEXT NOT NULL,
  freight_type TEXT NOT NULL,
  equipment TEXT NOT NULL,
  weight_lbs INTEGER,
  lane_miles INTEGER,
  dimensions TEXT,
  pickup_date DATE,
  delivery_date DATE,
  instructions TEXT,
  estimate_low INTEGER,
  estimate_mid INTEGER,
  estimate_high INTEGER,
  estimate_rpm NUMERIC(8, 2),
  estimate_confidence INTEGER,
  status TEXT NOT NULL DEFAULT 'received',
  source TEXT NOT NULL DEFAULT 'public_quote_form',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS public_quote_requests_created_at_idx
  ON public_quote_requests (created_at DESC);

CREATE INDEX IF NOT EXISTS public_quote_requests_status_idx
  ON public_quote_requests (status);

CREATE TABLE IF NOT EXISTS public_shipments (
  tracking_number TEXT PRIMARY KEY,
  quote_request_id TEXT REFERENCES public_quote_requests(id) ON DELETE SET NULL,
  route TEXT NOT NULL,
  origin TEXT NOT NULL,
  destination TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Quote received',
  pickup_date TEXT,
  delivery_date TEXT,
  eta TEXT,
  equipment TEXT,
  public_notes TEXT,
  timeline JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS public_shipments_status_idx
  ON public_shipments (status);

CREATE INDEX IF NOT EXISTS public_shipments_updated_at_idx
  ON public_shipments (updated_at DESC);

CREATE TABLE IF NOT EXISTS carrier_load_requests (
  id TEXT PRIMARY KEY,
  load_id TEXT NOT NULL,
  lane TEXT,
  equipment TEXT,
  total_pay NUMERIC(12, 2),
  rate_per_mile NUMERIC(8, 2),
  carrier_name TEXT NOT NULL,
  mc_number TEXT NOT NULL,
  contact_email TEXT,
  contact_phone TEXT,
  asking_rate NUMERIC(12, 2),
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS carrier_load_requests_created_at_idx
  ON carrier_load_requests (created_at DESC);

CREATE INDEX IF NOT EXISTS carrier_load_requests_status_idx
  ON carrier_load_requests (status);
