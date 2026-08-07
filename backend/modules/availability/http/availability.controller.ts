import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { type AvailabilityResponse } from '@barber-marketplace/api-contracts';
import { JwtAuthGuard } from '../../identity';
import { AvailabilityService } from '../application/availability.service';

const DEFAULT_DAYS = 7;
const MAX_DAYS = 14;

/** Available slots for a professional + service (API v1, authenticated). */
@Controller({ path: 'professionals/:id/availability', version: '1' })
@UseGuards(JwtAuthGuard)
export class AvailabilityController {
  constructor(private readonly availability: AvailabilityService) {}

  @Get()
  get(
    @Param('id') id: string,
    @Query('serviceId') serviceId: string | undefined,
    @Query('days') days: string | undefined,
  ): Promise<AvailabilityResponse> {
    const requested = days !== undefined ? Number(days) : DEFAULT_DAYS;
    const clamped = Number.isFinite(requested) ? Math.min(Math.max(Math.trunc(requested), 1), MAX_DAYS) : DEFAULT_DAYS;
    return this.availability.computeAvailability(id, serviceId ?? '', clamped);
  }
}
