import { Module } from '@nestjs/common';
import { type Pool } from 'pg';
import { IdentityModule, PG_POOL } from '../identity';
import { AvailabilityService } from './application/availability.service';
import { AvailabilityController } from './http/availability.controller';
import { AVAILABILITY_REPOSITORY } from './ports/ports';
import { PgAvailabilityRepository } from './infrastructure/pg-availability.repository';

/** Availability — computes bookable slots from working hours (read-only; booking is a later epic). */
@Module({
  imports: [IdentityModule],
  controllers: [AvailabilityController],
  providers: [
    AvailabilityService,
    { provide: AVAILABILITY_REPOSITORY, useFactory: (pool: Pool) => new PgAvailabilityRepository(pool), inject: [PG_POOL] },
  ],
})
export class AvailabilityModule {}
