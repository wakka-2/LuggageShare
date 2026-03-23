import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateOfferDto } from './dto/create-offer.dto';

@Injectable()
export class OffersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService
  ) {}

  async create(userId: string, flightId: string, dto: CreateOfferDto) {
    const flight = await this.prisma.flight.findUnique({
      where: { id: flightId },
      include: { poster: { select: { id: true, name: true } } },
    });

    if (!flight) throw new NotFoundException('Flight not found');
    if (flight.posterId === userId) {
      throw new BadRequestException('You cannot make an offer on your own flight');
    }
    if (flight.status !== 'active') {
      throw new BadRequestException('This flight is no longer accepting offers');
    }

    // Minimum 24h lead time
    const cutoff = new Date();
    cutoff.setHours(cutoff.getHours() + 24);
    if (flight.departureDate < cutoff) {
      throw new BadRequestException('Cannot submit offers less than 24 hours before departure');
    }

    // Weight must not exceed remaining capacity
    if (dto.offeredWeight > Number(flight.remainingWeight)) {
      throw new BadRequestException(
        `Offered weight (${dto.offeredWeight}kg) exceeds remaining capacity (${flight.remainingWeight}kg)`
      );
    }

    // Only one pending offer per (flight, sender)
    const existingPending = await this.prisma.offer.findFirst({
      where: { flightId, senderId: userId, status: 'pending' },
    });
    if (existingPending) {
      throw new BadRequestException(
        'You already have a pending offer on this flight. Withdraw it first to submit a new one.'
      );
    }

    const offer = await this.prisma.offer.create({
      data: {
        flightId,
        senderId: userId,
        offeredWeight: dto.offeredWeight,
        offeredPrice: dto.offeredPrice,
        currency: dto.currency ?? flight.currency,
        note: dto.note,
        imageUrls: dto.imageUrls ?? [],
      },
      include: {
        sender: { select: { id: true, name: true, avatarUrl: true, isVerified: true } },
        flight: { select: { id: true, departureCity: true, arrivalCity: true } },
      },
    });

    // Notify poster
    this.notifications.sendPushNotification(
      flight.posterId,
      'New Offer on Your Flight',
      `You have a new offer on your ${flight.departureCity} → ${flight.arrivalCity} flight`,
      { type: 'offer_created', offerId: offer.id, flightId }
    );

    return offer;
  }

  async findByFlight(userId: string, flightId: string) {
    const flight = await this.prisma.flight.findUnique({
      where: { id: flightId },
      select: { posterId: true },
    });

    if (!flight) throw new NotFoundException('Flight not found');
    if (flight.posterId !== userId) {
      throw new ForbiddenException('Only the poster can view offers on this flight');
    }

    return this.prisma.offer.findMany({
      where: { flightId },
      include: {
        sender: {
          select: { id: true, name: true, avatarUrl: true, isVerified: true, city: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findMyOffers(userId: string, params?: { page?: number; limit?: number }) {
    const page = Number(params?.page) || 1;
    const limit = Math.min(Number(params?.limit) || 20, 100);
    const skip = (page - 1) * limit;

    const where = { senderId: userId };

    const [data, total] = await Promise.all([
      this.prisma.offer.findMany({
        where,
        include: {
          flight: {
            include: {
              poster: { select: { id: true, name: true, avatarUrl: true } },
            },
          },
          booking: { select: { id: true, status: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.offer.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findById(id: string) {
    const offer = await this.prisma.offer.findUnique({
      where: { id },
      include: {
        flight: {
          include: {
            poster: { select: { id: true, name: true, avatarUrl: true } },
          },
        },
        sender: { select: { id: true, name: true, avatarUrl: true, isVerified: true } },
        booking: { select: { id: true, status: true } },
      },
    });

    if (!offer) throw new NotFoundException('Offer not found');
    return offer;
  }

  /**
   * Accept an offer — runs inside a $transaction with these steps:
   * 1. Lock Flight row and re-validate capacity
   * 2. Deduct remainingWeight, update Flight status
   * 3. Update offer → accepted
   * 4. Create Booking
   * 5. Auto-reject offers that no longer fit
   */
  async accept(userId: string, id: string) {
    const offer = await this.findById(id);
    const flight = offer.flight;

    if (flight.poster.id !== userId) {
      throw new ForbiddenException('Only the flight poster can accept offers');
    }
    if (offer.status !== 'pending') {
      throw new BadRequestException(`Offer is ${offer.status} and cannot be accepted`);
    }

    const result = await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Lock and re-read the flight with a FOR UPDATE equivalent
      const freshFlight = await tx.flight.findUnique({ where: { id: flight.id } });
      if (!freshFlight) throw new NotFoundException('Flight not found');

      if (freshFlight.status !== 'active') {
        throw new BadRequestException('Flight is no longer active');
      }

      const offeredWeight = Number(offer.offeredWeight);
      const remaining = Number(freshFlight.remainingWeight);

      if (offeredWeight > remaining) {
        throw new BadRequestException(
          `Insufficient capacity: ${offeredWeight}kg requested, only ${remaining}kg remaining`
        );
      }

      const newRemaining = remaining - offeredWeight;
      const newFlightStatus = newRemaining === 0 ? 'full' : 'active';

      // Update flight capacity
      await tx.flight.update({
        where: { id: flight.id },
        data: { remainingWeight: newRemaining, status: newFlightStatus },
      });

      // Accept the offer
      await tx.offer.update({ where: { id }, data: { status: 'accepted' } });

      // Create Booking
      const booking = await tx.booking.create({
        data: {
          offerId: id,
          flightId: flight.id,
          senderId: offer.sender.id,
          carrierId: flight.poster.id,
          status: 'pending',
          totalWeight: offer.offeredWeight,
          totalPrice: offer.offeredPrice,
          currency: offer.currency,
        },
      });

      // Auto-reject pending offers that no longer fit
      if (newRemaining < remaining) {
        const oversizedOffers = await tx.offer.findMany({
          where: {
            flightId: flight.id,
            status: 'pending',
            offeredWeight: { gt: newRemaining },
          },
          select: { id: true, senderId: true },
        });

        if (oversizedOffers.length > 0) {
          await tx.offer.updateMany({
            where: {
              id: { in: oversizedOffers.map((o: any) => o.id) },
            },
            data: { status: 'rejected' },
          });

          // Store for notifications outside transaction
          return { booking, autoRejectedOffers: oversizedOffers };
        }
      }

      return { booking, autoRejectedOffers: [] };
    });

    // Notify sender of acceptance
    this.notifications.sendPushNotification(
      offer.sender.id,
      'Offer Accepted!',
      `Your offer on the ${flight.departureCity} → ${flight.arrivalCity} flight was accepted. Booking created!`,
      { type: 'offer_accepted', offerId: id, bookingId: result.booking.id }
    );

    // Notify auto-rejected senders
    await Promise.all(
      result.autoRejectedOffers.map((o: any) =>
        this.notifications.sendPushNotification(
          o.senderId,
          'Offer Rejected',
          'Your offer was rejected due to insufficient remaining capacity on the flight',
          { type: 'offer_rejected_capacity', offerId: o.id, flightId: flight.id }
        )
      )
    );

    return result.booking;
  }

  async reject(userId: string, id: string) {
    const offer = await this.findById(id);

    if (offer.flight.poster.id !== userId) {
      throw new ForbiddenException('Only the flight poster can reject offers');
    }
    if (offer.status !== 'pending') {
      throw new BadRequestException(`Offer is ${offer.status} and cannot be rejected`);
    }

    await this.prisma.offer.update({ where: { id }, data: { status: 'rejected' } });

    this.notifications.sendPushNotification(
      offer.sender.id,
      'Offer Not Accepted',
      `Your offer on the ${offer.flight.departureCity} → ${offer.flight.arrivalCity} flight was not accepted`,
      { type: 'offer_rejected', offerId: id }
    );

    return { success: true };
  }

  async withdraw(userId: string, id: string) {
    const offer = await this.findById(id);

    if (offer.sender.id !== userId) {
      throw new ForbiddenException('Only the offer sender can withdraw it');
    }
    if (offer.status !== 'pending') {
      throw new BadRequestException('Only pending offers can be withdrawn');
    }

    await this.prisma.offer.update({ where: { id }, data: { status: 'withdrawn' } });

    return { success: true };
  }

  /** Called by the expiry cron job — expires pending offers on departed flights */
  async expirePendingOffers() {
    const result = await this.prisma.offer.updateMany({
      where: {
        status: 'pending',
        flight: {
          departureDate: { lt: new Date() },
        },
      },
      data: { status: 'expired' },
    });

    return result.count;
  }
}
