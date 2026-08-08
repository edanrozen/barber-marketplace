-- Migration 0005 — bookings (scheduled appointments). Forward.
CREATE TABLE bookings (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_user_id        uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  professional_profile_id uuid NOT NULL REFERENCES professional_profiles(id) ON DELETE CASCADE,
  service_id              uuid NOT NULL REFERENCES professional_services(id),
  scheduled_date          date NOT NULL,
  start_minute            integer NOT NULL,
  end_minute              integer NOT NULL,
  duration_minutes        integer NOT NULL,
  price_minor_units       integer NOT NULL,
  currency                text NOT NULL DEFAULT 'ILS',
  status                  text NOT NULL DEFAULT 'confirmed',
  created_at              timestamptz NOT NULL DEFAULT now(),
  updated_at              timestamptz NOT NULL DEFAULT now(),
  cancelled_at            timestamptz,
  CONSTRAINT bookings_status_chk CHECK (status IN ('confirmed','cancelled','completed')),
  CONSTRAINT bookings_window_chk CHECK (start_minute >= 0 AND end_minute <= 1440 AND start_minute < end_minute)
);
CREATE INDEX idx_bookings_customer          ON bookings (customer_user_id, scheduled_date);
CREATE INDEX idx_bookings_professional_date ON bookings (professional_profile_id, scheduled_date);
-- Prevents double-booking the same professional+slot; cancelled bookings free the slot.
CREATE UNIQUE INDEX uq_bookings_slot_active ON bookings (professional_profile_id, scheduled_date, start_minute) WHERE status = 'confirmed';
