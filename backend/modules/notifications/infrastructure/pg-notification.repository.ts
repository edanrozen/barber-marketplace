import { type Pool } from 'pg';
import { type NotificationView } from '@barber-marketplace/api-contracts';
import { type CreateNotificationInput, type NotificationRepository } from '../ports/ports';

interface Row { id: string; type: string; title: string; body: string; read: boolean; created_at: Date; }

export class PgNotificationRepository implements NotificationRepository {
  constructor(private readonly pool: Pool) {}

  async create(input: CreateNotificationInput): Promise<void> {
    await this.pool.query('INSERT INTO notifications (user_id, type, title, body) VALUES ($1,$2,$3,$4)', [input.userId, input.type, input.title, input.body]);
  }

  async listByUser(userId: string): Promise<readonly NotificationView[]> {
    const r = await this.pool.query(
      'SELECT id, type, title, body, (read_at IS NOT NULL) AS read, created_at FROM notifications WHERE user_id = $1 ORDER BY created_at DESC',
      [userId],
    );
    return (r.rows as Row[]).map((row) => ({
      id: row.id, type: row.type, title: row.title, body: row.body, read: row.read, createdAt: row.created_at.toISOString(),
    }));
  }

  async markRead(userId: string, id: string): Promise<void> {
    await this.pool.query('UPDATE notifications SET read_at = now() WHERE id = $1 AND user_id = $2 AND read_at IS NULL', [id, userId]);
  }
}
