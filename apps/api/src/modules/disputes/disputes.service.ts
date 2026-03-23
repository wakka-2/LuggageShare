import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateDisputeDto } from './dto/create-dispute.dto';

@Injectable()
export class DisputesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, bookingId: string, dto: CreateDisputeDto) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.senderId !== userId && booking.carrierId !== userId) {
      throw new ForbiddenException('You are not part of this booking');
    }

    if (booking.status !== 'delivered') {
      throw new BadRequestException('You can only dispute delivered bookings');
    }

    // Check if a dispute already exists for this booking
    const existing = await this.prisma.dispute.findUnique({
      where: { bookingId },
    });

    if (existing) {
      throw new BadRequestException('A dispute has already been filed for this booking');
    }

    return this.prisma.dispute.create({
      data: {
        bookingId,
        reporterId: userId,
        reason: dto.reason,
        description: dto.description,
      },
      include: {
        reporter: {
          select: { id: true, name: true, avatarUrl: true },
        },
        booking: {
          select: {
            id: true,
            status: true,
            listing: {
              select: { departureCity: true, arrivalCity: true },
            },
          },
        },
      },
    });
  }

  async findByBooking(userId: string, bookingId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.senderId !== userId && booking.carrierId !== userId) {
      throw new ForbiddenException('You do not have access to this booking');
    }

    return this.prisma.dispute.findUnique({
      where: { bookingId },
      include: {
        reporter: {
          select: { id: true, name: true, avatarUrl: true },
        },
        booking: {
          select: {
            id: true,
            status: true,
            listing: {
              select: { departureCity: true, arrivalCity: true },
            },
          },
        },
      },
    });
  }

  async findByUser(userId: string) {
    return this.prisma.dispute.findMany({
      where: { reporterId: userId },
      include: {
        booking: {
          select: {
            id: true,
            status: true,
            listing: {
              select: { departureCity: true, arrivalCity: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
