import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateRequestDto } from './dto/create-request.dto';
import { UpdateRequestDto } from './dto/update-request.dto';

@Injectable()
export class RequestsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService
  ) {}

  async search(params: {
    from?: string;
    to?: string;
    date?: string;
    maxWeight?: number;
    page?: number;
    limit?: number;
  }) {
    const { from, to, date, maxWeight } = params;
    const page = Number(params.page) || 1;
    const limit = Math.min(Number(params.limit) || 20, 100);
    const skip = (page - 1) * limit;

    const where = {
      status: 'active' as const,
      ...(from && { departureCity: { contains: from, mode: 'insensitive' as const } }),
      ...(to && { arrivalCity: { contains: to, mode: 'insensitive' as const } }),
      ...(date && {
        neededByDate: {
          gte: new Date(date),
        },
      }),
      ...(maxWeight && { weight: { lte: maxWeight } }),
    };

    const [data, total] = await Promise.all([
      this.prisma.request.findMany({
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
        orderBy: { neededByDate: 'asc' },
        skip,
        take: limit,
      }),
      this.prisma.request.count({ where }),
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
    const request = await this.prisma.request.findUnique({
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

    if (!request) {
      throw new NotFoundException('Request not found');
    }

    return request;
  }

  async create(userId: string, dto: CreateRequestDto) {
    if (!dto.prohibitedItemsDeclared) {
      throw new BadRequestException(
        'You must declare that your items do not include prohibited items'
      );
    }

    return this.prisma.request.create({
      data: {
        posterId: userId,
        status: 'active',
        departureCity: dto.departureCity,
        departureCode: dto.departureCode,
        arrivalCity: dto.arrivalCity,
        arrivalCode: dto.arrivalCode,
        neededByDate: new Date(dto.neededByDate),
        weight: dto.weight,
        budget: dto.budget,
        currency: dto.currency || 'SAR',
        description: dto.description,
        itemTypes: dto.itemTypes as any,
        prohibitedItemsDeclared: dto.prohibitedItemsDeclared,
      },
    });
  }

  async update(userId: string, id: string, dto: UpdateRequestDto) {
    const request = await this.findById(id);

    if (request.posterId !== userId) {
      throw new ForbiddenException('You can only update your own requests');
    }

    if (request.status !== 'active') {
      throw new BadRequestException('Only active requests can be updated');
    }

    // Check for accepted offers
    const acceptedOffers = await this.prisma.offer.count({
      where: { requestId: id, status: 'accepted' },
    });
    if (acceptedOffers > 0) {
      throw new BadRequestException('Cannot update request with accepted offers');
    }

    // Explicit field mapping — prevent mass assignment
    const allowedUpdates: Record<string, any> = {};
    const allowedFields = [
      'departureCity',
      'departureCode',
      'arrivalCity',
      'arrivalCode',
      'neededByDate',
      'weight',
      'budget',
      'currency',
      'description',
      'itemTypes',
    ];
    const dtoRecord = dto as Record<string, any>;
    for (const field of allowedFields) {
      if (dtoRecord[field] !== undefined) {
        allowedUpdates[field] =
          field === 'neededByDate' ? new Date(dtoRecord[field]) : dtoRecord[field];
      }
    }

    return this.prisma.request.update({
      where: { id },
      data: allowedUpdates,
    });
  }

  async cancel(userId: string, id: string) {
    const request = await this.findById(id);

    if (request.posterId !== userId) {
      throw new ForbiddenException('You can only cancel your own requests');
    }

    if (!['active'].includes(request.status)) {
      throw new BadRequestException('This request cannot be cancelled');
    }

    // Transaction: cancel request, reject pending offers, cancel pending bookings
    return this.prisma.$transaction(async (tx) => {
      // Reject all pending offers
      const pendingOffers = await tx.offer.findMany({
        where: { requestId: id, status: 'pending' },
        select: { id: true, userId: true },
      });

      if (pendingOffers.length > 0) {
        await tx.offer.updateMany({
          where: { requestId: id, status: 'pending' },
          data: { status: 'rejected' },
        });

        for (const offer of pendingOffers) {
          this.notifications.sendPushNotification(
            offer.userId,
            'Offer Cancelled',
            'The request you made an offer on has been cancelled',
            { type: 'request_cancelled', requestId: id }
          );
        }
      }

      // Cancel pending/accepted bookings linked to this request
      const activeBookings = await tx.booking.findMany({
        where: { requestId: id, status: { in: ['pending', 'accepted'] } },
        select: { id: true, carrierId: true },
      });

      if (activeBookings.length > 0) {
        await tx.booking.updateMany({
          where: { requestId: id, status: { in: ['pending', 'accepted'] } },
          data: { status: 'cancelled', cancelledBy: userId, cancelledAt: new Date() },
        });

        for (const booking of activeBookings) {
          this.notifications.sendPushNotification(
            booking.carrierId,
            'Booking Cancelled',
            'A booking has been cancelled because the request was cancelled',
            { type: 'booking_cancelled', bookingId: booking.id }
          );
        }
      }

      return tx.request.update({
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
      this.prisma.request.findMany({
        where,
        include: {
          _count: { select: { offers: true, bookings: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.request.count({ where }),
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
