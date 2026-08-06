import { type Pool } from 'pg';
import { type RefreshRow, type RefreshTokenStore } from '../ports/ports';

interface Row { id: string; user_id: string; family_id: string; token_hash: string; used_at: Date | null; revoked_at: Date | null; expires_at: Date; }
const toEpoch = (d: Date): number => Math.floor(d.getTime() / 1000);
const map = (r: Row): RefreshRow => ({
  id: r.id, userId: r.user_id, familyId: r.family_id, tokenHash: r.token_hash,
  usedAt: r.used_at ? toEpoch(r.used_at) : null, revokedAt: r.revoked_at ? toEpoch(r.revoked_at) : null, expiresAt: toEpoch(r.expires_at),
});

export class PgRefreshTokenStore implements RefreshTokenStore {
  constructor(private readonly pool: Pool) {}
  async issue(input: { userId: string; familyId: string; tokenHash: string; expiresAt: number; deviceLabel?: string }): Promise<{ id: string }> {
    const r = await this.pool.query(
      'INSERT INTO refresh_tokens (user_id, family_id, token_hash, expires_at, device_label) VALUES ($1,$2,$3,$4,$5) RETURNING id',
      [input.userId, input.familyId, input.tokenHash, new Date(input.expiresAt * 1000), input.deviceLabel ?? null],
    );
    return { id: (r.rows[0] as { id: string }).id };
  }
  async findByHash(tokenHash: string): Promise<RefreshRow | null> {
    const r = await this.pool.query('SELECT * FROM refresh_tokens WHERE token_hash=$1', [tokenHash]);
    const row = r.rows[0] as Row | undefined;
    return row ? map(row) : null;
  }
  async markUsed(id: string, rotatedToId: string, at: number): Promise<void> {
    await this.pool.query('UPDATE refresh_tokens SET used_at=$2, rotated_to=$3 WHERE id=$1', [id, new Date(at * 1000), rotatedToId]);
  }
  async revokeByHash(tokenHash: string, at: number): Promise<void> {
    await this.pool.query('UPDATE refresh_tokens SET revoked_at=$2 WHERE token_hash=$1 AND revoked_at IS NULL', [tokenHash, new Date(at * 1000)]);
  }
  async revokeFamily(familyId: string, at: number): Promise<void> {
    await this.pool.query('UPDATE refresh_tokens SET revoked_at=$2 WHERE family_id=$1 AND revoked_at IS NULL', [familyId, new Date(at * 1000)]);
  }
}
