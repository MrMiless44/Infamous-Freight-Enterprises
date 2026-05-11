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
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT public_quote_requests_email_format_chk
    CHECK (email ~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'),
  CONSTRAINT public_quote_requests_weight_lbs_chk
    CHECK (weight_lbs IS NULL OR weight_lbs >= 0),
  CONSTRAINT public_quote_requests_lane_miles_chk
    CHECK (lane_miles IS NULL OR lane_miles >= 0),
  CONSTRAINT public_quote_requests_estimate_confidence_chk
    CHECK (estimate_confidence IS NULL OR estimate_confidence BETWEEN 0 AND 100),
  CONSTRAINT public_quote_requests_estimate_order_chk
    CHECK (
      estimate_low IS NULL
      OR estimate_mid IS NULL
      OR estimate_high IS NULL
      OR (estimate_low <= estimate_mid AND estimate_mid <= estimate_high)
    ),
  CONSTRAINT public_quote_requests_status_chk
    CHECK (status IN ('received', 'reviewing', 'quoted', 'converted', 'declined', 'closed'))
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
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT public_shipments_timeline_array_chk
    CHECK (jsonb_typeof(timeline) = 'array')
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
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT carrier_load_requests_total_pay_chk
    CHECK (total_pay IS NULL OR total_pay >= 0),
  CONSTRAINT carrier_load_requests_rate_per_mile_chk
    CHECK (rate_per_mile IS NULL OR rate_per_mile >= 0),
  CONSTRAINT carrier_load_requests_asking_rate_chk
    CHECK (asking_rate IS NULL OR asking_rate >= 0),
  CONSTRAINT carrier_load_requests_status_chk
    CHECK (status IN ('pending', 'reviewing', 'accepted', 'declined', 'expired'))
);

CREATE INDEX IF NOT EXISTS carrier_load_requests_created_at_idx
  ON carrier_load_requests (created_at DESC);

CREATE INDEX IF NOT EXISTS carrier_load_requests_status_idx
  ON carrier_load_requests (status);

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS public_quote_requests_updated_at ON public_quote_requests;
CREATE TRIGGER public_quote_requests_updated_at
  BEFORE UPDATE ON public_quote_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS public_shipments_updated_at ON public_shipments;
CREATE TRIGGER public_shipments_updated_at
  BEFORE UPDATE ON public_shipments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
