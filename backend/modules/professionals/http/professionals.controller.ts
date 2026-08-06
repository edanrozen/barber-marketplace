import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { type Page, type ProfessionalDetail, type ProfessionalSummary } from '@barber-marketplace/api-contracts';
import { JwtAuthGuard } from '../../identity';
import { parsePageRequest } from '../../../common/pagination/pagination';
import { ProfessionalsService } from '../application/professionals.service';

/** Customer-facing professional catalog (API v1, authenticated). */
@Controller({ path: 'professionals', version: '1' })
@UseGuards(JwtAuthGuard)
export class ProfessionalsController {
  constructor(private readonly professionals: ProfessionalsService) {}

  @Get()
  list(@Query() query: Record<string, unknown>): Promise<Page<ProfessionalSummary>> {
    return this.professionals.list(parsePageRequest(query));
  }

  @Get(':id')
  get(@Param('id') id: string): Promise<ProfessionalDetail> {
    return this.professionals.getById(id);
  }
}
