import { type NotificationView } from '@barber-marketplace/api-contracts';

export interface CreateNotificationInput { userId: string; type: string; title: string; body: string; }
export interface NotificationRepository {
  create(input: CreateNotificationInput): Promise<void>;
  listByUser(userId: string): Promise<readonly NotificationView[]>;
  markRead(userId: string, id: string): Promise<void>;
}
export const NOTIFICATION_REPOSITORY = Symbol('NOTIFICATION_REPOSITORY');
