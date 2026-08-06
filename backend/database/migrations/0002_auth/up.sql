-- Migration 0002 — authentication (OTP challenges + refresh-token families). Forward.

CREATE TABLE otp_challenges (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone        text NOT NULL,
  purpose      text NOT NULL DEFAULT 'login',
  code_hash    text NOT NULL,
  attempts     integer NOT NULL DEFAULT 0,
  max_attempts integer NOT NULL DEFAULT 5,
  expires_at   timestamptz NOT NULL,
  consumed_at  timestamptz,
  last_sent_at timestamptz NOT NULL DEFAULT now(),
  created_at   timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT otp_challenges_phone_il_chk CHECK (phone ~ '^\+972[0-9]{8,9}$')
);
CREATE INDEX idx_otp_challenges_phone ON otp_challenges (phone, created_at DESC);

-- Refresh tokens with rotation + reuse detection. Only the SHA-256 hash is stored.
CREATE TABLE refresh_tokens (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  family_id    uuid NOT NULL,
  token_hash   text NOT NULL UNIQUE,
  device_label text,
  issued_at    timestamptz NOT NULL DEFAULT now(),
  expires_at   timestamptz NOT NULL,
  used_at      timestamptz,
  revoked_at   timestamptz,
  rotated_to   uuid REFERENCES refresh_tokens(id),
  created_at   timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_refresh_tokens_user   ON refresh_tokens (user_id);
CREATE INDEX idx_refresh_tokens_family ON refresh_tokens (family_id);
