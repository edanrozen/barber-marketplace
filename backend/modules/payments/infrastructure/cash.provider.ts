import { type InitiatePaymentInput, type InitiateResult, type PaymentProvider } from '../ports/ports';

/** Cash is collected in person at the visit — nothing is charged online; the payment stays pending. */
export class CashPaymentProvider implements PaymentProvider {
  readonly method = 'cash';
  async initiate(_input: InitiatePaymentInput): Promise<InitiateResult> {
    return { status: 'pending', providerRef: null };
  }
}
