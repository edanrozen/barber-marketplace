import { type Pool } from 'pg';
import { type ProfileRecord, type ProfileRepository } from '../ports/ports';

interface Row { id: string; phone: string; role: string; display_name: string | null; }

export class PgProfileRepository implements ProfileRepository {
  constructor(private readonly pool: Pool) {}
  async getProfile(userId: string): Promise<ProfileRecord | null> {
    const r = await this.pool.query(
      'SELECT u.id, u.phone, u.role, cp.display_name FROM users u LEFT JOIN customer_profiles cp ON cp.user_id = u.id WHERE u.id=$1',
      [userId],
    );
    const row = r.rows[0] as Row | undefined;
    return row ? { id: row.id, phone: row.phone, role: row.role, displayName: row.display_name } : null;
  }
  async updateDisplayName(userId: string, displayName: string): Promise<void> {
    await this.pool.query('UPDATE customer_profiles SET display_name=$2, updated_at=now() WHERE user_id=$1', [userId, displayName]);
  }
}
