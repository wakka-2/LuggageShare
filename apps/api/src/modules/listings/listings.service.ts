import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateListingDto } from './dto/create-listing.dto';

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

  async create(userId: string, dto: CreateListingDto) {
    const listing = await this.prisma.listing.create({
      data: {
        type: dto.type ?? 'offer',
        title: dto.title,
        titleAr: dto.titleAr,
        description: dto.description,
        descriptionAr: dto.descriptionAr,
        departureCity: dto.departureCity,
        departureCode: dto.departureCode,
        arrivalCity: dto.arrivalCity,
        arrivalCode: dto.arrivalCode,
        departureDate: new Date(dto.departureDate),
        flightNumber: dto.flightNumber,
        availableWeight: dto.availableWeight,
        priceSmall: dto.priceSmall,
        priceMedium: dto.priceMedium,
        priceLarge: dto.priceLarge,
        negotiable: dto.negotiable ?? false,
        currency: dto.currency ?? 'SAR',
        neededWeight: dto.neededWeight,
        restrictions: dto.restrictions ?? undefined,
        handoffOptions: dto.handoffOptions ?? undefined,
        notes: dto.notes,
        carrierId: userId,
        status: 'active',
        expiresAt: new Date(dto.departureDate),
      },
    });

    return this.transformListing(listing);
  }

  async update(userId: string, id: string, dto: Partial<CreateListingDto>) {
    const listing = await this.prisma.listing.findUnique({ where: { id } });

    if (!listing) {
      throw new NotFoundException('Listing not found');
    }

    if (listing.carrierId !== userId) {
      throw new ForbiddenException('You can only update your own listings');
    }

    const { handoffOptions, departureDate, ...rest } = dto;

    const updated = await this.prisma.listing.update({
      where: { id },
      data: {
        ...rest,
        ...(departureDate && { departureDate: new Date(departureDate) }),
        ...(handoffOptions && { handoffOptions }),
      },
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
