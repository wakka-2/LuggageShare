import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class BookingsService {
  constructor(private readonly prisma: PrismaService) {}

  async findByUser(userId: string) {
    return this.prisma.booking.findMany({
      where: {
        OR: [
          { senderId: userId },
          { carrierId: userId },
        ],
      },
      include: {
        listing: true,
        sender: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
        carrier: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
        items: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(userId: string, id: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: {
        listing: true,
        sender: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
            phone: true,
          },
        },
        carrier: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
            phone: true,
          },
        },
        items: true,
      },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.senderId !== userId && booking.carrierId !== userId) {
      throw new ForbiddenException('You do not have access to this booking');
    }

    return booking;
  }

  async create(userId: string, createBookingDto: any) {
    const listing = await this.prisma.listing.findUnique({
      where: { id: createBookingDto.listingId },
    });

    if (!listing) {
      throw new NotFoundException('Listing not found');
    }

    if (listing.carrierId === userId) {
      throw new BadRequestException('You cannot book your own listing');
    }

    if (listing.status !== 'active') {
      throw new BadRequestException('This listing is no longer available');
    }

    return this.prisma.booking.create({
      data: {
        senderId: userId,
        carrierId: listing.carrierId,
        listingId: listing.id,
        status: 'pending',
        totalWeight: createBookingDto.totalWeight,
        totalPrice: createBookingDto.totalPrice,
        items: {
          create: createBookingDto.items,
        },
      },
      include: {
        items: true,
      },
    });
  }

  async accept(userId: string, id: string) {
    const booking = await this.findById(userId, id);

    if (booking.carrierId !== userId) {
      throw new ForbiddenException('Only the carrier can accept bookings');
    }

    if (booking.status !== 'pending') {
      throw new BadRequestException('This booking cannot be accepted');
    }

    return this.prisma.booking.update({
      where: { id },
      data: { status: 'accepted' },
    });
  }

  async reject(userId: string, id: string) {
    const booking = await this.findById(userId, id);

    if (booking.carrierId !== userId) {
      throw new ForbiddenException('Only the carrier can reject bookings');
    }

    if (booking.status !== 'pending') {
      throw new BadRequestException('This booking cannot be rejected');
    }

    return this.prisma.booking.update({
      where: { id },
      data: { status: 'rejected' },
    });
  }

  async cancel(userId: string, id: string) {
    const booking = await this.findById(userId, id);

    if (booking.senderId !== userId && booking.carrierId !== userId) {
      throw new ForbiddenException('You cannot cancel this booking');
    }

    if (!['pending', 'accepted'].includes(booking.status)) {
      throw new BadRequestException('This booking cannot be cancelled');
    }

    return this.prisma.booking.update({
      where: { id },
      data: {
        status: 'cancelled',
        cancelledBy: userId,
        cancelledAt: new Date(),
      },
    });
  }
}
