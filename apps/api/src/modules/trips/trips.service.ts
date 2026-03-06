import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateTripDto } from './dto/create-trip.dto';
import { UpdateTripDto } from './dto/update-trip.dto';

@Injectable()
export class TripsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService
  ) {}

  async search(params: {
    from?: string;
    to?: string;
    date?: string;
    minWeight?: number;
    transportType?: string;
    page?: number;
    limit?: number;
  }) {
    const { from, to, date, minWeight, transportType } = params;
    const page = Number(params.page) || 1;
    const limit = Math.min(Number(params.limit) || 20, 100);
    const skip = (page - 1) * limit;

    const where = {
      status: 'active' as const,
      remainingWeight: { gt: 0 },
      ...(from && { departureCity: { contains: from, mode: 'insensitive' as const } }),
      ...(to && { arrivalCity: { contains: to, mode: 'insensitive' as const } }),
      ...(date && {
        departureDate: {
          gte: new Date(date),
          lt: new Date(new Date(date).setDate(new Date(date).getDate() + 1)),
        },
      }),
      ...(minWeight && { remainingWeight: { gte: minWeight } }),
      ...(transportType && { transportType }),
    };

    const [data, total] = await Promise.all([
      this.prisma.trip.findMany({
        where,
        include: {
          poster: {
            select: {
              id: true,
              name: true,
              avatarUrl: true,
              isVerified: true,
            },
          },
          _count: { select: { offers: true } },
        },
        orderBy: { departureDate: 'asc' },
        skip,
        take: limit,
      }),
      this.prisma.trip.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string) {
    const trip = await this.prisma.trip.findUnique({
      where: { id },
      include: {
        poster: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
            isVerified: true,
            bio: true,
            city: true,
          },
        },
        _count: { select: { offers: true, bookings: true } },
      },
    });

    if (!trip) {
      throw new NotFoundException('Trip not found');
    }

    return trip;
  }

  async create(userId: string, dto: CreateTripDto) {
    return this.prisma.trip.create({
      data: {
        posterId: userId,
        status: 'active',
        departureCity: dto.departureCity,
        departureCode: dto.departureCode,
        arrivalCity: dto.arrivalCity,
        arrivalCode: dto.arrivalCode,
        departureDate: new Date(dto.departureDate),
        transportType: dto.transportType || 'flight',
        flightNumber: dto.flightNumber,
        availableWeight: dto.availableWeight,
        remainingWeight: dto.availableWeight, // Starts equal to available
        suggestedPrice: dto.suggestedPrice,
        currency: dto.currency || 'SAR',
        preferences: dto.preferences as any,
        notes: dto.notes,
      },
    });
  }

  async update(userId: string, id: string, dto: UpdateTripDto) {
    const trip = await this.findById(id);

    if (trip.posterId !== userId) {
      throw new ForbiddenException('You can only update your own trips');
    }

    if (trip.status !== 'active') {
      throw new BadRequestException('Only active trips can be updated');
    }

    // Check for accepted offers — can't update weight if offers accepted
    const acceptedOffers = await this.prisma.offer.count({
      where: { tripId: id, status: 'accepted' },
    });
    if (acceptedOffers > 0 && dto.availableWeight !== undefined) {
      throw new BadRequestException('Cannot change weight while there are accepted offers');
    }

    // Explicit field mapping — prevent mass assignment
    const allowedUpdates: Record<string, any> = {};
    const allowedFields = [
      'departureCity',
      'departureCode',
      'arrivalCity',
      'arrivalCode',
      'departureDate',
      'flightNumber',
      'availableWeight',
      'suggestedPrice',
      'currency',
      'preferences',
      'notes',
    ];
    const dtoRecord = dto as Record<string, any>;
    for (const field of allowedFields) {
      if (dtoRecord[field] !== undefined) {
        allowedUpdates[field] =
          field === 'departureDate' ? new Date(dtoRecord[field]) : dtoRecord[field];
      }
    }

    // If availableWeight changed, adjust remainingWeight proportionally
    if (dto.availableWeight !== undefined) {
      const usedWeight = Number(trip.availableWeight) - Number(trip.remainingWeight);
      const newRemaining = dto.availableWeight - usedWeight;
      if (newRemaining < 0) {
        throw new BadRequestException(
          `New available weight must be at least ${usedWeight}kg (already committed)`
        );
      }
      allowedUpdates.remainingWeight = newRemaining;
    }

    return this.prisma.trip.update({
      where: { id },
      data: allowedUpdates,
    });
  }

  async cancel(userId: string, id: string) {
    const trip = await this.findById(id);

    if (trip.posterId !== userId) {
      throw new ForbiddenException('You can only cancel your own trips');
    }

    if (!['active', 'full'].includes(trip.status)) {
      throw new BadRequestException('This trip cannot be cancelled');
    }

    // Transaction: cancel trip, reject pending offers, cancel pending bookings
    return this.prisma.$transaction(async (tx) => {
      // Reject all pending offers
      const pendingOffers = await tx.offer.findMany({
        where: { tripId: id, status: 'pending' },
        select: { id: true, userId: true },
      });

      if (pendingOffers.length > 0) {
        await tx.offer.updateMany({
          where: { tripId: id, status: 'pending' },
          data: { status: 'rejected' },
        });

        // Notify offer makers
        for (const offer of pendingOffers) {
          this.notifications.sendPushNotification(
            offer.userId,
            'Offer Cancelled',
            'The trip you made an offer on has been cancelled',
            { type: 'trip_cancelled', tripId: id }
          );
        }
      }

      // Cancel pending/accepted bookings linked to this trip
      const activeBookings = await tx.booking.findMany({
        where: { tripId: id, status: { in: ['pending', 'accepted'] } },
        select: { id: true, senderId: true },
      });

      if (activeBookings.length > 0) {
        await tx.booking.updateMany({
          where: { tripId: id, status: { in: ['pending', 'accepted'] } },
          data: { status: 'cancelled', cancelledBy: userId, cancelledAt: new Date() },
        });

        for (const booking of activeBookings) {
          this.notifications.sendPushNotification(
            booking.senderId,
            'Booking Cancelled',
            'A booking has been cancelled because the trip was cancelled',
            { type: 'booking_cancelled', bookingId: booking.id }
          );
        }
      }

      // Cancel the trip itself
      return tx.trip.update({
        where: { id },
        data: { status: 'cancelled' },
      });
    });
  }

  async findByUser(userId: string, params?: { page?: number; limit?: number }) {
    const page = Number(params?.page) || 1;
    const limit = Math.min(Number(params?.limit) || 20, 100);
    const skip = (page - 1) * limit;

    const where = { posterId: userId };

    const [data, total] = await Promise.all([
      this.prisma.trip.findMany({
        where,
        include: {
          _count: { select: { offers: true, bookings: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.trip.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
