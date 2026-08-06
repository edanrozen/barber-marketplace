-- Migration 0003 — professional catalog. Reverse.
DROP TABLE IF EXISTS professional_portfolio_media;
DROP TABLE IF EXISTS professional_services;
ALTER TABLE professional_profiles
  DROP CONSTRAINT IF EXISTS professional_profiles_rating_count_chk,
  DROP CONSTRAINT IF EXISTS professional_profiles_rating_chk,
  DROP COLUMN IF EXISTS availability_summary,
  DROP COLUMN IF EXISTS eta_max_minutes,
  DROP COLUMN IF EXISTS eta_min_minutes,
  DROP COLUMN IF EXISTS rating_count,
  DROP COLUMN IF EXISTS rating_avg,
  DROP COLUMN IF EXISTS cover_photo_url,
  DROP COLUMN IF EXISTS profile_photo_url;
