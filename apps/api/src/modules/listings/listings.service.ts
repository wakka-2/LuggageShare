import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ListingsService {
  constructor(private readonly prisma: PrismaService) {}

  async search(params: {
    from?: string;
    to?: string;
    date?: string;
    minWeight?: number;
  }) {
    const { from, to, date, minWeight } = params;

    return this.prisma.listing.findMany({
      where: {
        status: 'active',
        ...(from && { departureCity: { contains: from, mode: 'insensitive' } }),
        ...(to && { arrivalCity: { contains: to, mode: 'insensitive' } }),
        ...(date && {
          departureDate: {
            gte: new Date(date),
            lt: new Date(new Date(date).setDate(new Date(date).getDate() + 1)),
          },
        }),
        ...(minWeight && { availableWeight: { gte: minWeight } }),
      },
      include: {
        carrier: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
            isVerified: true,
          },
        },
      },
      orderBy: { departureDate: 'asc' },
    });
  }

  async findById(id: string) {
    const listing = await this.prisma.listing.findUnique({
      where: { id },
      include: {
        carrier: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
            isVerified: true,
            bio: true,
            city: true,
          },
        },
      },
    });

    if (!listing) {
      throw new NotFoundException('Listing not found');
    }

    return listing;
  }

  async create(userId: string, createListingDto: any) {
    return this.prisma.listing.create({
      data: {
        ...createListingDto,
        carrierId: userId,
        status: 'active',
      },
    });
  }

  async update(userId: string, id: string, updateListingDto: any) {
    const listing = await this.findById(id);

    if (listing.carrierId !== userId) {
      throw new ForbiddenException('You can only update your own listings');
    }

    return this.prisma.listing.update({
      where: { id },
      data: updateListingDto,
    });
  }

  async delete(userId: string, id: string) {
    const listing = await this.findById(id);

    if (listing.carrierId !== userId) {
      throw new ForbiddenException('You can only delete your own listings');
    }

    return this.prisma.listing.update({
      where: { id },
      data: { status: 'cancelled' },
    });
  }
}
