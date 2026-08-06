import { type Page, type PageRequest, type ProfessionalDetail, type ProfessionalSummary } from '@barber-marketplace/api-contracts';

export interface ProfessionalRepository {
  listSummaries(page: PageRequest): Promise<Page<ProfessionalSummary>>;
  getDetail(id: string): Promise<ProfessionalDetail | null>;
}
export const PROFESSIONAL_REPOSITORY = Symbol('PROFESSIONAL_REPOSITORY');
