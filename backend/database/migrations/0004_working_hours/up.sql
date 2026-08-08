-- Migration 0004 — professional working hours (weekly recurring availability). Forward.
CREATE TABLE professional_working_hours (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_profile_id uuid NOT NULL REFERENCES professional_profiles(id) ON DELETE CASCADE,
  weekday                 smallint NOT NULL,   -- 0=Sunday … 6=Saturday
  start_minute            integer  NOT NULL,   -- minutes from local midnight
  end_minute              integer  NOT NULL,
  created_at              timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT pwh_weekday_chk CHECK (weekday BETWEEN 0 AND 6),
  CONSTRAINT pwh_window_chk  CHECK (start_minute >= 0 AND end_minute <= 1440 AND start_minute < end_minute)
);
CREATE INDEX idx_pwh_profile_weekday ON professional_working_hours (professional_profile_id, weekday);
