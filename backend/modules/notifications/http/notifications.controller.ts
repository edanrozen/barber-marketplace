import { Controller, Get, HttpCode, Param, Post, Req, UseGuards } from '@nestjs/common';
import { type NotificationView } from '@barber-marketplace/api-contracts';
import { JwtAuthGuard } from '../../identity';
import { NotificationsService } from '../application/notifications.service';

interface AuthedRequest { user: { id: string; role: string }; }

@Controller({ path: 'notifications', version: '1' })
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notifications: NotificationsService) {}

  @Get()
  list(@Req() req: AuthedRequest): Promise<readonly NotificationView[]> {
    return this.notifications.list(req.user.id);
  }

  @Post(':id/read')
  @HttpCode(200)
  async read(@Req() req: AuthedRequest, @Param('id') id: string): Promise<{ ok: true }> {
    await this.notifications.markRead(req.user.id, id);
    return { ok: true };
  }
}
