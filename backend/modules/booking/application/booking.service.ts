import { Inject, Injectable } from '@nestjs/common';
import { type BookingView, type CreateBookingBody } from '@barber-marketplace/api-contracts';
import { ConflictError, NotFoundError, ValidationError } from '@barber-marketplace/errors';
import { AvailabilityService } from '../../availability/application/availability.service';
import { hhmmToMinutes, minutesToHHmm } from '../../availability/domain/slots';
import { canCancel } from '../domain/booking';
import { BOOKING_REPOSITORY, type BookingRepository } from '../ports/ports';
import { NotificationsService } from '../../notifications';
import { PaymentsService } from '../../payments';

@Injectable()
export class BookingService {
  constructor(
    @Inject(BOOKING_REPOSITORY) private readonly repo: BookingRepository,
    private readonly availability: AvailabilityService,
    private readonly notifications: NotificationsService,
    private readonly payments: PaymentsService,
  ) {}

  async createBooking(customerUserId: string, body: CreateBookingBody): Promise<BookingView> {
    const startMin = hhmmToMinutes(body.start);
    if (startMin === null || body.date.length === 0) throw new ValidationError('invalid_slot', 'המועד שנבחר אינו תקין.');

    const check = await this.availability.isSlotAvailable(body.professionalId, body.serviceId, body.date, body.start);
    if (!check.ok) throw new ConflictError('slot_unavailable', 'המועד שנבחר אינו פנוי יותר.');

    const snapshot = await this.repo.getServiceSnapshot(body.professionalId, body.serviceId);
    if (snapshot === null) throw new NotFoundError('service_not_found', 'השירות לא נמצא.');

    const endMin = startMin + check.durationMinutes;
    const created = await this.repo.create({
      customerUserId, professionalId: body.professionalId, serviceId: body.serviceId, date: body.date,
      startMinute: startMin, endMinute: endMin, durationMinutes: check.durationMinutes,
      priceMinorUnits: snapshot.priceMinorUnits, currency: snapshot.currency,
    });
    if (!created.ok) throw new ConflictError('slot_taken', 'המועד נתפס ברגע זה. אנא בחרו מועד אחר.');

    try {
      await this.notifications.notifyBookingConfirmed(customerUserId, {
        professionalName: snapshot.professionalName, serviceName: snapshot.serviceName, date: body.date, start: body.start,
      });
    } catch { /* notifications are best-effort */ }

    try {
      await this.payments.initiateForBooking({
        bookingId: created.id, customerUserId, amountMinorUnits: snapshot.priceMinorUnits, currency: snapshot.currency, method: 'cash',
      });
    } catch { /* best-effort; a transactional outbox links booking+payment in the real env */ }

    return {
      id: created.id, professionalId: body.professionalId, professionalName: snapshot.professionalName,
      serviceName: snapshot.serviceName, date: body.date, start: body.start, end: minutesToHHmm(endMin),
      durationMinutes: check.durationMinutes, priceMinorUnits: snapshot.priceMinorUnits, currency: snapshot.currency, status: 'confirmed',
    };
  }

  listMyBookings(customerUserId: string): Promise<readonly BookingView[]> {
    return this.repo.listByCustomer(customerUserId);
  }

  async cancelBooking(customerUserId: string, bookingId: string): Promise<void> {
    const owned = await this.repo.getOwned(customerUserId, bookingId);
    if (owned === null) throw new NotFoundError('booking_not_found', 'ההזמנה לא נמצאה.');
    if (!canCancel(owned.status)) throw new ConflictError('cannot_cancel', 'לא ניתן לבטל הזמנה זו.');
    await this.repo.cancel(bookingId);
    try {
      await this.notifications.notifyBookingCancelled(customerUserId, {
        professionalName: owned.professionalName, serviceName: owned.serviceName, date: owned.date, start: owned.start,
      });
    } catch { /* notifications are best-effort */ }
  }
}
