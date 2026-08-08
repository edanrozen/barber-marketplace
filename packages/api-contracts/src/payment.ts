/** Payment API contracts (cash-first; card/bit reserved for future processors). */
export type PaymentMethod = 'cash' | 'card' | 'bit';
export interface PaymentView {
  readonly id: string;
  readonly bookingId: string;
  readonly amountMinorUnits: number;
  readonly currency: string;
  readonly method: PaymentMethod;
  readonly status: string; // pending | paid | refunded | cancelled
}
