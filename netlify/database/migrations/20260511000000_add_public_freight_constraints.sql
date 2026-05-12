-- Add validation constraints and auto-update triggers to public freight intake tables

ALTER TABLE public_quote_requests
  ADD CONSTRAINT public_quote_requests_email_format_chk
    CHECK (email ~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'),
  ADD CONSTRAINT public_quote_requests_weight_lbs_chk
    CHECK (weight_lbs IS NULL OR weight_lbs >= 0),
  ADD CONSTRAINT public_quote_requests_lane_miles_chk
    CHECK (lane_miles IS NULL OR lane_miles >= 0),
  ADD CONSTRAINT public_quote_requests_estimate_confidence_chk
    CHECK (estimate_confidence IS NULL OR estimate_confidence BETWEEN 0 AND 100),
  ADD CONSTRAINT public_quote_requests_estimate_order_chk
    CHECK (
      estimate_low IS NULL
      OR estimate_mid IS NULL
      OR estimate_high IS NULL
      OR (estimate_low <= estimate_mid AND estimate_mid <= estimate_high)
    ),
  ADD CONSTRAINT public_quote_requests_status_chk
    CHECK (status IN ('received', 'reviewing', 'quoted', 'converted', 'declined', 'closed'));

ALTER TABLE public_shipments
  ADD CONSTRAINT public_shipments_timeline_array_chk
    CHECK (jsonb_typeof(timeline) = 'array');

ALTER TABLE carrier_load_requests
  ADD CONSTRAINT carrier_load_requests_total_pay_chk
    CHECK (total_pay IS NULL OR total_pay >= 0),
  ADD CONSTRAINT carrier_load_requests_rate_per_mile_chk
    CHECK (rate_per_mile IS NULL OR rate_per_mile >= 0),
  ADD CONSTRAINT carrier_load_requests_asking_rate_chk
    CHECK (asking_rate IS NULL OR asking_rate >= 0),
  ADD CONSTRAINT carrier_load_requests_status_chk
    CHECK (status IN ('pending', 'reviewing', 'accepted', 'declined', 'expired'));

DROP TRIGGER IF EXISTS public_quote_requests_updated_at ON public_quote_requests;
CREATE TRIGGER public_quote_requests_updated_at
  BEFORE UPDATE ON public_quote_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS public_shipments_updated_at ON public_shipments;
CREATE TRIGGER public_shipments_updated_at
  BEFORE UPDATE ON public_shipments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
