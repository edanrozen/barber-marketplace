import type { BookingView, CreateBookingBody } from '@barber-marketplace/api-contracts';
import { apiRequest } from './client';

export const createBooking = (body: CreateBookingBody): Promise<BookingView> =>
  apiRequest<BookingView>('bookings', { method: 'POST', auth: true, body });

export const listMyBookings = (): Promise<BookingView[]> =>
  apiRequest<BookingView[]>('bookings', { method: 'GET', auth: true });

export const cancelBooking = (id: string): Promise<{ ok: true }> =>
  apiRequest<{ ok: true }>(`bookings/${id}/cancel`, { method: 'POST', auth: true });
