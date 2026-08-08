import { Module } from '@nestjs/common';
import { type Pool } from 'pg';
import { IdentityModule, PG_POOL } from '../identity';
import { NotificationsService } from './application/notifications.service';
import { NotificationsController } from './http/notifications.controller';
import { NOTIFICATION_REPOSITORY } from './ports/ports';
import { PgNotificationRepository } from './infrastructure/pg-notification.repository';

/** In-app notifications feed. Written by domain events (e.g. booking confirmed/cancelled). */
@Module({
  imports: [IdentityModule],
  controllers: [NotificationsController],
  providers: [
    NotificationsService,
    { provide: NOTIFICATION_REPOSITORY, useFactory: (pool: Pool) => new PgNotificationRepository(pool), inject: [PG_POOL] },
  ],
  exports: [NotificationsService],
})
export class NotificationsModule {}
