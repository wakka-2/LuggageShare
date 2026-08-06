import { Controller, Get, Headers, Logger, UnauthorizedException } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { OffersService } from './offers.service';

/**
 * Scheduled work, invoked by Vercel Cron (see apps/api/vercel.json).
 *
 * Replaces the old @nestjs/schedule in-process cron, which cannot run on a
 * serverless platform. Not behind JwtAuthGuard; instead it verifies the
 * `Authorization: Bearer <CRON_SECRET>` header that Vercel Cron sends when the
 * CRON_SECRET env var is configured.
 */
@ApiExcludeController()
@Controller('cron')
export class CronController {
  private readonly logger = new Logger(CronController.name);

  constructor(private readonly offersService: OffersService) {}

  @Get('offers-expiry')
  async offersExpiry(@Headers('authorization') auth?: string) {
    const secret = process.env.CRON_SECRET;
    if (secret) {
      if (auth !== `Bearer ${secret}`) {
        throw new UnauthorizedException('Invalid cron secret');
      }
    } else {
      this.logger.warn('CRON_SECRET not set — offers-expiry endpoint is unprotected');
    }

    const count = await this.offersService.expirePendingOffers();
    this.logger.log(`Cron offers-expiry: expired ${count} pending offers`);
    return { expired: count };
  }
}
