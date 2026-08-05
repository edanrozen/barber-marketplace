-- Migration 0001 — core schema. Reverse (reversible, expand-migrate-contract).
-- Dropped in reverse dependency order. Indexes drop with their tables.
DROP TABLE IF EXISTS identity_verifications;
DROP TABLE IF EXISTS service_areas;
DROP TABLE IF EXISTS addresses;
DROP TABLE IF EXISTS professional_profiles;
DROP TABLE IF EXISTS customer_profiles;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS service_categories;
DROP TABLE IF EXISTS travel_zones;
DROP TYPE IF EXISTS verification_status;
DROP TYPE IF EXISTS professional_status;
DROP TYPE IF EXISTS user_role;
