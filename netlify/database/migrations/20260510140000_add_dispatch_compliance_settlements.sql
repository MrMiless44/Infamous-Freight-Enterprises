-- Dispatch assignments: tracks load-to-carrier/driver assignments with scoring
CREATE TABLE IF NOT EXISTS dispatch_assignments (
  id TEXT PRIMARY KEY,
  load_id TEXT NOT NULL REFERENCES loads(id) ON DELETE CASCADE,
  carrier_id TEXT REFERENCES carriers(id) ON DELETE SET NULL,
  driver_id TEXT REFERENCES drivers(id) ON DELETE SET NULL,
  score NUMERIC(5,2),
  method TEXT NOT NULL DEFAULT 'manual',
  status TEXT NOT NULL DEFAULT 'pending',
  assigned_by TEXT REFERENCES users(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS dispatch_assignments_load_id_idx ON dispatch_assignments (load_id);
CREATE INDEX IF NOT EXISTS dispatch_assignments_carrier_id_idx ON dispatch_assignments (carrier_id);
CREATE INDEX IF NOT EXISTS dispatch_assignments_status_idx ON dispatch_assignments (status);

-- Rate analytics: historical rate data per lane
CREATE TABLE IF NOT EXISTS rate_analytics (
  id TEXT PRIMARY KEY,
  origin_state TEXT NOT NULL,
  dest_state TEXT NOT NULL,
  equipment TEXT NOT NULL DEFAULT 'Dry van',
  avg_rate_per_mile NUMERIC(8,2) NOT NULL,
  min_rate NUMERIC(12,2),
  max_rate NUMERIC(12,2),
  sample_count INTEGER NOT NULL DEFAULT 0,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS rate_analytics_lane_idx ON rate_analytics (origin_state, dest_state, equipment);
CREATE INDEX IF NOT EXISTS rate_analytics_period_idx ON rate_analytics (period_end DESC);

-- Compliance alerts: tracks document expirations, violations, and regulatory items
CREATE TABLE IF NOT EXISTS compliance_alerts (
  id TEXT PRIMARY KEY,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  alert_type TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'medium',
  title TEXT NOT NULL,
  description TEXT,
  due_date DATE,
  resolved_at TIMESTAMPTZ,
  resolved_by TEXT REFERENCES users(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'open',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS compliance_alerts_entity_idx ON compliance_alerts (entity_type, entity_id);
CREATE INDEX IF NOT EXISTS compliance_alerts_status_idx ON compliance_alerts (status);
CREATE INDEX IF NOT EXISTS compliance_alerts_severity_idx ON compliance_alerts (severity);

-- Chat threads for internal messaging between dispatchers, drivers, carriers
CREATE TABLE IF NOT EXISTS chat_threads (
  id TEXT PRIMARY KEY,
  subject TEXT,
  load_id TEXT REFERENCES loads(id) ON DELETE SET NULL,
  created_by TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS chat_threads_load_id_idx ON chat_threads (load_id);
CREATE INDEX IF NOT EXISTS chat_threads_created_by_idx ON chat_threads (created_by);

CREATE TABLE IF NOT EXISTS chat_thread_members (
  thread_id TEXT NOT NULL REFERENCES chat_threads(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (thread_id, user_id)
);

CREATE TABLE IF NOT EXISTS chat_messages (
  id TEXT PRIMARY KEY,
  thread_id TEXT NOT NULL REFERENCES chat_threads(id) ON DELETE CASCADE,
  sender_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS chat_messages_thread_id_idx ON chat_messages (thread_id, created_at ASC);

-- Driver settlements: pay records for completed loads
CREATE TABLE IF NOT EXISTS settlements (
  id TEXT PRIMARY KEY,
  driver_id TEXT NOT NULL REFERENCES drivers(id) ON DELETE CASCADE,
  load_id TEXT REFERENCES loads(id) ON DELETE SET NULL,
  carrier_id TEXT REFERENCES carriers(id) ON DELETE SET NULL,
  amount NUMERIC(12,2) NOT NULL,
  rate_type TEXT NOT NULL DEFAULT 'per_mile',
  miles INTEGER,
  deductions NUMERIC(12,2) NOT NULL DEFAULT 0,
  net_amount NUMERIC(12,2) NOT NULL,
  period_start DATE,
  period_end DATE,
  paid_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS settlements_driver_id_idx ON settlements (driver_id);
CREATE INDEX IF NOT EXISTS settlements_status_idx ON settlements (status);
CREATE INDEX IF NOT EXISTS settlements_period_idx ON settlements (period_start, period_end);

CREATE TRIGGER dispatch_assignments_updated_at BEFORE UPDATE ON dispatch_assignments FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER chat_threads_updated_at BEFORE UPDATE ON chat_threads FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER settlements_updated_at BEFORE UPDATE ON settlements FOR EACH ROW EXECUTE FUNCTION update_updated_at();
