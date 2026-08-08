/** Availability / bookable slots for a professional + service (customer-facing, read-only). */
export interface SlotView {
  readonly start: string; // 'HH:mm' local (Asia/Jerusalem)
  readonly end: string;   // 'HH:mm'
}
export interface AvailabilityDay {
  readonly date: string;   // 'YYYY-MM-DD' local
  readonly weekday: number; // 0=Sunday … 6=Saturday
  readonly slots: readonly SlotView[];
}
export interface AvailabilityResponse {
  readonly professionalId: string;
  readonly serviceId: string;
  readonly durationMinutes: number;
  readonly days: readonly AvailabilityDay[];
}
