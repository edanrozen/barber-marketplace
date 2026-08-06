import { type Pool } from 'pg';
import {
  type Page, type PageRequest, type PortfolioItemView, type ProfessionalDetail,
  type ProfessionalServiceView, type ProfessionalSummary,
} from '@barber-marketplace/api-contracts';
import { buildPage } from '../../../common/pagination/pagination';
import { priceFromMinorUnits } from '../domain/pricing';
import { type ProfessionalRepository } from '../ports/ports';

interface SummaryRow {
  id: string; display_name: string; profile_photo_url: string | null; rating_avg: string; rating_count: number;
  eta_min_minutes: number | null; eta_max_minutes: number | null; availability_summary: string | null;
  zone_name: string; active_prices: number[];
}
interface DetailRow {
  id: string; display_name: string; bio: string | null; profile_photo_url: string | null; cover_photo_url: string | null;
  rating_avg: string; rating_count: number; availability_summary: string | null; eta_min_minutes: number | null;
  eta_max_minutes: number | null; zone_name: string; radius_m: number | null;
}
interface ServiceRow { id: string; name: string; description: string | null; price_minor_units: number; currency: string; duration_minutes: number; }
interface PortfolioRow { id: string; url: string; caption: string | null; }

export class PgProfessionalRepository implements ProfessionalRepository {
  constructor(private readonly pool: Pool) {}

  async listSummaries(page: PageRequest): Promise<Page<ProfessionalSummary>> {
    const cursor = page.cursor ?? null;
    const r = await this.pool.query(
      `SELECT p.id, p.display_name, p.profile_photo_url, p.rating_avg, p.rating_count,
              p.eta_min_minutes, p.eta_max_minutes, p.availability_summary, z.name AS zone_name,
              COALESCE(array_agg(s.price_minor_units) FILTER (WHERE s.is_active), ARRAY[]::int[]) AS active_prices
       FROM professional_profiles p
       JOIN travel_zones z ON z.id = p.primary_zone_id
       LEFT JOIN professional_services s ON s.professional_profile_id = p.id
       WHERE p.status = 'active' AND ($1::uuid IS NULL OR p.id > $1::uuid)
       GROUP BY p.id, z.name
       ORDER BY p.id
       LIMIT $2`,
      [cursor, page.limit],
    );
    const rows = r.rows as SummaryRow[];
    const items: ProfessionalSummary[] = rows.map((row) => ({
      id: row.id,
      displayName: row.display_name,
      profilePhotoUrl: row.profile_photo_url,
      ratingAvg: Number(row.rating_avg),
      ratingCount: row.rating_count,
      priceFromMinorUnits: priceFromMinorUnits(row.active_prices.map((p) => ({ priceMinorUnits: p, isActive: true }))),
      currency: 'ILS',
      zoneName: row.zone_name,
      etaMinMinutes: row.eta_min_minutes,
      etaMaxMinutes: row.eta_max_minutes,
      availabilitySummary: row.availability_summary,
    }));
    const last = items[items.length - 1];
    const nextCursor = items.length === page.limit && last !== undefined ? last.id : null;
    return buildPage(items, nextCursor);
  }

  async getDetail(id: string): Promise<ProfessionalDetail | null> {
    const head = await this.pool.query(
      `SELECT p.id, p.display_name, p.bio, p.profile_photo_url, p.cover_photo_url, p.rating_avg, p.rating_count,
              p.availability_summary, p.eta_min_minutes, p.eta_max_minutes, z.name AS zone_name, sa.radius_m
       FROM professional_profiles p
       JOIN travel_zones z ON z.id = p.primary_zone_id
       LEFT JOIN service_areas sa ON sa.professional_profile_id = p.id AND sa.zone_id = p.primary_zone_id
       WHERE p.id = $1 AND p.status = 'active'`,
      [id],
    );
    const row = head.rows[0] as DetailRow | undefined;
    if (row === undefined) return null;

    const sv = await this.pool.query(
      `SELECT id, name, description, price_minor_units, currency, duration_minutes
       FROM professional_services WHERE professional_profile_id = $1 AND is_active ORDER BY sort_order`,
      [id],
    );
    const pf = await this.pool.query(
      `SELECT id, url, caption FROM professional_portfolio_media WHERE professional_profile_id = $1 ORDER BY sort_order`,
      [id],
    );

    const services: ProfessionalServiceView[] = (sv.rows as ServiceRow[]).map((s) => ({
      id: s.id, name: s.name, description: s.description, priceMinorUnits: s.price_minor_units, currency: s.currency, durationMinutes: s.duration_minutes,
    }));
    const portfolio: PortfolioItemView[] = (pf.rows as PortfolioRow[]).map((m) => ({ id: m.id, url: m.url, caption: m.caption }));

    return {
      id: row.id,
      displayName: row.display_name,
      bio: row.bio,
      profilePhotoUrl: row.profile_photo_url,
      coverPhotoUrl: row.cover_photo_url,
      ratingAvg: Number(row.rating_avg),
      ratingCount: row.rating_count,
      availabilitySummary: row.availability_summary,
      travelArea: {
        zoneName: row.zone_name,
        radiusMeters: row.radius_m ?? 0,
        etaMinMinutes: row.eta_min_minutes,
        etaMaxMinutes: row.eta_max_minutes,
      },
      services,
      portfolio,
    };
  }
}
