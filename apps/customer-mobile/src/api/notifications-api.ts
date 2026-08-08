import type { NotificationView } from '@barber-marketplace/api-contracts';
import { apiRequest } from './client';

export const listNotifications = (): Promise<NotificationView[]> =>
  apiRequest<NotificationView[]>('notifications', { method: 'GET', auth: true });

export const markNotificationRead = (id: string): Promise<{ ok: true }> =>
  apiRequest<{ ok: true }>(`notifications/${id}/read`, { method: 'POST', auth: true });
