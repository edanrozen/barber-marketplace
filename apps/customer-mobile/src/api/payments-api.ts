import type { PaymentView } from '@barber-marketplace/api-contracts';
import { apiRequest } from './client';

export const listPayments = (): Promise<PaymentView[]> =>
  apiRequest<PaymentView[]>('payments', { method: 'GET', auth: true });
