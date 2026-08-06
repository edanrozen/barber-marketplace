import { Injectable, Logger } from '@nestjs/common';
import { type SmsSender } from '../ports/ports';

/** Development SMS adapter: logs instead of sending. The Israeli SMS-gateway adapter is wired in staging/prod. */
@Injectable()
export class ConsoleSmsSender implements SmsSender {
  private readonly logger = new Logger('ConsoleSmsSender');
  async send(phone: string, message: string): Promise<void> {
    this.logger.log(`SMS → ${phone}: ${message}`);
  }
}
