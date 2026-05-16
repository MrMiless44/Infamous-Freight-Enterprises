-- Platform tables for freight management backend

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'viewer',
  carrier_id TEXT,
  avatar_url TEXT,
  phone TEXT,
  subscription_status TEXT NOT NULL DEFAULT 'none',
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS users_email_idx ON users (email);
CREATE INDEX IF NOT EXISTS users_carrier_id_idx ON users (carrier_id);
CREATE INDEX IF NOT EXISTS users_role_idx ON users (role);

CREATE TABLE IF NOT EXISTS carriers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  mc_number TEXT UNIQUE,
  dot_number TEXT,
  contact_name TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip TEXT,
  insurance_expiry DATE,
  authority_status TEXT NOT NULL DEFAULT 'pending',
  rating NUMERIC(3,2),
  total_loads INTEGER NOT NULL DEFAULT 0,
  on_time_rate NUMERIC(5,2),
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS carriers_mc_number_idx ON carriers (mc_number);
CREATE INDEX IF NOT EXISTS carriers_status_idx ON carriers (status);

CREATE TABLE IF NOT EXISTS drivers (
  id TEXT PRIMARY KEY,
  carrier_id TEXT REFERENCES carriers(id) ON DELETE CASCADE,
  user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  license_number TEXT,
  license_state TEXT,
  license_expiry DATE,
  status TEXT NOT NULL DEFAULT 'off_duty',
  hos_remaining_hours NUMERIC(5,2) DEFAULT 11.00,
  current_location TEXT,
  current_lat NUMERIC(10,7),
  current_lng NUMERIC(10,7),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS drivers_carrier_id_idx ON drivers (carrier_id);
CREATE INDEX IF NOT EXISTS drivers_status_idx ON drivers (status);
CREATE INDEX IF NOT EXISTS drivers_user_id_idx ON drivers (user_id);

CREATE TABLE IF NOT EXISTS loads (
  id TEXT PRIMARY KEY,
  tracking_number TEXT NOT NULL UNIQUE,
  origin TEXT NOT NULL,
  destination TEXT NOT NULL,
  pickup_at TIMESTAMPTZ,
  delivery_at TIMESTAMPTZ,
  rate NUMERIC(12,2),
  miles INTEGER,
  equipment TEXT NOT NULL DEFAULT 'Dry van',
  weight_lbs INTEGER,
  commodity TEXT,
  status TEXT NOT NULL DEFAULT 'available',
  driver_id TEXT REFERENCES drivers(id) ON DELETE SET NULL,
  carrier_id TEXT REFERENCES carriers(id) ON DELETE SET NULL,
  shipper_name TEXT,
  shipper_email TEXT,
  special_instructions TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS loads_status_idx ON loads (status);
CREATE INDEX IF NOT EXISTS loads_tracking_number_idx ON loads (tracking_number);
CREATE INDEX IF NOT EXISTS loads_driver_id_idx ON loads (driver_id);
CREATE INDEX IF NOT EXISTS loads_carrier_id_idx ON loads (carrier_id);
CREATE INDEX IF NOT EXISTS loads_pickup_at_idx ON loads (pickup_at);

CREATE TABLE IF NOT EXISTS gps_positions (
  id TEXT PRIMARY KEY,
  load_id TEXT REFERENCES loads(id) ON DELETE CASCADE,
  driver_id TEXT REFERENCES drivers(id) ON DELETE CASCADE,
  lat NUMERIC(10,7) NOT NULL,
  lng NUMERIC(10,7) NOT NULL,
  speed_mph NUMERIC(6,2),
  heading INTEGER,
  address TEXT,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS gps_positions_load_id_idx ON gps_positions (load_id, recorded_at DESC);
CREATE INDEX IF NOT EXISTS gps_positions_driver_id_idx ON gps_positions (driver_id, recorded_at DESC);

CREATE TABLE IF NOT EXISTS quotes (
  id TEXT PRIMARY KEY,
  quote_number TEXT NOT NULL UNIQUE,
  public_request_id TEXT REFERENCES public_quote_requests(id) ON DELETE SET NULL,
  shipper TEXT NOT NULL,
  origin TEXT NOT NULL,
  destination TEXT NOT NULL,
  commodity TEXT,
  freight_type TEXT NOT NULL,
  weight_lbs INTEGER,
  equipment TEXT NOT NULL DEFAULT 'Dry van',
  pickup_date DATE,
  delivery_deadline DATE,
  lane_miles INTEGER,
  quoted_amount NUMERIC(12,2),
  estimated_carrier_cost NUMERIC(12,2),
  target_margin NUMERIC(5,2),
  rate_per_mile NUMERIC(8,2),
  status TEXT NOT NULL DEFAULT 'new',
  converted_load_id TEXT REFERENCES loads(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS quotes_status_idx ON quotes (status);
CREATE INDEX IF NOT EXISTS quotes_created_at_idx ON quotes (created_at DESC);
CREATE INDEX IF NOT EXISTS quotes_quote_number_idx ON quotes (quote_number);

CREATE TABLE IF NOT EXISTS documents (
  id TEXT PRIMARY KEY,
  load_id TEXT REFERENCES loads(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  file_name TEXT NOT NULL,
  blob_key TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  uploaded_by TEXT REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS documents_load_id_idx ON documents (load_id);
CREATE INDEX IF NOT EXISTS documents_type_idx ON documents (type);

CREATE TABLE IF NOT EXISTS invoices (
  id TEXT PRIMARY KEY,
  invoice_number TEXT NOT NULL UNIQUE,
  load_id TEXT REFERENCES loads(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  amount NUMERIC(12,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  issued_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  due_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'draft',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS invoices_status_idx ON invoices (status);
CREATE INDEX IF NOT EXISTS invoices_load_id_idx ON invoices (load_id);
CREATE INDEX IF NOT EXISTS invoices_due_at_idx ON invoices (due_at);

CREATE TABLE IF NOT EXISTS invoice_line_items (
  id TEXT PRIMARY KEY,
  invoice_id TEXT NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity NUMERIC(10,2) NOT NULL DEFAULT 1,
  unit_price NUMERIC(12,2) NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS invoice_line_items_invoice_id_idx ON invoice_line_items (invoice_id);

CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}'::jsonb,
  read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS notifications_user_id_idx ON notifications (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS notifications_unread_idx ON notifications (user_id, read) WHERE read = FALSE;

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER carriers_updated_at BEFORE UPDATE ON carriers FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER drivers_updated_at BEFORE UPDATE ON drivers FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER loads_updated_at BEFORE UPDATE ON loads FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER quotes_updated_at BEFORE UPDATE ON quotes FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER invoices_updated_at BEFORE UPDATE ON invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at();
