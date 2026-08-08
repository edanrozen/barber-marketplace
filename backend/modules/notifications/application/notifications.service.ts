import { Inject, Injectable } from '@nestjs/common';
import { type NotificationView } from '@barber-marketplace/api-contracts';
import { bookingCancelled, bookingConfirmed, type BookingNotificationData } from '../domain/templates';
import { NOTIFICATION_REPOSITORY, type NotificationRepository } from '../ports/ports';

@Injectable()
export class NotificationsService {
  constructor(@Inject(NOTIFICATION_REPOSITORY) private readonly repo: NotificationRepository) {}

  async notifyBookingConfirmed(userId: string, data: BookingNotificationData): Promise<void> {
    await this.repo.create({ userId, ...bookingConfirmed(data) });
  }
  async notifyBookingCancelled(userId: string, data: BookingNotificationData): Promise<void> {
    await this.repo.create({ userId, ...bookingCancelled(data) });
  }
  list(userId: string): Promise<readonly NotificationView[]> {
    return this.repo.listByUser(userId);
  }
  markRead(userId: string, id: string): Promise<void> {
    return this.repo.markRead(userId, id);
  }
}
