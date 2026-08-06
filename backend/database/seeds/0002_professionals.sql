-- Seed 0002 — 5 operational Tel Aviv professionals (business-created supply). Idempotent.
-- Photos use deterministic picsum.photos seeds so the app renders real images in the demo.

-- יוסי כהן
INSERT INTO users (id, phone, role) VALUES ('10000000-0000-4000-8000-000100000001', '+972541110001', 'professional') ON CONFLICT (id) DO NOTHING;
INSERT INTO professional_profiles (id, user_id, primary_zone_id, category_id, display_name, bio, status, profile_photo_url, cover_photo_url, rating_avg, rating_count, eta_min_minutes, eta_max_minutes, availability_summary)
  SELECT '20000000-0000-4000-8000-000100000001', '10000000-0000-4000-8000-000100000001', z.id, c.id, 'יוסי כהן', 'ספר גברים ותיק עם 12 שנות ניסיון. תספורות קלאסיות ומודרניות עד הבית.', 'active', 'https://picsum.photos/seed/yossi-cohen-p/400/400', 'https://picsum.photos/seed/yossi-cohen-c/1200/600', 4.9, 214, 20, 30, 'זמין היום אחר הצהריים'
  FROM travel_zones z, service_categories c WHERE z.slug='tel-aviv' AND c.slug='barber'
  ON CONFLICT (id) DO NOTHING;
INSERT INTO service_areas (id, professional_profile_id, zone_id, radius_m)
  SELECT '50000000-0000-4000-8000-000100000001', '20000000-0000-4000-8000-000100000001', z.id, 9000 FROM travel_zones z WHERE z.slug='tel-aviv'
  ON CONFLICT (id) DO NOTHING;
INSERT INTO professional_services (id, professional_profile_id, category_id, name, price_minor_units, duration_minutes, sort_order)
  SELECT '30000000-0000-4000-8000-000100000001', '20000000-0000-4000-8000-000100000001', c.id, 'תספורת גבר', 8000, 30, 1 FROM service_categories c WHERE c.slug='barber'
  ON CONFLICT (id) DO NOTHING;
INSERT INTO professional_services (id, professional_profile_id, category_id, name, price_minor_units, duration_minutes, sort_order)
  SELECT '30000000-0000-4000-8000-000100000002', '20000000-0000-4000-8000-000100000001', c.id, 'עיצוב זקן', 4500, 20, 2 FROM service_categories c WHERE c.slug='barber'
  ON CONFLICT (id) DO NOTHING;
INSERT INTO professional_services (id, professional_profile_id, category_id, name, price_minor_units, duration_minutes, sort_order)
  SELECT '30000000-0000-4000-8000-000100000003', '20000000-0000-4000-8000-000100000001', c.id, 'תספורת + זקן', 11000, 45, 3 FROM service_categories c WHERE c.slug='barber'
  ON CONFLICT (id) DO NOTHING;
INSERT INTO professional_services (id, professional_profile_id, category_id, name, price_minor_units, duration_minutes, sort_order)
  SELECT '30000000-0000-4000-8000-000100000004', '20000000-0000-4000-8000-000100000001', c.id, 'תספורת ילד', 6000, 25, 4 FROM service_categories c WHERE c.slug='barber'
  ON CONFLICT (id) DO NOTHING;
INSERT INTO professional_portfolio_media (id, professional_profile_id, url, sort_order)
  VALUES ('40000000-0000-4000-8000-000100000001', '20000000-0000-4000-8000-000100000001', 'https://picsum.photos/seed/yossi-cohen-1/600/600', 1) ON CONFLICT (id) DO NOTHING;
INSERT INTO professional_portfolio_media (id, professional_profile_id, url, sort_order)
  VALUES ('40000000-0000-4000-8000-000100000002', '20000000-0000-4000-8000-000100000001', 'https://picsum.photos/seed/yossi-cohen-2/600/600', 2) ON CONFLICT (id) DO NOTHING;
