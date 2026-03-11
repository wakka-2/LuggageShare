import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { OffersService } from './offers.service';

@Injectable()
export class OffersScheduler {
  private readonly logger = new Logger(OffersScheduler.name);

  constructor(private readonly offersService: OffersService) {}

  /** Run daily at 02:00 UTC to expire pending offers on departed flights */
  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async expirePendingOffers() {
    this.logger.log('Running offer expiry job...');
    const count = await this.offersService.expirePendingOffers();
    this.logger.log(`Expired ${count} pending offers`);
  }
}
