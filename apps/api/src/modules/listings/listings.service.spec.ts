import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { ListingsService } from './listings.service';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateListingDto } from './dto/create-listing.dto';
import { UpdateListingDto } from './dto/update-listing.dto';

// ---------------------------------------------------------------------------
// Mock factory
// ---------------------------------------------------------------------------
const mockPrismaService = () => ({
  listing: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    count: jest.fn(),
  },
});

// ---------------------------------------------------------------------------
// Reusable test fixtures
// ---------------------------------------------------------------------------
const CARRIER_ID = 'user-carrier-111';
const OTHER_USER_ID = 'user-other-222';
const LISTING_ID = 'listing-aaa-111';

const makeListing = (overrides: Record<string, unknown> = {}) => ({
  id: LISTING_ID,
  carrierId: CARRIER_ID,
  status: 'active',
  departureCity: 'Riyadh',
  arrivalCity: 'Jeddah',
  departureDate: new Date('2026-03-15'),
  flightNumber: 'SV123',
  availableWeight: 10,
  pricePerKg: 50,
  currency: 'SAR',
  preferences: null,
  notes: null,
  carrier: {
    id: CARRIER_ID,
    name: 'Carrier',
    avatarUrl: null,
    isVerified: false,
    bio: null,
    city: 'Riyadh',
  },
  ...overrides,
});

const makeCreateDto = (overrides: Partial<CreateListingDto> = {}): CreateListingDto => ({
  departureCity: 'Riyadh',
  arrivalCity: 'Jeddah',
  departureDate: '2026-03-15',
  availableWeight: 10,
  pricePerKg: 50,
  ...overrides,
});

const makeUpdateDto = (overrides: Partial<UpdateListingDto> = {}): UpdateListingDto => ({
  ...overrides,
});

