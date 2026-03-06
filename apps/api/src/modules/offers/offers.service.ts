import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateOfferDto } from './dto/create-offer.dto';

@Injectable()
export class OffersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService
  ) {}

  // ==========================================
  // Trip Offers (Sender offers on a Traveler's Trip)
  // ==========================================

  async createTripOffer(userId: string, tripId: string, dto: CreateOfferDto) {
    const trip = await this.prisma.trip.findUnique({ where: { id: tripId } });

    if (!trip) {
      throw new NotFoundException('Trip not found');
    }

    if (trip.posterId === userId) {
      throw new BadRequestException('You cannot make an offer on your own trip');
    }

    if (trip.status !== 'active') {
      throw new BadRequestException('This trip is no longer accepting offers');
    }

    if (dto.offeredWeight > Number(trip.remainingWeight)) {
      throw new BadRequestException(
        `Offered weight (${dto.offeredWeight}kg) exceeds remaining capacity (${trip.remainingWeight}kg)`
      );
    }

    // Check 24h lead time
    const now = new Date();
    const departure = new Date(trip.departureDate);
    const hoursUntilDeparture = (departure.getTime() - now.getTime()) / (1000 * 60 * 60);
    if (hoursUntilDeparture < 24) {
      throw new BadRequestException('Offers must be made at least 24 hours before departure');
    }

    // Check for existing pending offer by this user on this trip (app-level unique)
    const existingOffer = await this.prisma.offer.findFirst({
      where: { tripId, userId, status: 'pending' },
    });
    if (existingOffer) {
      throw new BadRequestException('You already have a pending offer on this trip');
    }

    const offer = await this.prisma.offer.create({
      data: {
        tripId,
        userId,
        offeredWeight: dto.offeredWeight,
        offeredPrice: dto.offeredPrice,
        currency: dto.currency || trip.currency,
        message: dto.message,
        status: 'pending',
      },
    });

    // Notify trip poster
    this.notifications.sendPushNotification(
      trip.posterId,
      'New Offer',
      `You received a new offer for ${dto.offeredWeight}kg at ${dto.offeredPrice} ${dto.currency || trip.currency}`,
      { type: 'offer_received', offerId: offer.id, tripId }
    );

    return offer;
  }

  // ==========================================
  // Request Offers (Traveler offers to carry a Sender's Request)
  // ==========================================

  async createRequestOffer(userId: string, requestId: string, dto: CreateOfferDto) {
    const request = await this.prisma.request.findUnique({ where: { id: requestId } });

    if (!request) {
      throw new NotFoundException('Request not found');
    }

    if (request.posterId === userId) {
      throw new BadRequestException('You cannot make an offer on your own request');
    }

    if (request.status !== 'active') {
      throw new BadRequestException('This request is no longer accepting offers');
    }

    // For requests, offered weight should match request weight
    if (dto.offeredWeight !== Number(request.weight)) {
      throw new BadRequestException(
        `Offered weight must match request weight (${request.weight}kg)`
      );
    }

    // Check for existing pending offer
    const existingOffer = await this.prisma.offer.findFirst({
      where: { requestId, userId, status: 'pending' },
    });
    if (existingOffer) {
      throw new BadRequestException('You already have a pending offer on this request');
    }

    const offer = await this.prisma.offer.create({
      data: {
        requestId,
        userId,
        offeredWeight: dto.offeredWeight,
        offeredPrice: dto.offeredPrice,
        currency: dto.currency || request.currency,
        message: dto.message,
        status: 'pending',
      },
    });

    // Notify request poster
    this.notifications.sendPushNotification(
      request.posterId,
      'New Offer',
      `A traveler offered to carry your items for ${dto.offeredPrice} ${dto.currency || request.currency}`,
      { type: 'offer_received', offerId: offer.id, requestId }
    );

    return offer;
  }

  // ==========================================
  // Accept Offer (Transactional with row locking)
  // ==========================================

  async acceptOffer(userId: string, offerId: string) {
    return this.prisma.$transaction(async (tx) => {
      const offer = await tx.offer.findUnique({
        where: { id: offerId },
        include: { trip: true, request: true },
      });

      if (!offer) {
        throw new NotFoundException('Offer not found');
      }

      if (offer.status !== 'pending') {
        throw new BadRequestException('Only pending offers can be accepted');
      }

      let senderId: string;
      let carrierId: string;

      if (offer.tripId && offer.trip) {
        // Trip offer: trip poster is carrier, offer maker is sender
        if (offer.trip.posterId !== userId) {
          throw new ForbiddenException('Only the trip poster can accept offers on their trip');
        }

        // Re-validate weight with fresh data (row-level lock via transaction)
        if (Number(offer.offeredWeight) > Number(offer.trip.remainingWeight)) {
          throw new BadRequestException(
            `Offer weight (${offer.offeredWeight}kg) now exceeds remaining capacity (${offer.trip.remainingWeight}kg)`
          );
        }

        // Decrement remaining weight
        await tx.trip.update({
          where: { id: offer.tripId },
          data: {
            remainingWeight: { decrement: Number(offer.offeredWeight) },
          },
        });

        // Check if trip is now full
        const updatedTrip = await tx.trip.findUnique({
          where: { id: offer.tripId },
          select: { remainingWeight: true },
        });
        if (updatedTrip && Number(updatedTrip.remainingWeight) <= 0) {
          await tx.trip.update({
            where: { id: offer.tripId },
            data: { status: 'full' },
          });
        }

        carrierId = offer.trip.posterId;
        senderId = offer.userId;

        // Auto-reject pending offers that now exceed remaining capacity
        const remainingAfter = Number(offer.trip.remainingWeight) - Number(offer.offeredWeight);
        if (remainingAfter >= 0) {
          const overweightOffers = await tx.offer.findMany({
            where: {
              tripId: offer.tripId,
              status: 'pending',
              id: { not: offerId },
              offeredWeight: { gt: remainingAfter },
            },
            select: { id: true, userId: true },
          });

          if (overweightOffers.length > 0) {
            await tx.offer.updateMany({
              where: {
                id: { in: overweightOffers.map((o) => o.id) },
              },
              data: { status: 'rejected' },
            });

            for (const rejected of overweightOffers) {
              this.notifications.sendPushNotification(
                rejected.userId,
                'Offer Auto-Rejected',
                'Your offer was rejected because the trip no longer has enough capacity',
                { type: 'offer_rejected', offerId: rejected.id }
              );
            }
          }
        }
      } else if (offer.requestId && offer.request) {
        // Request offer: offer maker is carrier, request poster is sender
        if (offer.request.posterId !== userId) {
          throw new ForbiddenException(
            'Only the request poster can accept offers on their request'
          );
        }

        carrierId = offer.userId;
        senderId = offer.request.posterId;

        // Fulfill the request — reject all other pending offers
        await tx.request.update({
          where: { id: offer.requestId },
          data: { status: 'fulfilled' },
        });

        const otherOffers = await tx.offer.findMany({
          where: {
            requestId: offer.requestId,
            status: 'pending',
            id: { not: offerId },
          },
          select: { id: true, userId: true },
        });

        if (otherOffers.length > 0) {
          await tx.offer.updateMany({
            where: { id: { in: otherOffers.map((o) => o.id) } },
            data: { status: 'rejected' },
          });

          for (const rejected of otherOffers) {
            this.notifications.sendPushNotification(
              rejected.userId,
              'Offer Not Selected',
              'Another offer was accepted for this request',
              { type: 'offer_rejected', offerId: rejected.id }
            );
          }
        }
      } else {
        throw new BadRequestException('Offer must be linked to a trip or request');
      }

      // Accept the offer
      await tx.offer.update({
        where: { id: offerId },
        data: { status: 'accepted' },
      });

      // Create the booking
      const booking = await tx.booking.create({
        data: {
          offerId,
          tripId: offer.tripId,
          requestId: offer.requestId,
          senderId,
          carrierId,
          status: 'pending',
          totalWeight: Number(offer.offeredWeight),
          totalPrice: Number(offer.offeredPrice),
          currency: offer.currency,
        },
      });

      // Notify the offer maker
      this.notifications.sendPushNotification(
        offer.userId,
        'Offer Accepted!',
        'Your offer has been accepted. A booking has been created.',
        { type: 'offer_accepted', offerId, bookingId: booking.id }
      );

      return { offer: { ...offer, status: 'accepted' }, booking };
    });
  }

  // ==========================================
  // Reject / Withdraw
  // ==========================================

  async rejectOffer(userId: string, offerId: string) {
    const offer = await this.prisma.offer.findUnique({
      where: { id: offerId },
      include: { trip: true, request: true },
    });

    if (!offer) {
      throw new NotFoundException('Offer not found');
    }

    if (offer.status !== 'pending') {
      throw new BadRequestException('Only pending offers can be rejected');
    }

    // Only the trip/request poster can reject
    const posterUserId = offer.trip?.posterId ?? offer.request?.posterId;
    if (posterUserId !== userId) {
      throw new ForbiddenException('Only the trip/request poster can reject offers');
    }

    const updated = await this.prisma.offer.update({
      where: { id: offerId },
      data: { status: 'rejected' },
    });

    this.notifications.sendPushNotification(
      offer.userId,
      'Offer Rejected',
      'Your offer was not accepted',
      { type: 'offer_rejected', offerId }
    );

    return updated;
  }

  async withdrawOffer(userId: string, offerId: string) {
    const offer = await this.prisma.offer.findUnique({
      where: { id: offerId },
    });

    if (!offer) {
      throw new NotFoundException('Offer not found');
    }

    if (offer.userId !== userId) {
      throw new ForbiddenException('You can only withdraw your own offers');
    }

    if (offer.status !== 'pending') {
      throw new BadRequestException('Only pending offers can be withdrawn');
    }

    return this.prisma.offer.update({
      where: { id: offerId },
      data: { status: 'withdrawn' },
    });
  }

  // ==========================================
  // Query Offers
  // ==========================================

  async findTripOffers(tripId: string, params?: { page?: number; limit?: number }) {
    const page = Number(params?.page) || 1;
    const limit = Math.min(Number(params?.limit) || 20, 100);
    const skip = (page - 1) * limit;

    const where = { tripId };

    const [data, total] = await Promise.all([
      this.prisma.offer.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatarUrl: true,
              isVerified: true,
            },
          },
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

  async findRequestOffers(requestId: string, params?: { page?: number; limit?: number }) {
    const page = Number(params?.page) || 1;
    const limit = Math.min(Number(params?.limit) || 20, 100);
    const skip = (page - 1) * limit;

    const where = { requestId };

    const [data, total] = await Promise.all([
      this.prisma.offer.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatarUrl: true,
              isVerified: true,
            },
          },
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

  async findMyOffers(userId: string, params?: { page?: number; limit?: number }) {
    const page = Number(params?.page) || 1;
    const limit = Math.min(Number(params?.limit) || 20, 100);
    const skip = (page - 1) * limit;

    const where = { userId };

    const [data, total] = await Promise.all([
      this.prisma.offer.findMany({
        where,
        include: {
          trip: {
            select: {
              id: true,
              departureCity: true,
              arrivalCity: true,
              departureDate: true,
              transportType: true,
            },
          },
          request: {
            select: {
              id: true,
              departureCity: true,
              arrivalCity: true,
              neededByDate: true,
              weight: true,
            },
          },
          booking: {
            select: { id: true, status: true },
          },
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

  async findById(offerId: string) {
    const offer = await this.prisma.offer.findUnique({
      where: { id: offerId },
      include: {
        trip: true,
        request: true,
        user: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
            isVerified: true,
          },
        },
        booking: { select: { id: true, status: true } },
      },
    });

    if (!offer) {
      throw new NotFoundException('Offer not found');
    }

    return offer;
  }
}
