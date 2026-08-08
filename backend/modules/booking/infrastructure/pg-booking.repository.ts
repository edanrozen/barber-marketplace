import { type Pool } from 'pg';
import { type BookingView } from '@barber-marketplace/api-contracts';
import { minutesToHHmm } from '../../availability/domain/slots';
import { type BookingRepository, type CreateBookingInput, type CreateResult, type ServiceSnapshot } from '../ports/ports';

interface ListRow {
  id: string; professional_profile_id: string; professional_name: string; service_name: string;
  date: string; start_minute: number; end_minute: number; duration_minutes: number;
  price_minor_units: number; currency: string; status: string;
}

export class PgBookingRepository implements BookingRepository {
  constructor(private readonly pool: Pool) {}

  async getServiceSnapshot(professionalId: string, serviceId: string): Promise<ServiceSnapshot | null> {
    const r = await this.pool.query(
      `SELECT s.name AS service_name, s.duration_minutes, s.price_minor_units, s.currency, p.display_name AS professional_name
       FROM professional_services s JOIN professional_profiles p ON p.id = s.professional_profile_id
       WHERE s.id = $1 AND s.professional_profile_id = $2 AND s.is_active`,
      [serviceId, professionalId],
    );
    const row = r.rows[0] as { service_name: string; duration_minutes: number; price_minor_units: number; currency: string; professional_name: string } | undefined;
    return row ? { professionalName: row.professional_name, serviceName: row.service_name, durationMinutes: row.duration_minutes, priceMinorUnits: row.price_minor_units, currency: row.currency } : null;
  }

  async create(input: CreateBookingInput): Promise<CreateResult> {
    try {
      const r = await this.pool.query(
        `INSERT INTO bookings (customer_user_id, professional_profile_id, service_id, scheduled_date, start_minute, end_minute, duration_minutes, price_minor_units, currency, status)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'confirmed') RETURNING id`,
        [input.customerUserId, input.professionalId, input.serviceId, input.date, input.startMinute, input.endMinute, input.durationMinutes, input.priceMinorUnits, input.currency],
      );
      return { ok: true, id: (r.rows[0] as { id: string }).id };
    } catch (e) {
      if (typeof e === 'object' && e !== null && (e as { code?: string }).code === '23505') return { ok: false, reason: 'slot_taken' };
      throw e;
    }
  }

  async listByCustomer(customerUserId: string): Promise<readonly BookingView[]> {
    const r = await this.pool.query(
      `SELECT b.id, b.professional_profile_id, p.display_name AS professional_name, s.name AS service_name,
              to_char(b.scheduled_date, 'YYYY-MM-DD') AS date, b.start_minute, b.end_minute, b.duration_minutes,
              b.price_minor_units, b.currency, b.status
       FROM bookings b
       JOIN professional_profiles p ON p.id = b.professional_profile_id
       JOIN professional_services s ON s.id = b.service_id
       WHERE b.customer_user_id = $1
       ORDER BY b.scheduled_date DESC, b.start_minute DESC`,
      [customerUserId],
    );
    return (r.rows as ListRow[]).map((row) => ({
      id: row.id, professionalId: row.professional_profile_id, professionalName: row.professional_name, serviceName: row.service_name,
      date: row.date, start: minutesToHHmm(row.start_minute), end: minutesToHHmm(row.end_minute),
      durationMinutes: row.duration_minutes, priceMinorUnits: row.price_minor_units, currency: row.currency, status: row.status,
    }));
  }

  async getOwned(customerUserId: string, bookingId: string): Promise<import('../ports/ports').OwnedBooking | null> {
    const r = await this.pool.query(
      `SELECT b.id, b.status, p.display_name AS professional_name, s.name AS service_name,
              to_char(b.scheduled_date, 'YYYY-MM-DD') AS date, b.start_minute
       FROM bookings b
       JOIN professional_profiles p ON p.id = b.professional_profile_id
       JOIN professional_services s ON s.id = b.service_id
       WHERE b.id = $1 AND b.customer_user_id = $2`,
      [bookingId, customerUserId],
    );
    const row = r.rows[0] as { id: string; status: string; professional_name: string; service_name: string; date: string; start_minute: number } | undefined;
    return row ? { id: row.id, status: row.status, professionalName: row.professional_name, serviceName: row.service_name, date: row.date, start: minutesToHHmm(row.start_minute) } : null;
  }

  async cancel(bookingId: string): Promise<void> {
    await this.pool.query("UPDATE bookings SET status = 'cancelled', cancelled_at = now(), updated_at = now() WHERE id = $1", [bookingId]);
  }
}
