import type { MeResponse } from '@barber-marketplace/api-contracts';
import { apiRequest } from './client';

export const getMe = (): Promise<MeResponse> => apiRequest<MeResponse>('me', { method: 'GET', auth: true });

export const updateMe = (displayName: string): Promise<MeResponse> =>
  apiRequest<MeResponse>('me', { method: 'PATCH', auth: true, body: { displayName } });
