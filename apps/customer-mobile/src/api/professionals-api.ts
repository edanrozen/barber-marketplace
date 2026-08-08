import type { Page, ProfessionalDetail, ProfessionalSummary } from '@barber-marketplace/api-contracts';
import { apiRequest } from './client';

export const listProfessionals = (cursor?: string): Promise<Page<ProfessionalSummary>> =>
  apiRequest<Page<ProfessionalSummary>>(`professionals${cursor !== undefined ? `?cursor=${encodeURIComponent(cursor)}` : ''}`, { method: 'GET', auth: true });

export const getProfessional = (id: string): Promise<ProfessionalDetail> =>
  apiRequest<ProfessionalDetail>(`professionals/${id}`, { method: 'GET', auth: true });

import type { AvailabilityResponse } from '@barber-marketplace/api-contracts';
export const getAvailability = (professionalId: string, serviceId: string, days = 7): Promise<AvailabilityResponse> =>
  apiRequest<AvailabilityResponse>(
    `professionals/${professionalId}/availability?serviceId=${encodeURIComponent(serviceId)}&days=${days}`,
    { method: 'GET', auth: true },
  );
