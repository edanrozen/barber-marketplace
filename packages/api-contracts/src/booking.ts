/** Booking API contracts (customer-facing). */
export interface CreateBookingBody {
  readonly professionalId: string;
  readonly serviceId: string;
  readonly date: string;  // 'YYYY-MM-DD' local
  readonly start: string; // 'HH:mm' local
}
export interface BookingView {
  readonly id: string;
  readonly professionalId: string;
  readonly professionalName: string;
  readonly serviceName: string;
  readonly date: string;
  readonly start: string;
  readonly end: string;
  readonly durationMinutes: number;
  readonly priceMinorUnits: number;
  readonly currency: string;
  readonly status: string;
}
