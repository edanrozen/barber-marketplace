import { type Pool } from 'pg';
import { type UserRecord, type UserRepository } from '../ports/ports';

interface Row { id: string; phone: string; role: string; }

export class PgUserRepository implements UserRepository {
  constructor(private readonly pool: Pool) {}
  async findByPhoneAndRole(phone: string, role: string): Promise<UserRecord | null> {
    const r = await this.pool.query('SELECT id, phone, role FROM users WHERE phone=$1 AND role=$2 LIMIT 1', [phone, role]);
    const row = r.rows[0] as Row | undefined;
    return row ? { id: row.id, phone: row.phone, role: row.role } : null;
  }
  async createCustomer(phone: string): Promise<UserRecord> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const u = await client.query("INSERT INTO users (phone, role) VALUES ($1, 'customer') RETURNING id, phone, role", [phone]);
      const row = u.rows[0] as Row;
      await client.query('INSERT INTO customer_profiles (user_id) VALUES ($1)', [row.id]);
      await client.query('COMMIT');
      return { id: row.id, phone: row.phone, role: row.role };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
  async findById(id: string): Promise<UserRecord | null> {
    const r = await this.pool.query('SELECT id, phone, role FROM users WHERE id=$1', [id]);
    const row = r.rows[0] as Row | undefined;
    return row ? { id: row.id, phone: row.phone, role: row.role } : null;
  }
}
