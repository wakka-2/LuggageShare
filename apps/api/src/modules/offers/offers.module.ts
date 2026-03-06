import { Module } from '@nestjs/common';
import {
  TripsOffersController,
  RequestsOffersController,
  OffersController,
} from './offers.controller';
import { OffersService } from './offers.service';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [NotificationsModule],
  controllers: [TripsOffersController, RequestsOffersController, OffersController],
  providers: [OffersService],
  exports: [OffersService],
})
export class OffersModule {}
