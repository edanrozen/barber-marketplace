import { Body, Controller, Get, HttpCode, Param, Post, Req, UseGuards } from '@nestjs/common';
import { type BookingView, type CreateBookingBody } from '@barber-marketplace/api-contracts';
import { JwtAuthGuard } from '../../identity';
import { BookingService } from '../application/booking.service';

interface AuthedRequest { user: { id: string; role: string }; }

@Controller({ path: 'bookings', version: '1' })
@UseGuards(JwtAuthGuard)
export class BookingController {
  constructor(private readonly bookings: BookingService) {}

  @Post()
  @HttpCode(201)
  create(@Req() req: AuthedRequest, @Body() body: CreateBookingBody): Promise<BookingView> {
    return this.bookings.createBooking(req.user.id, body);
  }

  @Get()
  list(@Req() req: AuthedRequest): Promise<readonly BookingView[]> {
    return this.bookings.listMyBookings(req.user.id);
  }

  @Post(':id/cancel')
  @HttpCode(200)
  async cancel(@Req() req: AuthedRequest, @Param('id') id: string): Promise<{ ok: true }> {
    await this.bookings.cancelBooking(req.user.id, id);
    return { ok: true };
  }
}
