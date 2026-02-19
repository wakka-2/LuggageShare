import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

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

    return this.prisma.review.findUnique({
      where: { bookingId },
      include: {
        reviewer: {
          select: { id: true, name: true, avatarUrl: true },
        },
        reviewee: {
          select: { id: true, name: true, avatarUrl: true },
        },
      },
    });
  }

  async findByUser(userId: string) {
    return this.prisma.review.findMany({
      where: { revieweeId: userId },
      include: {
        reviewer: {
          select: { id: true, name: true, avatarUrl: true },
        },
        booking: {
          select: {
            id: true,
            listing: {
              select: { departureCity: true, arrivalCity: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(userId: string, bookingId: string, dto: { rating: number; comment?: string }) {
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
      throw new BadRequestException('You can only review delivered bookings');
    }

    // Determine who is being reviewed
    const revieweeId = booking.senderId === userId ? booking.carrierId : booking.senderId;

    // Check if already reviewed
    const existing = await this.prisma.review.findUnique({
      where: { bookingId },
    });

    if (existing) {
      throw new BadRequestException('This booking has already been reviewed');
    }

    if (dto.rating < 1 || dto.rating > 5) {
      throw new BadRequestException('Rating must be between 1 and 5');
    }

    return this.prisma.review.create({
      data: {
        bookingId,
        reviewerId: userId,
        revieweeId,
        rating: dto.rating,
        comment: dto.comment,
      },
      include: {
        reviewer: {
          select: { id: true, name: true, avatarUrl: true },
        },
        reviewee: {
          select: { id: true, name: true, avatarUrl: true },
        },
      },
    });
  }
}
