-- Migration 0002 — authentication. Reverse.
DROP TABLE IF EXISTS refresh_tokens;
DROP TABLE IF EXISTS otp_challenges;
