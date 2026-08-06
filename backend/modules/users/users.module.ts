import { Module } from '@nestjs/common';
import { type Pool } from 'pg';
import { IdentityModule, PG_POOL } from '../identity';
import { ProfileService } from './application/profile.service';
import { ProfileController } from './http/profile.controller';
import { PROFILE_REPOSITORY } from './ports/ports';
import { PgProfileRepository } from './infrastructure/pg-profile.repository';

/** User/account management — profile read & update (reuses identity's pool + JWT guard). */
@Module({
  imports: [IdentityModule],
  controllers: [ProfileController],
  providers: [
    ProfileService,
    { provide: PROFILE_REPOSITORY, useFactory: (pool: Pool) => new PgProfileRepository(pool), inject: [PG_POOL] },
  ],
})
export class UsersModule {}
