import { Module } from '@nestjs/common';
import { type Pool } from 'pg';
import { IdentityModule, PG_POOL } from '../identity';
import { PaymentsService } from './application/payments.service';
import { PaymentsController } from './http/payments.controller';
import { PAYMENT_PROVIDERS, PAYMENT_REPOSITORY } from './ports/ports';
import { PgPaymentRepository } from './infrastructure/pg-payment.repository';
import { CashPaymentProvider } from './infrastructure/cash.provider';

/** Payments — cash-first. Register CardPaymentProvider / BitPaymentProvider under PAYMENT_PROVIDERS to extend. */
@Module({
  imports: [IdentityModule],
  controllers: [PaymentsController],
  providers: [
    PaymentsService,
    { provide: PAYMENT_PROVIDERS, useFactory: () => [new CashPaymentProvider()] },
    { provide: PAYMENT_REPOSITORY, useFactory: (pool: Pool) => new PgPaymentRepository(pool), inject: [PG_POOL] },
  ],
  exports: [PaymentsService],
})
export class PaymentsModule {}
