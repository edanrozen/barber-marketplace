import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { type PaymentView } from '@barber-marketplace/api-contracts';
import { JwtAuthGuard } from '../../identity';
import { PaymentsService } from '../application/payments.service';

interface AuthedRequest { user: { id: string; role: string }; }

@Controller({ path: 'payments', version: '1' })
@UseGuards(JwtAuthGuard)
export class PaymentsController {
  constructor(private readonly payments: PaymentsService) {}

  @Get()
  list(@Req() req: AuthedRequest): Promise<readonly PaymentView[]> {
    return this.payments.listForCustomer(req.user.id);
  }
}
