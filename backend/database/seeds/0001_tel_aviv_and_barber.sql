-- Seed 0001 — launch zone + launch category. Idempotent (safe to re-run).
INSERT INTO travel_zones (slug, name)
  VALUES ('tel-aviv', 'תל אביב-יפו')
  ON CONFLICT (slug) DO NOTHING;

INSERT INTO service_categories (slug, name)
  VALUES ('barber', 'מספרה')
  ON CONFLICT (slug) DO NOTHING;
