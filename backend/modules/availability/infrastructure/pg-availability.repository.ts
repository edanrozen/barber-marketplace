import { type Pool } from 'pg';
import { type AvailabilityRepository, type WorkingHourRow } from '../ports/ports';

interface HourRow { weekday: number; start_minute: number; end_minute: number; }

export class PgAvailabilityRepository implements AvailabilityRepository {
  constructor(private readonly pool: Pool) {}

  async getServiceDuration(professionalProfileId: string, serviceId: string): Promise<number | null> {
    const r = await this.pool.query(
      'SELECT duration_minutes FROM professional_services WHERE id = $1 AND professional_profile_id = $2 AND is_active',
      [serviceId, professionalProfileId],
    );
    const row = r.rows[0] as { duration_minutes: number } | undefined;
    return row ? row.duration_minutes : null;
  }

  async getWorkingHours(professionalProfileId: string): Promise<readonly WorkingHourRow[]> {
    const r = await this.pool.query(
      'SELECT weekday, start_minute, end_minute FROM professional_working_hours WHERE professional_profile_id = $1',
      [professionalProfileId],
    );
    return (r.rows as HourRow[]).map((x) => ({ weekday: x.weekday, startMinutes: x.start_minute, endMinutes: x.end_minute }));
  }
}
