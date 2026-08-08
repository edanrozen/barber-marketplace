import { Module } from '@nestjs/common';
import { type Pool } from 'pg';
import { IdentityModule, PG_POOL } from '../identity';
import { AvailabilityModule } from '../availability';
import { NotificationsModule } from '../notifications';
import { PaymentsModule } from '../payments';
import { BookingService } from './application/booking.service';
import { BookingController } from './http/booking.controller';
import { BOOKING_REPOSITORY } from './ports/ports';
import { PgBookingRepository } from './infrastructure/pg-booking.repository';

/** Scheduled booking engine (create/list/cancel). Slot integrity enforced by a DB unique index. */
@Module({
  imports: [IdentityModule, AvailabilityModule, NotificationsModule, PaymentsModule],
  controllers: [BookingController],
  providers: [
    BookingService,
    { provide: BOOKING_REPOSITORY, useFactory: (pool: Pool) => new PgBookingRepository(pool), inject: [PG_POOL] },
  ],
})
export class BookingModule {}
