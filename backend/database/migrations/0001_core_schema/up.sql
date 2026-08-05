-- Migration 0001 — core schema (zone/category-first). Forward.
-- Runner wraps this in a single transaction (see backend/database/README.md).
-- Requires PostgreSQL >= 13 for gen_random_uuid() (RDS Postgres 16 in staging).

-- ---------- Enumerations ----------
-- Full approved RBAC vocabulary (E5 owns enforcement; E3 only defines the set).
CREATE TYPE user_role AS ENUM ('customer', 'professional', 'support', 'moderator', 'admin', 'super_admin');
CREATE TYPE professional_status AS ENUM ('pending', 'active', 'suspended', 'deactivated');
CREATE TYPE verification_status AS ENUM ('pending', 'approved', 'rejected', 'expired');

-- ---------- Partition-key primitives (first-class from day one) ----------
CREATE TABLE travel_zones (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug       text NOT NULL UNIQUE,
  name       text NOT NULL,
  is_active  boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
COMMENT ON TABLE travel_zones IS 'Geographic serviceability partition key. Physical partitioning deferred; zone_id is a mandatory first-class column on all zone-scoped tables (see ADR-002).';

CREATE TABLE service_categories (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug       text NOT NULL UNIQUE,
  name       text NOT NULL,
  is_active  boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
COMMENT ON TABLE service_categories IS 'First-class service category (barbers = one instance). Later categories plug in without a schema rewrite (blueprint principle #18).';

-- ---------- Identity core ----------
CREATE TABLE users (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone      text NOT NULL,
  role       user_role NOT NULL,
  email      text,
  status     text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  -- Foundational Israeli E.164 check; E5 owns rigorous phone validation.
  CONSTRAINT users_phone_il_e164_chk CHECK (phone ~ '^\+972[0-9]{8,9}$'),
  -- "One verified phone = one account per role" (blueprint identity model).
  CONSTRAINT users_phone_role_uniq UNIQUE (phone, role)
);

CREATE TABLE customer_profiles (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  display_name text,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

-- Category-agnostic provider entity (NOT "barber_profiles") per category-first principle; ADR-002.
CREATE TABLE professional_profiles (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  primary_zone_id uuid NOT NULL REFERENCES travel_zones(id),
  category_id     uuid NOT NULL REFERENCES service_categories(id),
  display_name    text,
  bio             text,
  status          professional_status NOT NULL DEFAULT 'pending',
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);
COMMENT ON COLUMN professional_profiles.primary_zone_id IS 'First-class zone partition key (NOT NULL).';
COMMENT ON COLUMN professional_profiles.category_id IS 'First-class category key (NOT NULL); barber for V1.';

CREATE TABLE addresses (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_profile_id uuid NOT NULL REFERENCES customer_profiles(id) ON DELETE CASCADE,
  zone_id             uuid NOT NULL REFERENCES travel_zones(id),
  line1               text NOT NULL,
  line2               text,
  city                text NOT NULL,
  latitude            numeric(9,6),
  longitude           numeric(9,6),
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE service_areas (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_profile_id uuid NOT NULL REFERENCES professional_profiles(id) ON DELETE CASCADE,
  zone_id                 uuid NOT NULL REFERENCES travel_zones(id),
  radius_m                integer NOT NULL,
  created_at              timestamptz NOT NULL DEFAULT now(),
  updated_at              timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT service_areas_radius_positive_chk CHECK (radius_m > 0)
);

-- PII blast radius contained: opaque references only, never the documents themselves.
CREATE TABLE identity_verifications (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_profile_id uuid NOT NULL UNIQUE REFERENCES professional_profiles(id) ON DELETE CASCADE,
  status                  verification_status NOT NULL DEFAULT 'pending',
  document_ref            text,
  background_check_ref    text,
  expires_at              timestamptz,
  created_at              timestamptz NOT NULL DEFAULT now(),
  updated_at              timestamptz NOT NULL DEFAULT now()
);
COMMENT ON COLUMN identity_verifications.document_ref IS 'Opaque reference into the segregated secure verification-docs store (E2 storage module). Never the document contents.';

-- ---------- Hot-path indexes (E3-relevant subset of the blueprint) ----------
CREATE INDEX idx_professional_profiles_zone_category ON professional_profiles (primary_zone_id, category_id);
CREATE INDEX idx_professional_profiles_status        ON professional_profiles (status);
CREATE INDEX idx_addresses_zone                      ON addresses (zone_id);
CREATE INDEX idx_addresses_customer                  ON addresses (customer_profile_id);
CREATE INDEX idx_service_areas_zone                  ON service_areas (zone_id);
CREATE INDEX idx_service_areas_professional          ON service_areas (professional_profile_id);
CREATE INDEX idx_identity_verifications_status       ON identity_verifications (status);
-- NOTE: booking/appointment/ledger/review indexes — e.g. unique (professional_id, slot),
-- (professional_id, start_time), (zone_id, date) — are created WITH their tables in the
-- Booking and Payments/Ledger epics. Reserved here as placeholders only (see README).
