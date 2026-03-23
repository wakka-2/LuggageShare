import { Module } from '@nestjs/common';
import { OffersService } from './offers.service';
import { OffersController } from './offers.controller';
import { OffersScheduler } from './offers.scheduler';
import { PrismaModule } from '../../prisma/prisma.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [PrismaModule, NotificationsModule],
  providers: [OffersService, OffersScheduler],
  controllers: [OffersController],
  exports: [OffersService],
})
export class OffersModule {}
