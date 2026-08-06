import { Body, Controller, Get, Patch, Req, UseGuards } from '@nestjs/common';
import { type MeResponse, type UpdateProfileBody } from '@barber-marketplace/api-contracts';
import { JwtAuthGuard } from '../../identity';
import { ProfileService } from '../application/profile.service';

interface AuthedRequest { user: { id: string; role: string }; }

/** Authenticated profile endpoints (API v1). */
@Controller({ path: 'me', version: '1' })
@UseGuards(JwtAuthGuard)
export class ProfileController {
  constructor(private readonly profiles: ProfileService) {}

  @Get()
  getMe(@Req() req: AuthedRequest): Promise<MeResponse> {
    return this.profiles.getMe(req.user.id);
  }

  @Patch()
  update(@Req() req: AuthedRequest, @Body() body: UpdateProfileBody): Promise<MeResponse> {
    return this.profiles.updateMe(req.user.id, body.displayName);
  }
}
