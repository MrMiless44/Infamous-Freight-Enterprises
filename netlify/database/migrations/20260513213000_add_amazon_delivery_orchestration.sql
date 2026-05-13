-- Amazon delivery orchestration records for connection metadata, inventory snapshots,
-- routing decisions, fulfillment references, labels, tracking, and webhook status intake.

CREATE TABLE IF NOT EXISTS amazon_connections (
  id TEXT PRIMARY KEY,
  carrier_id TEXT NOT NULL REFERENCES carriers(id) ON DELETE CASCADE,
  account_label TEXT NOT NULL,
  seller_account TEXT,
  marketplace_id TEXT,
  region TEXT NOT NULL DEFAULT 'NA',
  status TEXT NOT NULL DEFAULT 'not_configured',
  enabled BOOLEAN NOT NULL DEFAULT FALSE,
  last_synced_at TIMESTAMPTZ,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT amazon_connections_status_chk
    CHECK (status IN ('not_configured', 'pending_authorization', 'connected', 'paused', 'error')),
  CONSTRAINT amazon_connections_metadata_object_chk
    CHECK (jsonb_typeof(metadata) = 'object')
);

CREATE INDEX IF NOT EXISTS amazon_connections_carrier_id_idx ON amazon_connections (carrier_id);
CREATE INDEX IF NOT EXISTS amazon_connections_status_idx ON amazon_connections (carrier_id, status);

CREATE TABLE IF NOT EXISTS amazon_inventory_items (
  id TEXT PRIMARY KEY,
  carrier_id TEXT NOT NULL REFERENCES carriers(id) ON DELETE CASCADE,
  seller_sku TEXT NOT NULL,
  fulfillment_sku TEXT,
  product_name TEXT,
  available_units INTEGER NOT NULL DEFAULT 0,
  reserved_units INTEGER NOT NULL DEFAULT 0,
  inbound_units INTEGER NOT NULL DEFAULT 0,
  last_synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT amazon_inventory_units_chk
    CHECK (available_units >= 0 AND reserved_units >= 0 AND inbound_units >= 0),
  CONSTRAINT amazon_inventory_carrier_sku_uniq
    UNIQUE (carrier_id, seller_sku)
);

CREATE INDEX IF NOT EXISTS amazon_inventory_items_carrier_availability_idx
  ON amazon_inventory_items (carrier_id, available_units);

CREATE TABLE IF NOT EXISTS amazon_fulfillment_requests (
  id TEXT PRIMARY KEY,
  carrier_id TEXT NOT NULL REFERENCES carriers(id) ON DELETE CASCADE,
  load_id TEXT REFERENCES loads(id) ON DELETE SET NULL,
  order_reference TEXT NOT NULL,
  route_decision TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'planned',
  service_level TEXT,
  amazon_order_id TEXT,
  amazon_shipment_id TEXT,
  carrier_service TEXT,
  tracking_number TEXT,
  label_document_id TEXT,
  fulfillment_status TEXT,
  last_event_type TEXT,
  last_event_at TIMESTAMPTZ,
  request_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT amazon_fulfillment_requests_route_chk
    CHECK (route_decision IN ('amazon_mcf', 'amazon_shipping', 'local_carrier', 'manual_review')),
  CONSTRAINT amazon_fulfillment_requests_status_chk
    CHECK (status IN ('planned', 'submitted', 'label_ready', 'in_transit', 'delivered', 'cancelled', 'error')),
  CONSTRAINT amazon_fulfillment_requests_payload_object_chk
    CHECK (jsonb_typeof(request_payload) = 'object'),
  CONSTRAINT amazon_fulfillment_requests_carrier_order_uniq
    UNIQUE (carrier_id, order_reference)
);

CREATE INDEX IF NOT EXISTS amazon_fulfillment_requests_carrier_status_idx
  ON amazon_fulfillment_requests (carrier_id, status);
CREATE INDEX IF NOT EXISTS amazon_fulfillment_requests_tracking_idx
  ON amazon_fulfillment_requests (tracking_number);

DROP TRIGGER IF EXISTS amazon_connections_updated_at ON amazon_connections;
CREATE TRIGGER amazon_connections_updated_at
  BEFORE UPDATE ON amazon_connections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS amazon_inventory_items_updated_at ON amazon_inventory_items;
CREATE TRIGGER amazon_inventory_items_updated_at
  BEFORE UPDATE ON amazon_inventory_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS amazon_fulfillment_requests_updated_at ON amazon_fulfillment_requests;
CREATE TRIGGER amazon_fulfillment_requests_updated_at
  BEFORE UPDATE ON amazon_fulfillment_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
