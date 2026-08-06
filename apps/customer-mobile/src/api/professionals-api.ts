import type { Page, ProfessionalDetail, ProfessionalSummary } from '@barber-marketplace/api-contracts';
import { apiRequest } from './client';

export const listProfessionals = (cursor?: string): Promise<Page<ProfessionalSummary>> =>
  apiRequest<Page<ProfessionalSummary>>(`professionals${cursor !== undefined ? `?cursor=${encodeURIComponent(cursor)}` : ''}`, { method: 'GET', auth: true });

export const getProfessional = (id: string): Promise<ProfessionalDetail> =>
  apiRequest<ProfessionalDetail>(`professionals/${id}`, { method: 'GET', auth: true });