INSERT INTO professional_portfolio_media (id, professional_profile_id, url, sort_order)
  VALUES ('40000000-0000-4000-8000-000100000003', '20000000-0000-4000-8000-000100000001', 'https://picsum.photos/seed/yossi-cohen-3/600/600', 3) ON CONFLICT (id) DO NOTHING;

-- דניאל אברהמי
INSERT INTO users (id, phone, role) VALUES ('10000000-0000-4000-8000-000200000001', '+972541110002', 'professional') ON CONFLICT (id) DO NOTHING;
INSERT INTO professional_profiles (id, user_id, primary_zone_id, category_id, display_name, bio, status, profile_photo_url, cover_photo_url, rating_avg, rating_count, eta_min_minutes, eta_max_minutes, availability_summary)
  SELECT '20000000-0000-4000-8000-000200000001', '10000000-0000-4000-8000-000200000001', z.id, c.id, 'דניאל אברהמי', 'מתמחה בפייד ובעיצובי זקן מדויקים. מגיע עם כל הציוד המקצועי אליכם.', 'active', 'https://picsum.photos/seed/daniel-avrahami-p/400/400', 'https://picsum.photos/seed/daniel-avrahami-c/1200/600', 4.8, 156, 25, 40, 'פנוי מחר בבוקר'
  FROM travel_zones z, service_categories c WHERE z.slug='tel-aviv' AND c.slug='barber'
  ON CONFLICT (id) DO NOTHING;
INSERT INTO service_areas (id, professional_profile_id, zone_id, radius_m)
  SELECT '50000000-0000-4000-8000-000200000001', '20000000-0000-4000-8000-000200000001', z.id, 8000 FROM travel_zones z WHERE z.slug='tel-aviv'
  ON CONFLICT (id) DO NOTHING;
INSERT INTO professional_services (id, professional_profile_id, category_id, name, price_minor_units, duration_minutes, sort_order)
  SELECT '30000000-0000-4000-8000-000200000001', '20000000-0000-4000-8000-000200000001', c.id, 'תספורת פייד', 9000, 35, 1 FROM service_categories c WHERE c.slug='barber'
  ON CONFLICT (id) DO NOTHING;
INSERT INTO professional_services (id, professional_profile_id, category_id, name, price_minor_units, duration_minutes, sort_order)
  SELECT '30000000-0000-4000-8000-000200000002', '20000000-0000-4000-8000-000200000001', c.id, 'עיצוב זקן', 5000, 20, 2 FROM service_categories c WHERE c.slug='barber'
  ON CONFLICT (id) DO NOTHING;
INSERT INTO professional_services (id, professional_profile_id, category_id, name, price_minor_units, duration_minutes, sort_order)
  SELECT '30000000-0000-4000-8000-000200000003', '20000000-0000-4000-8000-000200000001', c.id, 'תספורת + זקן', 12500, 50, 3 FROM service_categories c WHERE c.slug='barber'
  ON CONFLICT (id) DO NOTHING;
INSERT INTO professional_portfolio_media (id, professional_profile_id, url, sort_order)
  VALUES ('40000000-0000-4000-8000-000200000001', '20000000-0000-4000-8000-000200000001', 'https://picsum.photos/seed/daniel-avrahami-1/600/600', 1) ON CONFLICT (id) DO NOTHING;
INSERT INTO professional_portfolio_media (id, professional_profile_id, url, sort_order)
  VALUES ('40000000-0000-4000-8000-000200000002', '20000000-0000-4000-8000-000200000001', 'https://picsum.photos/seed/daniel-avrahami-2/600/600', 2) ON CONFLICT (id) DO NOTHING;
INSERT INTO professional_portfolio_media (id, professional_profile_id, url, sort_order)
  VALUES ('40000000-0000-4000-8000-000200000003', '20000000-0000-4000-8000-000200000001', 'https://picsum.photos/seed/daniel-avrahami-3/600/600', 3) ON CONFLICT (id) DO NOTHING;

