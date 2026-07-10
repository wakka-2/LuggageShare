import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateFlightDto } from './dto/create-flight.dto';
import { UpdateFlightDto } from './dto/update-flight.dto';
import { SearchFlightsDto } from './dto/search-flights.dto';

const FLIGHT_INCLUDE = {
  poster: {
    select: { id: true, name: true, avatarUrl: true, isVerified: true, city: true },
  },
  _count: {
    select: { offers: true, bookings: true },
  },
};

@Injectable()
export class FlightsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService
  ) {}

  async search(dto: SearchFlightsDto) {
    const page = Number(dto.page) || 1;
    const limit = Math.min(Number(dto.limit) || 20, 100);
    const skip = (page - 1) * limit;

    const where: any = {
      status: 'active',
      departureDate: { gte: new Date() },
    };

    if (dto.from) {
      where.departureCity = { contains: dto.from, mode: 'insensitive' };
    }
    if (dto.to) {
      where.arrivalCity = { contains: dto.to, mode: 'insensitive' };
    }
    if (dto.date) {
      const flex = dto.flex === 1 || dto.flex === 3 ? dto.flex : 0;
      const start = new Date(dto.date);
      start.setDate(start.getDate() - flex);
      start.setHours(0, 0, 0, 0);
      const end = new Date(dto.date);
      end.setDate(end.getDate() + flex);
      end.setHours(23, 59, 59, 999);
      // Never search into the past.
      const now = new Date();
      where.departureDate = { gte: start < now ? now : start, lte: end };
    }
    if (dto.minWeight) {
      where.remainingWeight = { gte: dto.minWeight };
    }

    const [data, total] = await Promise.all([
      this.prisma.flight.findMany({
        where,
        include: FLIGHT_INCLUDE,
        orderBy: { departureDate: 'asc' },
        skip,
        take: limit,
      }),
      this.prisma.flight.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findById(id: string) {
    const flight = await this.prisma.flight.findUnique({
      where: { id },
      include: FLIGHT_INCLUDE,
    });

    if (!flight) {
      throw new NotFoundException('Flight not found');
    }

    return flight;
  }

  async findMyFlights(userId: string, params?: { page?: number; limit?: number }) {
    const page = Number(params?.page) || 1;
    const limit = Math.min(Number(params?.limit) || 20, 100);
    const skip = (page - 1) * limit;

    const where = { posterId: userId };

    const [data, total] = await Promise.all([
      this.prisma.flight.findMany({
        where,
        include: {
          ...FLIGHT_INCLUDE,
          offers: {
            select: { id: true, status: true, offeredWeight: true, offeredPrice: true },
          },
        },
        orderBy: { departureDate: 'asc' },
        skip,
        take: limit,
      }),
      this.prisma.flight.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async create(userId: string, dto: CreateFlightDto) {
    const departureDate = new Date(dto.departureDate);
    const minDeparture = new Date();
    minDeparture.setHours(minDeparture.getHours() + 24);

    if (departureDate < minDeparture) {
      throw new BadRequestException('Departure date must be at least 24 hours from now');
    }

    return this.prisma.flight.create({
      data: {
        posterId: userId,
        departureCity: dto.departureCity,
        departureCode: dto.departureCode,
        arrivalCity: dto.arrivalCity,
        arrivalCode: dto.arrivalCode,
        departureDate,
        flightNumber: dto.flightNumber,
        availableWeight: dto.availableWeight,
        remainingWeight: dto.availableWeight, // starts full
        suggestedPrice: dto.suggestedPrice,
        currency: dto.currency ?? 'SAR',
        notes: dto.notes,
      },
      include: FLIGHT_INCLUDE,
    });
  }

  async update(userId: string, id: string, dto: UpdateFlightDto) {
    const flight = await this.prisma.flight.findUnique({ where: { id } });

    if (!flight) throw new NotFoundException('Flight not found');
    if (flight.posterId !== userId)
      throw new ForbiddenException('Only the poster can update this flight');

    // Cannot update once any offer has been accepted
    const acceptedOffer = await this.prisma.offer.findFirst({
      where: { flightId: id, status: 'accepted' },
    });
    if (acceptedOffer) {
      throw new BadRequestException('Cannot update a flight that has accepted offers');
    }

    return this.prisma.flight.update({
      where: { id },
      data: {
        ...(dto.departureCity && { departureCity: dto.departureCity }),
        ...(dto.departureCode !== undefined && { departureCode: dto.departureCode }),
        ...(dto.arrivalCity && { arrivalCity: dto.arrivalCity }),
        ...(dto.arrivalCode !== undefined && { arrivalCode: dto.arrivalCode }),
        ...(dto.departureDate && { departureDate: new Date(dto.departureDate) }),
        ...(dto.flightNumber !== undefined && { flightNumber: dto.flightNumber }),
        ...(dto.suggestedPrice !== undefined && { suggestedPrice: dto.suggestedPrice }),
        ...(dto.currency && { currency: dto.currency }),
        ...(dto.notes !== undefined && { notes: dto.notes }),
      },
      include: FLIGHT_INCLUDE,
    });
  }

  async cancel(userId: string, id: string) {
    const flight = await this.prisma.flight.findUnique({
      where: { id },
      include: {
        offers: {
          where: { status: 'pending' },
          include: { sender: { select: { id: true } } },
        },
        bookings: {
          where: { status: { in: ['pending', 'accepted', 'picked_up', 'in_transit'] } },
          include: {
            sender: { select: { id: true } },
            carrier: { select: { id: true } },
          },
        },
      },
    });

    if (!flight) throw new NotFoundException('Flight not found');
    if (flight.posterId !== userId)
      throw new ForbiddenException('Only the poster can cancel this flight');
    if (flight.status === 'cancelled') throw new BadRequestException('Flight is already cancelled');

    await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Cancel the flight
      await tx.flight.update({ where: { id }, data: { status: 'cancelled' } });

      // Reject all pending offers
      if (flight.offers.length > 0) {
        await tx.offer.updateMany({
          where: { flightId: id, status: 'pending' },
          data: { status: 'rejected' },
        });
      }

      // Cancel all active bookings
      if (flight.bookings.length > 0) {
        await tx.booking.updateMany({
          where: {
            flightId: id,
            status: { in: ['pending', 'accepted', 'picked_up', 'in_transit'] },
          },
          data: { status: 'cancelled', cancelledBy: userId, cancelledAt: new Date() },
        });
      }
    });

    // Send notifications outside transaction
    const notifyIds = new Set<string>();
    flight.offers.forEach((o: any) => notifyIds.add(o.sender.id));
    flight.bookings.forEach((b: any) => {
      notifyIds.add(b.sender.id);
    });
    notifyIds.delete(userId);

    await Promise.all(
      [...notifyIds].map((recipientId) =>
        this.notifications.sendPushNotification(
          recipientId,
          'Flight Cancelled',
          'A flight you have an offer on has been cancelled by the poster',
          { type: 'flight_cancelled', flightId: id }
        )
      )
    );

    return { success: true };
  }
}
