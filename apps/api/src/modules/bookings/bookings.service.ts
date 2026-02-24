import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { SubmitPaymentProofDto } from './dto/submit-payment-proof.dto';

@Injectable()
export class BookingsService {
  constructor(private readonly prisma: PrismaService) {}

  async findByUser(userId: string, params?: { page?: number; limit?: number }) {
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 20;
    const skip = (page - 1) * limit;

    const where = {
      OR: [{ senderId: userId }, { carrierId: userId }],
    };

    const [data, total] = await Promise.all([
      this.prisma.booking.findMany({
        where,
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
        skip,
        take: limit,
      }),
      this.prisma.booking.count({ where }),
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
            iban: true,
            bankName: true,
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

  async create(userId: string, createBookingDto: CreateBookingDto) {
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

    // Validate weight doesn't exceed available
    if (createBookingDto.totalWeight > Number(listing.availableWeight)) {
      throw new BadRequestException(
        `Total weight (${createBookingDto.totalWeight}kg) exceeds available weight (${listing.availableWeight}kg)`
      );
    }

    // Server-side price calculation — never trust client-supplied price
    const totalPrice = Number(listing.pricePerKg) * Number(createBookingDto.totalWeight);

    return this.prisma.booking.create({
      data: {
        senderId: userId,
        carrierId: listing.carrierId,
        listingId: listing.id,
        status: 'pending',
        totalWeight: createBookingDto.totalWeight,
        totalPrice,
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

  async submitPaymentProof(userId: string, id: string, dto: SubmitPaymentProofDto) {
    const booking = await this.findById(userId, id);

    if (booking.senderId !== userId) {
      throw new ForbiddenException('Only the sender can submit payment proof');
    }

    if (booking.status !== 'accepted') {
      throw new BadRequestException('Payment proof can only be submitted for accepted bookings');
    }

    return this.prisma.booking.update({
      where: { id },
      data: {
        paymentProofUrl: dto.proofImageUrl,
        paymentStatus: 'proof_submitted',
      },
    });
  }

  async markPickedUp(userId: string, id: string) {
    const booking = await this.findById(userId, id);

    if (booking.carrierId !== userId) {
      throw new ForbiddenException('Only the carrier can mark items as picked up');
    }

    if (booking.status !== 'accepted') {
      throw new BadRequestException('Booking must be accepted before marking as picked up');
    }

    return this.prisma.booking.update({
      where: { id },
      data: { status: 'picked_up' },
    });
  }

  async markInTransit(userId: string, id: string) {
    const booking = await this.findById(userId, id);

    if (booking.carrierId !== userId) {
      throw new ForbiddenException('Only the carrier can mark items as in transit');
    }

    if (booking.status !== 'picked_up') {
      throw new BadRequestException('Items must be picked up before marking as in transit');
    }

    return this.prisma.booking.update({
      where: { id },
      data: { status: 'in_transit' },
    });
  }

  async markDelivered(userId: string, id: string) {
    const booking = await this.findById(userId, id);

    if (booking.carrierId !== userId) {
      throw new ForbiddenException('Only the carrier can mark items as delivered');
    }

    if (booking.status !== 'in_transit') {
      throw new BadRequestException('Items must be in transit before marking as delivered');
    }

    return this.prisma.booking.update({
      where: { id },
      data: { status: 'delivered' },
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