-- איתי לוי
INSERT INTO users (id, phone, role) VALUES ('10000000-0000-4000-8000-000300000001', '+972541110003', 'professional') ON CONFLICT (id) DO NOTHING;
INSERT INTO professional_profiles (id, user_id, primary_zone_id, category_id, display_name, bio, status, profile_photo_url, cover_photo_url, rating_avg, rating_count, eta_min_minutes, eta_max_minutes, availability_summary)
  SELECT '20000000-0000-4000-8000-000300000001', '10000000-0000-4000-8000-000300000001', z.id, c.id, 'איתי לוי', 'סטייליסט לגברים, דגש על טרנדים עכשוויים וייעוץ אישי לכל לקוח.', 'active', 'https://picsum.photos/seed/itay-levi-p/400/400', 'https://picsum.photos/seed/itay-levi-c/1200/600', 4.7, 98, 20, 35, 'זמין היום'
  FROM travel_zones z, service_categories c WHERE z.slug='tel-aviv' AND c.slug='barber'
  ON CONFLICT (id) DO NOTHING;
INSERT INTO service_areas (id, professional_profile_id, zone_id, radius_m)
  SELECT '50000000-0000-4000-8000-000300000001', '20000000-0000-4000-8000-000300000001', z.id, 7500 FROM travel_zones z WHERE z.slug='tel-aviv'
  ON CONFLICT (id) DO NOTHING;
INSERT INTO professional_services (id, professional_profile_id, category_id, name, price_minor_units, duration_minutes, sort_order)
  SELECT '30000000-0000-4000-8000-000300000001', '20000000-0000-4000-8000-000300000001', c.id, 'תספורת גבר', 8500, 30, 1 FROM service_categories c WHERE c.slug='barber'
  ON CONFLICT (id) DO NOTHING;
INSERT INTO professional_services (id, professional_profile_id, category_id, name, price_minor_units, duration_minutes, sort_order)
  SELECT '30000000-0000-4000-8000-000300000002', '20000000-0000-4000-8000-000300000001', c.id, 'תספורת + סטיילינג', 10500, 40, 2 FROM service_categories c WHERE c.slug='barber'
  ON CONFLICT (id) DO NOTHING;
INSERT INTO professional_services (id, professional_profile_id, category_id, name, price_minor_units, duration_minutes, sort_order)
  SELECT '30000000-0000-4000-8000-000300000003', '20000000-0000-4000-8000-000300000001', c.id, 'עיצוב זקן', 4500, 20, 3 FROM service_categories c WHERE c.slug='barber'
  ON CONFLICT (id) DO NOTHING;
INSERT INTO professional_services (id, professional_profile_id, category_id, name, price_minor_units, duration_minutes, sort_order)
  SELECT '30000000-0000-4000-8000-000300000004', '20000000-0000-4000-8000-000300000001', c.id, 'תספורת ילד', 6500, 25, 4 FROM service_categories c WHERE c.slug='barber'
  ON CONFLICT (id) DO NOTHING;
INSERT INTO professional_portfolio_media (id, professional_profile_id, url, sort_order)
  VALUES ('40000000-0000-4000-8000-000300000001', '20000000-0000-4000-8000-000300000001', 'https://picsum.photos/seed/itay-levi-1/600/600', 1) ON CONFLICT (id) DO NOTHING;
INSERT INTO professional_portfolio_media (id, professional_profile_id, url, sort_order)
  VALUES ('40000000-0000-4000-8000-000300000002', '20000000-0000-4000-8000-000300000001', 'https://picsum.photos/seed/itay-levi-2/600/600', 2) ON CONFLICT (id) DO NOTHING;
INSERT INTO professional_portfolio_media (id, professional_profile_id, url, sort_order)
  VALUES ('40000000-0000-4000-8000-000300000003', '20000000-0000-4000-8000-000300000001', 'https://picsum.photos/seed/itay-levi-3/600/600', 3) ON CONFLICT (id) DO NOTHING;

