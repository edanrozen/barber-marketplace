-- Migration 0003 — professional catalog: presentation fields + services + portfolio. Forward.

ALTER TABLE professional_profiles
  ADD COLUMN profile_photo_url    text,
  ADD COLUMN cover_photo_url      text,
  ADD COLUMN rating_avg           numeric(2,1) NOT NULL DEFAULT 0.0,
  ADD COLUMN rating_count         integer NOT NULL DEFAULT 0,
  ADD COLUMN eta_min_minutes      integer,
  ADD COLUMN eta_max_minutes      integer,
  ADD COLUMN availability_summary text,
  ADD CONSTRAINT professional_profiles_rating_chk       CHECK (rating_avg >= 0 AND rating_avg <= 5),
  ADD CONSTRAINT professional_profiles_rating_count_chk CHECK (rating_count >= 0);

CREATE TABLE professional_services (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_profile_id uuid NOT NULL REFERENCES professional_profiles(id) ON DELETE CASCADE,
  category_id             uuid NOT NULL REFERENCES service_categories(id),
  name                    text NOT NULL,
  description             text,
  price_minor_units       integer NOT NULL,
  currency                text NOT NULL DEFAULT 'ILS',
  duration_minutes        integer NOT NULL,
  is_active               boolean NOT NULL DEFAULT true,
  sort_order              integer NOT NULL DEFAULT 0,
  created_at              timestamptz NOT NULL DEFAULT now(),
  updated_at              timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT professional_services_price_chk    CHECK (price_minor_units >= 0),
  CONSTRAINT professional_services_duration_chk CHECK (duration_minutes > 0)
);
CREATE INDEX idx_professional_services_profile ON professional_services (professional_profile_id, sort_order);

CREATE TABLE professional_portfolio_media (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_profile_id uuid NOT NULL REFERENCES professional_profiles(id) ON DELETE CASCADE,
  url                     text NOT NULL,
  caption                 text,
  sort_order              integer NOT NULL DEFAULT 0,
  created_at              timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_professional_portfolio_profile ON professional_portfolio_media (professional_profile_id, sort_order);
