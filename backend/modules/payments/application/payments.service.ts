import { Inject, Injectable } from '@nestjs/common';
import { type PaymentMethod, type PaymentView } from '@barber-marketplace/api-contracts';
import { ProviderError, ValidationError } from '@barber-marketplace/errors';
import { isSupportedMethod } from '../domain/payments';
import { PAYMENT_PROVIDERS, PAYMENT_REPOSITORY, type InitiatePaymentInput, type PaymentProvider, type PaymentRepository } from '../ports/ports';

@Injectable()
export class PaymentsService {
  private readonly providers: Map<string, PaymentProvider>;
  constructor(
    @Inject(PAYMENT_REPOSITORY) private readonly repo: PaymentRepository,
    @Inject(PAYMENT_PROVIDERS) providers: readonly PaymentProvider[],
  ) {
    this.providers = new Map(providers.map((p) => [p.method, p]));
  }

  async initiateForBooking(input: InitiatePaymentInput): Promise<PaymentView> {
    if (!isSupportedMethod(input.method)) throw new ValidationError('unsupported_payment_method', 'אמצעי התשלום אינו נתמך עדיין.');
    const provider = this.providers.get(input.method);
    if (provider === undefined) throw new ProviderError('payment_provider_missing', 'שירות התשלום אינו זמין כרגע.');
    const result = await provider.initiate(input);
    const created = await this.repo.create({ ...input, status: result.status, providerRef: result.providerRef });
    return {
      id: created.id, bookingId: input.bookingId, amountMinorUnits: input.amountMinorUnits,
      currency: input.currency, method: input.method as PaymentMethod, status: result.status,
    };
  }

  listForCustomer(customerUserId: string): Promise<readonly PaymentView[]> {
    return this.repo.listByCustomer(customerUserId);
  }
}
