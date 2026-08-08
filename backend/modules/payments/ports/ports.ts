import { type PaymentView } from '@barber-marketplace/api-contracts';

export interface InitiatePaymentInput {
  readonly bookingId: string; readonly customerUserId: string;
  readonly amountMinorUnits: number; readonly currency: string; readonly method: string;
}
export interface InitiateResult { readonly status: string; readonly providerRef: string | null; }

/** Seam for future processors: card / Bit implement this same port and register under PAYMENT_PROVIDERS. */
export interface PaymentProvider {
  readonly method: string;
  initiate(input: InitiatePaymentInput): Promise<InitiateResult>;
}
export const PAYMENT_PROVIDERS = Symbol('PAYMENT_PROVIDERS');

export interface PaymentRecord extends InitiatePaymentInput { readonly status: string; readonly providerRef: string | null; }
export interface PaymentRepository {
  create(input: PaymentRecord): Promise<{ id: string }>;
  listByCustomer(customerUserId: string): Promise<readonly PaymentView[]>;
}
export const PAYMENT_REPOSITORY = Symbol('PAYMENT_REPOSITORY');
