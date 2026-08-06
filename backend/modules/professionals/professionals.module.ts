import { Module } from '@nestjs/common';
import { type Pool } from 'pg';
import { IdentityModule, PG_POOL } from '../identity';
import { ProfessionalsService } from './application/professionals.service';
import { ProfessionalsController } from './http/professionals.controller';
import { PROFESSIONAL_REPOSITORY } from './ports/ports';
import { PgProfessionalRepository } from './infrastructure/pg-professional.repository';

/** Professional catalog (customer-facing, read-only). Supply is operational seed data for the MVP. */
@Module({
  imports: [IdentityModule],
  controllers: [ProfessionalsController],
  providers: [
    ProfessionalsService,
    { provide: PROFESSIONAL_REPOSITORY, useFactory: (pool: Pool) => new PgProfessionalRepository(pool), inject: [PG_POOL] },
  ],
})
export class ProfessionalsModule {}
