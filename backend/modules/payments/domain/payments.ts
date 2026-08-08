/** Pure payment policy (unit-tested). Cash is supported now; card/bit are reserved and plug in later. */
export const PAYMENT_METHODS = ['cash', 'card', 'bit'] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

/** Only cash is enabled for the MVP; adding card/bit = register a provider + widen this set. */
export const SUPPORTED_METHODS: ReadonlySet<PaymentMethod> = new Set<PaymentMethod>(['cash']);
export const isSupportedMethod = (method: string): method is PaymentMethod =>
  (SUPPORTED_METHODS as ReadonlySet<string>).has(method);

/** Initial status when a payment is initiated. Cash is collected in person → pending until paid. */
export const initialStatus = (_method: PaymentMethod): 'pending' => 'pending';

const TRANSITIONS: Record<string, ReadonlySet<string>> = {
  pending: new Set(['paid', 'cancelled']),
  paid: new Set(['refunded']),
  refunded: new Set<string>(),
  cancelled: new Set<string>(),
};
export const canTransition = (from: string, to: string): boolean => TRANSITIONS[from]?.has(to) ?? false;
