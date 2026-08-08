import { type Pool } from 'pg';
import { type PaymentMethod, type PaymentView } from '@barber-marketplace/api-contracts';
import { type PaymentRecord, type PaymentRepository } from '../ports/ports';

interface Row { id: string; booking_id: string; amount_minor_units: number; currency: string; method: string; status: string; }

export class PgPaymentRepository implements PaymentRepository {
  constructor(private readonly pool: Pool) {}

  async create(input: PaymentRecord): Promise<{ id: string }> {
    const r = await this.pool.query(
      'INSERT INTO payments (booking_id, customer_user_id, amount_minor_units, currency, method, status, provider_ref) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id',
      [input.bookingId, input.customerUserId, input.amountMinorUnits, input.currency, input.method, input.status, input.providerRef],
    );
    return { id: (r.rows[0] as { id: string }).id };
  }

  async listByCustomer(customerUserId: string): Promise<readonly PaymentView[]> {
    const r = await this.pool.query(
      'SELECT id, booking_id, amount_minor_units, currency, method, status FROM payments WHERE customer_user_id = $1 ORDER BY created_at DESC',
      [customerUserId],
    );
    return (r.rows as Row[]).map((row) => ({
      id: row.id, bookingId: row.booking_id, amountMinorUnits: row.amount_minor_units,
      currency: row.currency, method: row.method as PaymentMethod, status: row.status,
    }));
  }
}
