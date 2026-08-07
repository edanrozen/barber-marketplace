-- Migration 0007 — payments (cash-first; card/bit-ready). Forward.
CREATE TABLE payments (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id         uuid NOT NULL UNIQUE REFERENCES bookings(id) ON DELETE CASCADE,
  customer_user_id   uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount_minor_units integer NOT NULL,
  currency           text NOT NULL DEFAULT 'ILS',
  method             text NOT NULL,
  status             text NOT NULL DEFAULT 'pending',
  provider_ref       text,
  created_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now(),
  paid_at            timestamptz,
  CONSTRAINT payments_method_chk CHECK (method IN ('cash','card','bit')),
  CONSTRAINT payments_status_chk CHECK (status IN ('pending','paid','refunded','cancelled')),
  CONSTRAINT payments_amount_chk CHECK (amount_minor_units >= 0)
);
CREATE INDEX idx_payments_customer ON payments (customer_user_id, created_at DESC);
