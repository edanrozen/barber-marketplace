import { Inject, Injectable } from '@nestjs/common';
import { type MeResponse } from '@barber-marketplace/api-contracts';
import { validateDisplayName } from '@barber-marketplace/validation';
import { NotFoundError, ValidationError } from '@barber-marketplace/errors';
import { PROFILE_REPOSITORY, type ProfileRepository } from '../ports/ports';

@Injectable()
export class ProfileService {
  constructor(@Inject(PROFILE_REPOSITORY) private readonly profiles: ProfileRepository) {}

  async getMe(userId: string): Promise<MeResponse> {
    const profile = await this.profiles.getProfile(userId);
    if (profile === null) throw new NotFoundError('user_not_found', 'המשתמש לא נמצא.');
    return profile;
  }

  async updateMe(userId: string, displayName: string): Promise<MeResponse> {
    const validated = validateDisplayName(displayName);
    if (!validated.ok) throw new ValidationError('invalid_display_name', 'שם התצוגה אינו תקין (1–60 תווים).');
    await this.profiles.updateDisplayName(userId, validated.value);
    return this.getMe(userId);
  }
}