-- משה פרץ
INSERT INTO users (id, phone, role) VALUES ('10000000-0000-4000-8000-000400000001', '+972541110004', 'professional') ON CONFLICT (id) DO NOTHING;
INSERT INTO professional_profiles (id, user_id, primary_zone_id, category_id, display_name, bio, status, profile_photo_url, cover_photo_url, rating_avg, rating_count, eta_min_minutes, eta_max_minutes, availability_summary)
  SELECT '20000000-0000-4000-8000-000400000001', '10000000-0000-4000-8000-000400000001', z.id, c.id, 'משה פרץ', 'ספר עד הבית לכל המשפחה. שירות אדיב, מחירים הוגנים וזמינות גבוהה.', 'active', 'https://picsum.photos/seed/moshe-peretz-p/400/400', 'https://picsum.photos/seed/moshe-peretz-c/1200/600', 4.6, 312, 30, 45, 'פנוי היום בערב'
  FROM travel_zones z, service_categories c WHERE z.slug='tel-aviv' AND c.slug='barber'
  ON CONFLICT (id) DO NOTHING;
INSERT INTO service_areas (id, professional_profile_id, zone_id, radius_m)
  SELECT '50000000-0000-4000-8000-000400000001', '20000000-0000-4000-8000-000400000001', z.id, 10000 FROM travel_zones z WHERE z.slug='tel-aviv'
  ON CONFLICT (id) DO NOTHING;
INSERT INTO professional_services (id, professional_profile_id, category_id, name, price_minor_units, duration_minutes, sort_order)
  SELECT '30000000-0000-4000-8000-000400000001', '20000000-0000-4000-8000-000400000001', c.id, 'תספורת גבר', 7500, 30, 1 FROM service_categories c WHERE c.slug='barber'
  ON CONFLICT (id) DO NOTHING;
INSERT INTO professional_services (id, professional_profile_id, category_id, name, price_minor_units, duration_minutes, sort_order)
  SELECT '30000000-0000-4000-8000-000400000002', '20000000-0000-4000-8000-000400000001', c.id, 'תספורת ילד', 5500, 25, 2 FROM service_categories c WHERE c.slug='barber'
  ON CONFLICT (id) DO NOTHING;
INSERT INTO professional_services (id, professional_profile_id, category_id, name, price_minor_units, duration_minutes, sort_order)
  SELECT '30000000-0000-4000-8000-000400000003', '20000000-0000-4000-8000-000400000001', c.id, 'עיצוב זקן', 4000, 15, 3 FROM service_categories c WHERE c.slug='barber'
  ON CONFLICT (id) DO NOTHING;
INSERT INTO professional_services (id, professional_profile_id, category_id, name, price_minor_units, duration_minutes, sort_order)
  SELECT '30000000-0000-4000-8000-000400000004', '20000000-0000-4000-8000-000400000001', c.id, 'תספורת + זקן', 10000, 45, 4 FROM service_categories c WHERE c.slug='barber'
  ON CONFLICT (id) DO NOTHING;
INSERT INTO professional_portfolio_media (id, professional_profile_id, url, sort_order)
  VALUES ('40000000-0000-4000-8000-000400000001', '20000000-0000-4000-8000-000400000001', 'https://picsum.photos/seed/moshe-peretz-1/600/600', 1) ON CONFLICT (id) DO NOTHING;
INSERT INTO professional_portfolio_media (id, professional_profile_id, url, sort_order)
  VALUES ('40000000-0000-4000-8000-000400000002', '20000000-0000-4000-8000-000400000001', 'https://picsum.photos/seed/moshe-peretz-2/600/600', 2) ON CONFLICT (id) DO NOTHING;
INSERT INTO professional_portfolio_media (id, professional_profile_id, url, sort_order)
  VALUES ('40000000-0000-4000-8000-000400000003', '20000000-0000-4000-8000-000400000001', 'https://picsum.photos/seed/moshe-peretz-3/600/600', 3) ON CONFLICT (id) DO NOTHING;

