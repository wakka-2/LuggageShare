import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateListingDto } from './dto/create-listing.dto';
import { UpdateListingDto } from './dto/update-listing.dto';

// Bilingual city name map — allows searching in both Arabic and English
const CITY_ALIASES: Record<string, string[]> = {
  // Saudi Arabia
  جدة: ['jeddah', 'jiddah', 'jed'],
  الرياض: ['riyadh', 'ruh'],
  مكة: ['makkah', 'mecca'],
  المدينة: ['madinah', 'medina'],
  الدمام: ['dammam', 'dmm'],
  الخبر: ['khobar', 'kbr'],
  تبوك: ['tabuk'],
  أبها: ['abha'],
  جيزان: ['jazan', 'jizan'],
  نجران: ['najran'],
  حائل: ['hail'],
  الطائف: ['taif'],
  ينبع: ['yanbu'],
  // Common international
  القاهرة: ['cairo', 'cai'],
  دبي: ['dubai', 'dxb'],
  اسطنبول: ['istanbul', 'ist'],
  لندن: ['london', 'lhr'],
  باريس: ['paris', 'cdg'],
  عمان: ['amman', 'amm'],
  بيروت: ['beirut', 'bey'],
  الكويت: ['kuwait', 'kwi'],
  الدوحة: ['doha', 'doh'],
  مسقط: ['muscat', 'mct'],
  البحرين: ['bahrain', 'bah'],
};

/** Expand a search term to include its bilingual equivalents */
function expandCitySearch(term: string): string[] {
  const lower = term.toLowerCase().trim();
  const matches: string[] = [term];

  for (const [arabic, aliases] of Object.entries(CITY_ALIASES)) {
    // English name or airport code → add the Arabic name and every English alias
    // (searching "RUH" must also find listings stored as "Riyadh").
    if (aliases.some((a) => a.startsWith(lower) || lower.startsWith(a))) {
      matches.push(arabic, ...aliases);
    }
    // Arabic input → add English equivalents
    if (arabic.includes(term)) {
      matches.push(...aliases);
    }
  }

  return [...new Set(matches)];
}

/** Build an OR filter for a city field with bilingual support and airport codes */
function cityFilter(field: 'departureCity' | 'arrivalCity', term: string) {
  const variants = expandCitySearch(term);
  const codeField = field === 'departureCity' ? 'departureCode' : 'arrivalCode';
  const or: any[] = variants.map((v) => ({
    [field]: { contains: v, mode: 'insensitive' as const },
  }));
  // A 3-letter term may be an IATA code (listings created with the city picker).
  if (/^[a-z]{3}$/i.test(term.trim())) {
    or.push({ [codeField]: { equals: term.trim().toUpperCase() } });
  }
  return or.length === 1 ? or[0] : { OR: or };
}

@Injectable()
export class ListingsService {
  constructor(private readonly prisma: PrismaService) {}

  async search(params: {
    from?: string;
    to?: string;
    date?: string;
    flex?: number;
    minWeight?: number;
    page?: number;
    limit?: number;
  }) {
    const { from, to, date, minWeight } = params;
    const flex = Number(params.flex) === 1 || Number(params.flex) === 3 ? Number(params.flex) : 0;
    const page = Number(params.page) || 1;
    const limit = Math.min(Number(params.limit) || 20, 100);
    const skip = (page - 1) * limit;

    // Use AND array to safely combine multiple OR filters (from + to)
    const andConditions: any[] = [{ status: 'active' as const }];
    if (!date) andConditions.push({ departureDate: { gte: new Date() } });
    if (from) andConditions.push(cityFilter('departureCity', from));
    if (to) andConditions.push(cityFilter('arrivalCity', to));
    if (date) {
      // ±flex-day inclusive window; clamped so it never searches into the past.
      const start = new Date(date);
      start.setDate(start.getDate() - flex);
      const end = new Date(date);
      end.setDate(end.getDate() + flex + 1); // exclusive upper bound
      const now = new Date();
      andConditions.push({
        departureDate: { gte: start < now ? now : start, lt: end },
      });
    }
    if (minWeight) andConditions.push({ availableWeight: { gte: minWeight } });

    const where = { AND: andConditions };

    const [data, total] = await Promise.all([
      this.prisma.listing.findMany({
        where,
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
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.listing.count({ where }),
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

  async findByUser(userId: string, params?: { page?: number; limit?: number }) {
    const page = Number(params?.page) || 1;
    const limit = Math.min(Number(params?.limit) || 20, 100);
    const skip = (page - 1) * limit;

    const where = { carrierId: userId };

    const [data, total] = await Promise.all([
      this.prisma.listing.findMany({
        where,
        include: {
          carrier: {
            select: {
              id: true,
              name: true,
              avatarUrl: true,
              isVerified: true,
            },
          },
          _count: {
            select: { bookings: true },
          },
        },
        orderBy: { departureDate: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.listing.count({ where }),
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

  async create(userId: string, createListingDto: CreateListingDto) {
    // Explicit field mapping — prevent mass assignment
    return this.prisma.listing.create({
      data: {
        carrierId: userId,
        status: 'active',
        departureCity: createListingDto.departureCity,
        arrivalCity: createListingDto.arrivalCity,
        departureCode: createListingDto.departureCode?.trim().toUpperCase() || null,
        arrivalCode: createListingDto.arrivalCode?.trim().toUpperCase() || null,
        departureDate: new Date(createListingDto.departureDate),
        flightNumber: createListingDto.flightNumber,
        availableWeight: createListingDto.availableWeight,
        price: createListingDto.price,
        currency: createListingDto.currency || 'SAR',
        preferences: createListingDto.preferences as any,
        notes: createListingDto.notes,
      },
    });
  }

  async update(userId: string, id: string, updateListingDto: UpdateListingDto) {
    const listing = await this.findById(id);

    if (listing.carrierId !== userId) {
      throw new ForbiddenException('You can only update your own listings');
    }

    // Explicit field mapping — prevent mass assignment
    const allowedUpdates: Record<string, any> = {};
    const allowedFields = [
      'departureCity',
      'arrivalCity',
      'departureCode',
      'arrivalCode',
      'departureDate',
      'flightNumber',
      'availableWeight',
      'price',
      'currency',
      'preferences',
      'notes',
    ];
    const dtoRecord = updateListingDto as Record<string, any>;
    for (const field of allowedFields) {
      if (dtoRecord[field] !== undefined) {
        allowedUpdates[field] =
          field === 'departureDate' ? new Date(dtoRecord[field]) : dtoRecord[field];
      }
    }

    return this.prisma.listing.update({
      where: { id },
      data: allowedUpdates,
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
