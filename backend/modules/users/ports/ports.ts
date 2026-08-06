import { type MeResponse } from '@barber-marketplace/api-contracts';
/** Profile persistence port for the users module. */
export type ProfileRecord = MeResponse;
export interface ProfileRepository {
  getProfile(userId: string): Promise<ProfileRecord | null>;
  updateDisplayName(userId: string, displayName: string): Promise<void>;
}
export const PROFILE_REPOSITORY = Symbol('PROFILE_REPOSITORY');