-- עומר שגב
INSERT INTO users (id, phone, role) VALUES ('10000000-0000-4000-8000-000500000001', '+972541110005', 'professional') ON CONFLICT (id) DO NOTHING;
INSERT INTO professional_profiles (id, user_id, primary_zone_id, category_id, display_name, bio, status, profile_photo_url, cover_photo_url, rating_avg, rating_count, eta_min_minutes, eta_max_minutes, availability_summary)
  SELECT '20000000-0000-4000-8000-000500000001', '10000000-0000-4000-8000-000500000001', z.id, c.id, 'עומר שגב', 'בוגר בית ספר לספרות בתל אביב. מומחה לתספורות קלאסיות וגילוח מסורתי.', 'active', 'https://picsum.photos/seed/omer-segev-p/400/400', 'https://picsum.photos/seed/omer-segev-c/1200/600', 4.9, 187, 15, 25, 'זמין עכשיו'
  FROM travel_zones z, service_categories c WHERE z.slug='tel-aviv' AND c.slug='barber'
  ON CONFLICT (id) DO NOTHING;
INSERT INTO service_areas (id, professional_profile_id, zone_id, radius_m)
  SELECT '50000000-0000-4000-8000-000500000001', '20000000-0000-4000-8000-000500000001', z.id, 8500 FROM travel_zones z WHERE z.slug='tel-aviv'
  ON CONFLICT (id) DO NOTHING;
INSERT INTO professional_services (id, professional_profile_id, category_id, name, price_minor_units, duration_minutes, sort_order)
  SELECT '30000000-0000-4000-8000-000500000001', '20000000-0000-4000-8000-000500000001', c.id, 'תספורת קלאסית', 9000, 35, 1 FROM service_categories c WHERE c.slug='barber'
  ON CONFLICT (id) DO NOTHING;
INSERT INTO professional_services (id, professional_profile_id, category_id, name, price_minor_units, duration_minutes, sort_order)
  SELECT '30000000-0000-4000-8000-000500000002', '20000000-0000-4000-8000-000500000001', c.id, 'גילוח מסורתי', 6000, 30, 2 FROM service_categories c WHERE c.slug='barber'
  ON CONFLICT (id) DO NOTHING;
INSERT INTO professional_services (id, professional_profile_id, category_id, name, price_minor_units, duration_minutes, sort_order)
  SELECT '30000000-0000-4000-8000-000500000003', '20000000-0000-4000-8000-000500000001', c.id, 'תספורת + גילוח', 13000, 55, 3 FROM service_categories c WHERE c.slug='barber'
  ON CONFLICT (id) DO NOTHING;
INSERT INTO professional_services (id, professional_profile_id, category_id, name, price_minor_units, duration_minutes, sort_order)
  SELECT '30000000-0000-4000-8000-000500000004', '20000000-0000-4000-8000-000500000001', c.id, 'עיצוב זקן', 5000, 20, 4 FROM service_categories c WHERE c.slug='barber'
  ON CONFLICT (id) DO NOTHING;
INSERT INTO professional_portfolio_media (id, professional_profile_id, url, sort_order)
  VALUES ('40000000-0000-4000-8000-000500000001', '20000000-0000-4000-8000-000500000001', 'https://picsum.photos/seed/omer-segev-1/600/600', 1) ON CONFLICT (id) DO NOTHING;
INSERT INTO professional_portfolio_media (id, professional_profile_id, url, sort_order)
  VALUES ('40000000-0000-4000-8000-000500000002', '20000000-0000-4000-8000-000500000001', 'https://picsum.photos/seed/omer-segev-2/600/600', 2) ON CONFLICT (id) DO NOTHING;
INSERT INTO professional_portfolio_media (id, professional_profile_id, url, sort_order)
  VALUES ('40000000-0000-4000-8000-000500000003', '20000000-0000-4000-8000-000500000001', 'https://picsum.photos/seed/omer-segev-3/600/600', 3) ON CONFLICT (id) DO NOTHING;

