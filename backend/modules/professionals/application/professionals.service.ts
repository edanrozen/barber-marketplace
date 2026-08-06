import { Inject, Injectable } from '@nestjs/common';
import { type Page, type PageRequest, type ProfessionalDetail, type ProfessionalSummary } from '@barber-marketplace/api-contracts';
import { NotFoundError } from '@barber-marketplace/errors';
import { PROFESSIONAL_REPOSITORY, type ProfessionalRepository } from '../ports/ports';

@Injectable()
export class ProfessionalsService {
  constructor(@Inject(PROFESSIONAL_REPOSITORY) private readonly repo: ProfessionalRepository) {}

  list(page: PageRequest): Promise<Page<ProfessionalSummary>> {
    return this.repo.listSummaries(page);
  }

  async getById(id: string): Promise<ProfessionalDetail> {
    const detail = await this.repo.getDetail(id);
    if (detail === null) throw new NotFoundError('professional_not_found', 'הספר לא נמצא.');
    return detail;
  }
}
