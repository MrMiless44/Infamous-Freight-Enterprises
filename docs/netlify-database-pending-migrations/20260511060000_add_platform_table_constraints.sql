-- Add validation constraints and idempotent trigger guards to platform tables

ALTER TABLE users
  ADD CONSTRAINT users_email_format_chk
    CHECK (email ~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'),
  ADD CONSTRAINT users_role_chk
    CHECK (role IN ('admin', 'owner', 'dispatcher', 'driver', 'carrier', 'accounting', 'viewer')),
  ADD CONSTRAINT users_subscription_status_chk
    CHECK (subscription_status IN ('none', 'trialing', 'active', 'past_due', 'canceled', 'unpaid', 'incomplete'));

ALTER TABLE carriers
  ADD CONSTRAINT carriers_rating_chk
    CHECK (rating IS NULL OR rating BETWEEN 0 AND 5),
  ADD CONSTRAINT carriers_total_loads_chk
    CHECK (total_loads >= 0),
  ADD CONSTRAINT carriers_on_time_rate_chk
    CHECK (on_time_rate IS NULL OR on_time_rate BETWEEN 0 AND 100),
  ADD CONSTRAINT carriers_authority_status_chk
    CHECK (authority_status IN ('pending', 'active', 'inactive', 'revoked', 'suspended')),
  ADD CONSTRAINT carriers_status_chk
    CHECK (status IN ('active', 'inactive', 'pending', 'suspended'));

ALTER TABLE drivers
  ADD CONSTRAINT drivers_hos_remaining_hours_chk
    CHECK (hos_remaining_hours IS NULL OR hos_remaining_hours BETWEEN 0 AND 70),
  ADD CONSTRAINT drivers_lat_chk
    CHECK (current_lat IS NULL OR current_lat BETWEEN -90 AND 90),
  ADD CONSTRAINT drivers_lng_chk
    CHECK (current_lng IS NULL OR current_lng BETWEEN -180 AND 180),
  ADD CONSTRAINT drivers_status_chk
    CHECK (status IN ('available', 'off_duty', 'on_duty', 'driving', 'assigned', 'inactive'));

ALTER TABLE loads
  ADD CONSTRAINT loads_rate_chk
    CHECK (rate IS NULL OR rate >= 0),
  ADD CONSTRAINT loads_miles_chk
    CHECK (miles IS NULL OR miles >= 0),
  ADD CONSTRAINT loads_weight_lbs_chk
    CHECK (weight_lbs IS NULL OR weight_lbs >= 0),
  ADD CONSTRAINT loads_status_chk
    CHECK (status IN ('available', 'assigned', 'dispatched', 'in_transit', 'delivered', 'invoiced', 'cancelled'));

ALTER TABLE gps_positions
  ADD CONSTRAINT gps_positions_lat_chk
    CHECK (lat BETWEEN -90 AND 90),
  ADD CONSTRAINT gps_positions_lng_chk
    CHECK (lng BETWEEN -180 AND 180),
  ADD CONSTRAINT gps_positions_speed_mph_chk
    CHECK (speed_mph IS NULL OR speed_mph >= 0),
  ADD CONSTRAINT gps_positions_heading_chk
    CHECK (heading IS NULL OR heading BETWEEN 0 AND 359);

ALTER TABLE quotes
  ADD CONSTRAINT quotes_weight_lbs_chk
    CHECK (weight_lbs IS NULL OR weight_lbs >= 0),
  ADD CONSTRAINT quotes_lane_miles_chk
    CHECK (lane_miles IS NULL OR lane_miles >= 0),
  ADD CONSTRAINT quotes_amounts_chk
    CHECK (
      (quoted_amount IS NULL OR quoted_amount >= 0)
      AND (estimated_carrier_cost IS NULL OR estimated_carrier_cost >= 0)
      AND (rate_per_mile IS NULL OR rate_per_mile >= 0)
    ),
  ADD CONSTRAINT quotes_target_margin_chk
    CHECK (target_margin IS NULL OR target_margin BETWEEN -100 AND 100),
  ADD CONSTRAINT quotes_status_chk
    CHECK (status IN ('new', 'draft', 'sent', 'accepted', 'declined', 'converted', 'expired'));

ALTER TABLE invoices
  ADD CONSTRAINT invoices_amount_chk
    CHECK (amount >= 0),
  ADD CONSTRAINT invoices_currency_chk
    CHECK (char_length(currency) = 3 AND currency = upper(currency)),
  ADD CONSTRAINT invoices_status_chk
    CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'void', 'uncollectible'));

ALTER TABLE invoice_line_items
  ADD CONSTRAINT invoice_line_items_quantity_chk
    CHECK (quantity > 0),
  ADD CONSTRAINT invoice_line_items_amounts_chk
    CHECK (unit_price >= 0 AND amount >= 0);

ALTER TABLE notifications
  ADD CONSTRAINT notifications_data_object_chk
    CHECK (data IS NULL OR jsonb_typeof(data) = 'object');

DROP TRIGGER IF EXISTS users_updated_at ON users;
CREATE TRIGGER users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS carriers_updated_at ON carriers;
CREATE TRIGGER carriers_updated_at BEFORE UPDATE ON carriers FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS drivers_updated_at ON drivers;
CREATE TRIGGER drivers_updated_at BEFORE UPDATE ON drivers FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS loads_updated_at ON loads;
CREATE TRIGGER loads_updated_at BEFORE UPDATE ON loads FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS quotes_updated_at ON quotes;
CREATE TRIGGER quotes_updated_at BEFORE UPDATE ON quotes FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS invoices_updated_at ON invoices;
CREATE TRIGGER invoices_updated_at BEFORE UPDATE ON invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at();
