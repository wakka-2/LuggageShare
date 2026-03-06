import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CronService {
  private readonly logger = new Logger(CronService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Daily at 02:00 UTC — expire stale offers and requests
   */
  @Cron('0 2 * * *')
  async handleExpiry() {
    const now = new Date();
    this.logger.log('Running daily expiry job...');

    // 1. Expire pending offers on trips past departure date
    const expiredTripOffers = await this.prisma.offer.updateMany({
      where: {
        tripId: { not: null },
        status: 'pending',
        trip: { departureDate: { lt: now } },
      },
      data: { status: 'expired' },
    });
    if (expiredTripOffers.count > 0) {
      this.logger.log(`Expired ${expiredTripOffers.count} trip offers past departure`);
    }

    // 2. Expire pending offers on requests past neededByDate
    const expiredRequestOffers = await this.prisma.offer.updateMany({
      where: {
        requestId: { not: null },
        status: 'pending',
        request: { neededByDate: { lt: now } },
      },
      data: { status: 'expired' },
    });
    if (expiredRequestOffers.count > 0) {
      this.logger.log(`Expired ${expiredRequestOffers.count} request offers past needed-by date`);
    }

    // 3. Expire active requests past neededByDate
    const expiredRequests = await this.prisma.request.updateMany({
      where: {
        status: 'active',
        neededByDate: { lt: now },
      },
      data: { status: 'expired' },
    });
    if (expiredRequests.count > 0) {
      this.logger.log(`Expired ${expiredRequests.count} requests past needed-by date`);
    }

    // 4. Complete active trips past departure date with no pending offers/bookings
    const completedTrips = await this.prisma.trip.updateMany({
      where: {
        status: { in: ['active', 'full'] },
        departureDate: { lt: now },
        offers: { none: { status: 'pending' } },
        bookings: { none: { status: { in: ['pending', 'accepted', 'picked_up', 'in_transit'] } } },
      },
      data: { status: 'completed' },
    });
    if (completedTrips.count > 0) {
      this.logger.log(`Completed ${completedTrips.count} trips past departure`);
    }

    this.logger.log('Daily expiry job finished');
  }

  /**
   * Daily at 03:00 UTC — reconcile trip remainingWeight (alert-only)
   */
  @Cron('0 3 * * *')
  async handleWeightReconciliation() {
    this.logger.log('Running weight reconciliation...');

    const activeTrips = await this.prisma.trip.findMany({
      where: { status: { in: ['active', 'full'] } },
      select: {
        id: true,
        availableWeight: true,
        remainingWeight: true,
        bookings: {
          where: { status: { notIn: ['cancelled', 'rejected'] } },
          select: { totalWeight: true },
        },
      },
    });

    let driftCount = 0;

    for (const trip of activeTrips) {
      const bookedWeight = trip.bookings.reduce((sum, b) => sum + Number(b.totalWeight), 0);
      const expectedRemaining = Number(trip.availableWeight) - bookedWeight;
      const actualRemaining = Number(trip.remainingWeight);
      const drift = Math.abs(expectedRemaining - actualRemaining);

      if (drift > 0.01) {
        driftCount++;
        this.logger.warn(
          `Weight drift on trip ${trip.id}: expected=${expectedRemaining.toFixed(2)}, actual=${actualRemaining.toFixed(2)}, drift=${drift.toFixed(2)}`
        );
      }
    }

    this.logger.log(
      `Weight reconciliation done. ${driftCount} trips with drift out of ${activeTrips.length} active trips.`
    );
  }
}