// ---------------------------------------------------------------------------
// Test suite
// ---------------------------------------------------------------------------
describe('ListingsService', () => {
  let service: ListingsService;
  let prisma: ReturnType<typeof mockPrismaService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ListingsService, { provide: PrismaService, useFactory: mockPrismaService }],
    }).compile();

    service = module.get<ListingsService>(ListingsService);
    prisma = module.get(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // =========================================================================
  // search
  // =========================================================================
  describe('search', () => {
    it('should return paginated results with default page=1 and limit=20', async () => {
      const listings = [makeListing(), makeListing({ id: 'listing-2' })];
      prisma.listing.findMany.mockResolvedValue(listings);
      prisma.listing.count.mockResolvedValue(2);

      const result = await service.search({});

      expect(result).toEqual({
        data: listings,
        meta: {
          total: 2,
          page: 1,
          limit: 20,
          totalPages: 1,
        },
      });
      expect(prisma.listing.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 0,
          take: 20,
          orderBy: { departureDate: 'asc' },
        })
      );
    });

    it('should calculate correct skip for page 2', async () => {
      prisma.listing.findMany.mockResolvedValue([]);
      prisma.listing.count.mockResolvedValue(0);

      await service.search({ page: 2, limit: 10 });

      expect(prisma.listing.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 10,
          take: 10,
        })
      );
    });

    it('should calculate totalPages correctly', async () => {
      prisma.listing.findMany.mockResolvedValue([]);
      prisma.listing.count.mockResolvedValue(25);

      const result = await service.search({ limit: 10 });

      expect(result.meta.totalPages).toBe(3);
    });

    it('should only return listings with status active', async () => {
      prisma.listing.findMany.mockResolvedValue([]);
      prisma.listing.count.mockResolvedValue(0);

      await service.search({});

      const findManyCall = prisma.listing.findMany.mock.calls[0][0];
      expect(findManyCall.where.status).toBe('active');
    });

    it('should filter by departure city (from) with case-insensitive contains', async () => {
      prisma.listing.findMany.mockResolvedValue([]);
      prisma.listing.count.mockResolvedValue(0);

      await service.search({ from: 'Riyadh' });

      const findManyCall = prisma.listing.findMany.mock.calls[0][0];
      expect(findManyCall.where.departureCity).toEqual({
        contains: 'Riyadh',
        mode: 'insensitive',
      });
    });

    it('should filter by arrival city (to) with case-insensitive contains', async () => {
      prisma.listing.findMany.mockResolvedValue([]);
      prisma.listing.count.mockResolvedValue(0);

      await service.search({ to: 'Jeddah' });

      const findManyCall = prisma.listing.findMany.mock.calls[0][0];
      expect(findManyCall.where.arrivalCity).toEqual({
        contains: 'Jeddah',
        mode: 'insensitive',
      });
    });

    it('should filter by date with gte and lt for a full-day range', async () => {
      prisma.listing.findMany.mockResolvedValue([]);
      prisma.listing.count.mockResolvedValue(0);

      await service.search({ date: '2026-03-15' });

      const findManyCall = prisma.listing.findMany.mock.calls[0][0];
      expect(findManyCall.where.departureDate).toBeDefined();
      expect(findManyCall.where.departureDate.gte).toEqual(new Date('2026-03-15'));
      // lt should be the next day
      const nextDay = new Date('2026-03-16');
      expect(findManyCall.where.departureDate.lt).toEqual(nextDay);
    });

    it('should filter by minimum weight with gte', async () => {
      prisma.listing.findMany.mockResolvedValue([]);
      prisma.listing.count.mockResolvedValue(0);

      await service.search({ minWeight: 5 });

      const findManyCall = prisma.listing.findMany.mock.calls[0][0];
      expect(findManyCall.where.availableWeight).toEqual({ gte: 5 });
    });

    it('should combine multiple filters together', async () => {
      prisma.listing.findMany.mockResolvedValue([]);
      prisma.listing.count.mockResolvedValue(0);

      await service.search({
        from: 'Riyadh',
        to: 'Jeddah',
        minWeight: 5,
      });

      const findManyCall = prisma.listing.findMany.mock.calls[0][0];
      expect(findManyCall.where.status).toBe('active');
      expect(findManyCall.where.departureCity).toEqual({
        contains: 'Riyadh',
        mode: 'insensitive',
      });
      expect(findManyCall.where.arrivalCity).toEqual({
        contains: 'Jeddah',
        mode: 'insensitive',
      });
      expect(findManyCall.where.availableWeight).toEqual({ gte: 5 });
    });

    it('should not add filter fields when params are undefined', async () => {
      prisma.listing.findMany.mockResolvedValue([]);
      prisma.listing.count.mockResolvedValue(0);

      await service.search({});

      const findManyCall = prisma.listing.findMany.mock.calls[0][0];
      expect(findManyCall.where).toEqual({ status: 'active' });
    });

    it('should include carrier select fields in results', async () => {
      prisma.listing.findMany.mockResolvedValue([]);
      prisma.listing.count.mockResolvedValue(0);

      await service.search({});

      const findManyCall = prisma.listing.findMany.mock.calls[0][0];
      expect(findManyCall.include.carrier.select).toEqual({
        id: true,
        name: true,
        avatarUrl: true,
        isVerified: true,
      });
    });

    it('should pass the same where clause to both findMany and count', async () => {
      prisma.listing.findMany.mockResolvedValue([]);
      prisma.listing.count.mockResolvedValue(0);

      await service.search({ from: 'Riyadh' });

      const findManyWhere = prisma.listing.findMany.mock.calls[0][0].where;
      const countWhere = prisma.listing.count.mock.calls[0][0].where;
      expect(findManyWhere).toEqual(countWhere);
    });

    it('should return empty data with zero total when no listings match', async () => {
      prisma.listing.findMany.mockResolvedValue([]);
      prisma.listing.count.mockResolvedValue(0);

      const result = await service.search({ from: 'NonexistentCity' });

      expect(result.data).toEqual([]);
      expect(result.meta.total).toBe(0);
      expect(result.meta.totalPages).toBe(0);
    });
  });

  // =========================================================================
  // findById
  // =========================================================================
  describe('findById', () => {
    it('should return listing when it exists', async () => {
      const listing = makeListing();
      prisma.listing.findUnique.mockResolvedValue(listing);

      const result = await service.findById(LISTING_ID);

      expect(result).toEqual(listing);
      expect(prisma.listing.findUnique).toHaveBeenCalledWith({
        where: { id: LISTING_ID },
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
    });

    it('should throw NotFoundException when listing does not exist', async () => {
      prisma.listing.findUnique.mockResolvedValue(null);

      await expect(service.findById('nonexistent-id')).rejects.toThrow(NotFoundException);
    });

    it('should include the correct error message for not found', async () => {
      prisma.listing.findUnique.mockResolvedValue(null);

      await expect(service.findById('nonexistent-id')).rejects.toThrow('Listing not found');
    });
  });

  // =========================================================================
  // create
  // =========================================================================
  describe('create', () => {
    it('should create a listing with explicit field mapping', async () => {
      const dto = makeCreateDto();
      const createdListing = makeListing();
      prisma.listing.create.mockResolvedValue(createdListing);

      const result = await service.create(CARRIER_ID, dto);

      expect(result).toEqual(createdListing);
      expect(prisma.listing.create).toHaveBeenCalledWith({
        data: {
          carrierId: CARRIER_ID,
          status: 'active',
          departureCity: 'Riyadh',
          arrivalCity: 'Jeddah',
          departureDate: new Date('2026-03-15'),
          flightNumber: undefined,
          availableWeight: 10,
          pricePerKg: 50,
          currency: 'SAR',
          preferences: undefined,
          notes: undefined,
        },
      });
    });

    it('should set status to active', async () => {
      prisma.listing.create.mockResolvedValue(makeListing());

      await service.create(CARRIER_ID, makeCreateDto());

      expect(prisma.listing.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: 'active' }),
        })
      );
    });

    it('should set carrierId to the requesting user', async () => {
      prisma.listing.create.mockResolvedValue(makeListing());

      await service.create(CARRIER_ID, makeCreateDto());

      expect(prisma.listing.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ carrierId: CARRIER_ID }),
        })
      );
    });

    it('should convert departureDate string to a Date object', async () => {
      prisma.listing.create.mockResolvedValue(makeListing());

      await service.create(CARRIER_ID, makeCreateDto({ departureDate: '2026-04-01' }));

      const createCall = prisma.listing.create.mock.calls[0][0];
      expect(createCall.data.departureDate).toEqual(new Date('2026-04-01'));
      expect(createCall.data.departureDate).toBeInstanceOf(Date);
    });

    it('should default currency to SAR when not provided', async () => {
      prisma.listing.create.mockResolvedValue(makeListing());

      await service.create(CARRIER_ID, makeCreateDto());

      expect(prisma.listing.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ currency: 'SAR' }),
        })
      );
    });

    it('should use provided currency when specified', async () => {
      prisma.listing.create.mockResolvedValue(makeListing({ currency: 'USD' }));

      await service.create(CARRIER_ID, makeCreateDto({ currency: 'USD' }));

      expect(prisma.listing.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ currency: 'USD' }),
        })
      );
    });

    it('should pass optional fields when provided', async () => {
      const preferences = { acceptsFragile: true, acceptsElectronics: false };
      const dto = makeCreateDto({
        flightNumber: 'SV456',
        notes: 'Pickup near airport',
        preferences: preferences as any,
      });
      prisma.listing.create.mockResolvedValue(makeListing());

      await service.create(CARRIER_ID, dto);

      expect(prisma.listing.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            flightNumber: 'SV456',
            notes: 'Pickup near airport',
            preferences: preferences,
          }),
        })
      );
    });
  });

  // =========================================================================
  // update
  // =========================================================================
  describe('update', () => {
    it('should update listing when user is the owner', async () => {
      const listing = makeListing();
      prisma.listing.findUnique.mockResolvedValue(listing);
      prisma.listing.update.mockResolvedValue(makeListing({ pricePerKg: 60 }));

      const result = await service.update(
        CARRIER_ID,
        LISTING_ID,
        makeUpdateDto({ pricePerKg: 60 })
      );

      expect(result.pricePerKg).toBe(60);
      expect(prisma.listing.update).toHaveBeenCalledWith({
        where: { id: LISTING_ID },
        data: { pricePerKg: 60 },
      });
    });

    it('should throw ForbiddenException when non-owner tries to update', async () => {
      prisma.listing.findUnique.mockResolvedValue(makeListing());

      await expect(
        service.update(OTHER_USER_ID, LISTING_ID, makeUpdateDto({ pricePerKg: 60 }))
      ).rejects.toThrow(ForbiddenException);
    });

    it('should include the correct error message for forbidden update', async () => {
      prisma.listing.findUnique.mockResolvedValue(makeListing());

      await expect(
        service.update(OTHER_USER_ID, LISTING_ID, makeUpdateDto({ pricePerKg: 60 }))
      ).rejects.toThrow('You can only update your own listings');
    });

    it('should throw NotFoundException when listing does not exist', async () => {
      prisma.listing.findUnique.mockResolvedValue(null);

      await expect(
        service.update(CARRIER_ID, 'nonexistent-id', makeUpdateDto({ pricePerKg: 60 }))
      ).rejects.toThrow(NotFoundException);
    });

    it('should only include allowed fields in the update data', async () => {
      prisma.listing.findUnique.mockResolvedValue(makeListing());
      prisma.listing.update.mockResolvedValue(makeListing());

      // Pass a dto with an extra disallowed field
      const dto = { pricePerKg: 60, carrierId: 'hacker-id' } as any;
      await service.update(CARRIER_ID, LISTING_ID, dto);

      const updateCall = prisma.listing.update.mock.calls[0][0];
      expect(updateCall.data.pricePerKg).toBe(60);
      expect(updateCall.data.carrierId).toBeUndefined();
    });

    it('should convert departureDate string to Date in update', async () => {
      prisma.listing.findUnique.mockResolvedValue(makeListing());
      prisma.listing.update.mockResolvedValue(makeListing());

      await service.update(CARRIER_ID, LISTING_ID, makeUpdateDto({ departureDate: '2026-05-01' }));

      const updateCall = prisma.listing.update.mock.calls[0][0];
      expect(updateCall.data.departureDate).toEqual(new Date('2026-05-01'));
      expect(updateCall.data.departureDate).toBeInstanceOf(Date);
    });

    it('should update multiple allowed fields at once', async () => {
      prisma.listing.findUnique.mockResolvedValue(makeListing());
      prisma.listing.update.mockResolvedValue(makeListing());

      await service.update(
        CARRIER_ID,
        LISTING_ID,
        makeUpdateDto({
          departureCity: 'Dammam',
          arrivalCity: 'Medina',
          availableWeight: 15,
        })
      );

      const updateCall = prisma.listing.update.mock.calls[0][0];
      expect(updateCall.data).toEqual({
        departureCity: 'Dammam',
        arrivalCity: 'Medina',
        availableWeight: 15,
      });
    });

    it('should not call update when ownership check fails', async () => {
      prisma.listing.findUnique.mockResolvedValue(makeListing());

      await expect(
        service.update(OTHER_USER_ID, LISTING_ID, makeUpdateDto({ pricePerKg: 60 }))
      ).rejects.toThrow();

      expect(prisma.listing.update).not.toHaveBeenCalled();
    });

    it('should send empty data object when no allowed fields are provided', async () => {
      prisma.listing.findUnique.mockResolvedValue(makeListing());
      prisma.listing.update.mockResolvedValue(makeListing());

      await service.update(CARRIER_ID, LISTING_ID, makeUpdateDto());

      const updateCall = prisma.listing.update.mock.calls[0][0];
      expect(updateCall.data).toEqual({});
    });
  });

  // =========================================================================
  // delete
  // =========================================================================
  describe('delete', () => {
    it('should soft-delete by setting status to cancelled when user is owner', async () => {
      prisma.listing.findUnique.mockResolvedValue(makeListing());
      prisma.listing.update.mockResolvedValue(makeListing({ status: 'cancelled' }));

      const result = await service.delete(CARRIER_ID, LISTING_ID);

      expect(result.status).toBe('cancelled');
      expect(prisma.listing.update).toHaveBeenCalledWith({
        where: { id: LISTING_ID },
        data: { status: 'cancelled' },
      });
    });

    it('should throw ForbiddenException when non-owner tries to delete', async () => {
      prisma.listing.findUnique.mockResolvedValue(makeListing());

      await expect(service.delete(OTHER_USER_ID, LISTING_ID)).rejects.toThrow(ForbiddenException);
    });

    it('should include the correct error message for forbidden delete', async () => {
      prisma.listing.findUnique.mockResolvedValue(makeListing());

      await expect(service.delete(OTHER_USER_ID, LISTING_ID)).rejects.toThrow(
        'You can only delete your own listings'
      );
    });

    it('should throw NotFoundException when listing does not exist', async () => {
      prisma.listing.findUnique.mockResolvedValue(null);

      await expect(service.delete(CARRIER_ID, 'nonexistent-id')).rejects.toThrow(NotFoundException);
    });

    it('should not call update when ownership check fails', async () => {
      prisma.listing.findUnique.mockResolvedValue(makeListing());

      await expect(service.delete(OTHER_USER_ID, LISTING_ID)).rejects.toThrow();

      expect(prisma.listing.update).not.toHaveBeenCalled();
    });

    it('should not call update when listing is not found', async () => {
      prisma.listing.findUnique.mockResolvedValue(null);

      await expect(service.delete(CARRIER_ID, 'nonexistent-id')).rejects.toThrow();

      expect(prisma.listing.update).not.toHaveBeenCalled();
    });
  });
});
