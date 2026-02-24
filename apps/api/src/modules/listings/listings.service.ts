import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateListingDto } from './dto/create-listing.dto';
import { UpdateListingDto } from './dto/update-listing.dto';

@Injectable()
export class ListingsService {
  constructor(private readonly prisma: PrismaService) {}

  private transformListing(listing: any) {
    const { priceSmall, priceMedium, priceLarge, negotiable, ...rest } = listing;
    return {
      ...rest,
      pricing: {
        small: Number(priceSmall),
        medium: Number(priceMedium),
        large: Number(priceLarge),
        negotiable: negotiable ?? false,
      },
    };
  }

  async search(params: {
    from?: string;
    to?: string;
    date?: string;
    minWeight?: number;
    maxPrice?: number;
    type?: string;
  }) {
    const { from, to, date, minWeight, maxPrice, type } = params;

    const listings = await this.prisma.listing.findMany({
      where: {
        status: 'active',
        ...(type && { type }),
        ...(from && { departureCity: { contains: from, mode: 'insensitive' as const } }),
        ...(to && { arrivalCity: { contains: to, mode: 'insensitive' as const } }),
        ...(date && {
          departureDate: {
            gte: new Date(date),
            lt: new Date(new Date(date).setDate(new Date(date).getDate() + 1)),
          },
        }),
        ...(minWeight && { availableWeight: { gte: minWeight } }),
        ...(maxPrice && { priceSmall: { lte: maxPrice } }),
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

    return listings.map((l) => this.transformListing(l));
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

    return this.transformListing(listing);
  }

  async create(userId: string, createListingDto: CreateListingDto) {
    // Explicit field mapping — prevent mass assignment
    return this.prisma.listing.create({
      data: {
        carrierId: userId,
        status: 'active',
        departureCity: createListingDto.departureCity,
        arrivalCity: createListingDto.arrivalCity,
        departureDate: new Date(createListingDto.departureDate),
        flightNumber: createListingDto.flightNumber,
        availableWeight: createListingDto.availableWeight,
        pricePerKg: createListingDto.pricePerKg,
        currency: createListingDto.currency || 'SAR',
        preferences: createListingDto.preferences as any,
        notes: createListingDto.notes,
      },
    });

    return this.transformListing(listing);
  }

  async update(userId: string, id: string, updateListingDto: UpdateListingDto) {
    const listing = await this.findById(id);

    if (listing.carrierId !== userId) {
      throw new ForbiddenException('You can only update your own listings');
    }

    // Explicit field mapping — prevent mass assignment
    const allowedUpdates: Record<string, any> = {};
    const allowedFields = [
      'departureCity', 'arrivalCity', 'departureDate', 'flightNumber',
      'availableWeight', 'pricePerKg', 'currency', 'preferences', 'notes',
    ];
    const dtoRecord = updateListingDto as Record<string, any>;
    for (const field of allowedFields) {
      if (dtoRecord[field] !== undefined) {
        allowedUpdates[field] = field === 'departureDate'
          ? new Date(dtoRecord[field])
          : dtoRecord[field];
      }
    }

    return this.prisma.listing.update({
      where: { id },
      data: allowedUpdates,
    });

    return this.transformListing(updated);
  }

  async delete(userId: string, id: string) {
    const listing = await this.prisma.listing.findUnique({ where: { id } });

    if (!listing) {
      throw new NotFoundException('Listing not found');
    }

    if (listing.carrierId !== userId) {
      throw new ForbiddenException('You can only delete your own listings');
    }

    return this.prisma.listing.update({
      where: { id },
      data: { status: 'cancelled' },
    });
  }
}
