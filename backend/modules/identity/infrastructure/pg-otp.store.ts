import { type Pool } from 'pg';
import { type OtpChallengeRow, type OtpStore } from '../ports/ports';

interface Row { id: string; phone: string; code_hash: string; attempts: number; max_attempts: number; expires_at: Date; consumed_at: Date | null; last_sent_at: Date; }
const toEpoch = (d: Date): number => Math.floor(d.getTime() / 1000);
const map = (r: Row): OtpChallengeRow => ({
  id: r.id, phone: r.phone, codeHash: r.code_hash, attempts: r.attempts, maxAttempts: r.max_attempts,
  expiresAt: toEpoch(r.expires_at), consumedAt: r.consumed_at ? toEpoch(r.consumed_at) : null, lastSentAt: toEpoch(r.last_sent_at),
});

export class PgOtpStore implements OtpStore {
  constructor(private readonly pool: Pool) {}
  async create(input: { phone: string; codeHash: string; expiresAt: number; maxAttempts: number }): Promise<{ id: string }> {
    const r = await this.pool.query(
      'INSERT INTO otp_challenges (phone, code_hash, expires_at, max_attempts) VALUES ($1,$2,$3,$4) RETURNING id',
      [input.phone, input.codeHash, new Date(input.expiresAt * 1000), input.maxAttempts],
    );
    return { id: (r.rows[0] as { id: string }).id };
  }
  async findById(id: string): Promise<OtpChallengeRow | null> {
    const r = await this.pool.query('SELECT * FROM otp_challenges WHERE id=$1', [id]);
    const row = r.rows[0] as Row | undefined;
    return row ? map(row) : null;
  }
  async incrementAttempts(id: string): Promise<void> {
    await this.pool.query('UPDATE otp_challenges SET attempts = attempts + 1 WHERE id=$1', [id]);
  }
  async markConsumed(id: string, at: number): Promise<void> {
    await this.pool.query('UPDATE otp_challenges SET consumed_at=$2 WHERE id=$1', [id, new Date(at * 1000)]);
  }
  async findLatestByPhone(phone: string): Promise<OtpChallengeRow | null> {
    const r = await this.pool.query('SELECT * FROM otp_challenges WHERE phone=$1 ORDER BY created_at DESC LIMIT 1', [phone]);
    const row = r.rows[0] as Row | undefined;
    return row ? map(row) : null;
  }
}
