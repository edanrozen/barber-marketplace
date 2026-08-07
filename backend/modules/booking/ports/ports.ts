import { type BookingView } from '@barber-marketplace/api-contracts';

export interface CreateBookingInput {
  readonly customerUserId: string; readonly professionalId: string; readonly serviceId: string;
  readonly date: string; readonly startMinute: number; readonly endMinute: number;
  readonly durationMinutes: number; readonly priceMinorUnits: number; readonly currency: string;
}
export interface ServiceSnapshot { readonly professionalName: string; readonly serviceName: string; readonly durationMinutes: number; readonly priceMinorUnits: number; readonly currency: string; }
export type CreateResult = { readonly ok: true; readonly id: string } | { readonly ok: false; readonly reason: 'slot_taken' };

export interface BookingRepository {
  getServiceSnapshot(professionalId: string, serviceId: string): Promise<ServiceSnapshot | null>;
  create(input: CreateBookingInput): Promise<CreateResult>;
  listByCustomer(customerUserId: string): Promise<readonly BookingView[]>;
  getOwned(customerUserId: string, bookingId: string): Promise<{ id: string; status: string } | null>;
  cancel(bookingId: string): Promise<void>;
}
export const BOOKING_REPOSITORY = Symbol('BOOKING_REPOSITORY');
