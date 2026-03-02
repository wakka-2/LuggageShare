import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateBookingDto } from './dto/create-booking.dto';

// ---------------------------------------------------------------------------
// Mock factory
// ---------------------------------------------------------------------------
const mockPrismaService = () => ({
  booking: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  listing: {
    findUnique: jest.fn(),
  },
});

// ---------------------------------------------------------------------------
// Reusable test fixtures
// ---------------------------------------------------------------------------
const SENDER_ID = 'user-sender-111';
const CARRIER_ID = 'user-carrier-222';
const UNRELATED_USER_ID = 'user-unrelated-333';
const BOOKING_ID = 'booking-aaa-111';
const LISTING_ID = 'listing-bbb-222';

const makeListing = (overrides: Record<string, unknown> = {}) => ({
  id: LISTING_ID,
  carrierId: CARRIER_ID,
  status: 'active',
  availableWeight: 20, // Prisma Decimal comes back as a value that Number() can cast
  price: 15,
  ...overrides,
});

const makeBooking = (overrides: Record<string, unknown> = {}) => ({
  id: BOOKING_ID,
  senderId: SENDER_ID,
  carrierId: CARRIER_ID,
  listingId: LISTING_ID,
  status: 'pending',
  totalWeight: 5,
  totalPrice: 75,
  cancelledBy: null,
  cancelledAt: null,
  listing: makeListing(),
  sender: { id: SENDER_ID, name: 'Sender', avatarUrl: null, phone: '+1111' },
  carrier: {
    id: CARRIER_ID,
    name: 'Carrier',
    avatarUrl: null,
    phone: '+2222',
  },
  items: [
    {
      id: 'item-1',
      name: 'Winter jacket',
      description: 'Heavy jacket',
      weight: 3,
      value: 100,
      currency: 'SAR',
    },
    {
      id: 'item-2',
      name: 'Shoes',
      description: null,
      weight: 2,
      value: 50,
      currency: 'SAR',
    },
  ],
  ...overrides,
});

const makeCreateDto = (overrides: Partial<CreateBookingDto> = {}): CreateBookingDto => ({
  listingId: LISTING_ID,
  totalWeight: 5,
  items: [
    { name: 'Winter jacket', description: 'Heavy jacket', weight: 3, value: 100, currency: 'SAR' },
    { name: 'Shoes', weight: 2, value: 50 },
  ],
  ...overrides,
});

// ---------------------------------------------------------------------------
// Test suite
// ---------------------------------------------------------------------------
describe('BookingsService', () => {
  let service: BookingsService;
  let prisma: ReturnType<typeof mockPrismaService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BookingsService, { provide: PrismaService, useFactory: mockPrismaService }],
    }).compile();

    service = module.get<BookingsService>(BookingsService);
    prisma = module.get(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // =========================================================================
  // findByUser
  // =========================================================================
  describe('findByUser', () => {
    it('should return bookings where user is sender or carrier', async () => {
      const bookings = [makeBooking(), makeBooking({ id: 'booking-2' })];
      prisma.booking.findMany.mockResolvedValue(bookings);

      const result = await service.findByUser(SENDER_ID);

      expect(result).toEqual(bookings);
      expect(prisma.booking.findMany).toHaveBeenCalledWith({
        where: {
          OR: [{ senderId: SENDER_ID }, { carrierId: SENDER_ID }],
        },
        include: {
          listing: true,
          sender: {
            select: { id: true, name: true, avatarUrl: true },
          },
          carrier: {
            select: { id: true, name: true, avatarUrl: true },
          },
          items: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should return empty array when user has no bookings', async () => {
      prisma.booking.findMany.mockResolvedValue([]);

      const result = await service.findByUser(UNRELATED_USER_ID);

      expect(result).toEqual([]);
    });
  });

  // =========================================================================
  // findById
  // =========================================================================
  describe('findById', () => {
    it('should return booking when user is the sender', async () => {
      const booking = makeBooking();
      prisma.booking.findUnique.mockResolvedValue(booking);

      const result = await service.findById(SENDER_ID, BOOKING_ID);

      expect(result).toEqual(booking);
      expect(prisma.booking.findUnique).toHaveBeenCalledWith({
        where: { id: BOOKING_ID },
        include: {
          listing: true,
          sender: {
            select: { id: true, name: true, avatarUrl: true, phone: true },
          },
          carrier: {
            select: { id: true, name: true, avatarUrl: true, phone: true },
          },
          items: true,
        },
      });
    });

    it('should return booking when user is the carrier', async () => {
      prisma.booking.findUnique.mockResolvedValue(makeBooking());

      const result = await service.findById(CARRIER_ID, BOOKING_ID);

      expect(result.carrierId).toBe(CARRIER_ID);
    });

    it('should throw NotFoundException when booking does not exist', async () => {
      prisma.booking.findUnique.mockResolvedValue(null);

      await expect(service.findById(SENDER_ID, 'nonexistent-id')).rejects.toThrow(
        NotFoundException
      );
    });

    it('should throw ForbiddenException when user is neither sender nor carrier', async () => {
      prisma.booking.findUnique.mockResolvedValue(makeBooking());

      await expect(service.findById(UNRELATED_USER_ID, BOOKING_ID)).rejects.toThrow(
        ForbiddenException
      );
    });

    it('should include the correct error message for not found', async () => {
      prisma.booking.findUnique.mockResolvedValue(null);

      await expect(service.findById(SENDER_ID, 'nonexistent-id')).rejects.toThrow(
        'Booking not found'
      );
    });

    it('should include the correct error message for forbidden access', async () => {
      prisma.booking.findUnique.mockResolvedValue(makeBooking());

      await expect(service.findById(UNRELATED_USER_ID, BOOKING_ID)).rejects.toThrow(
        'You do not have access to this booking'
      );
    });
  });

  // =========================================================================
  // create
  // =========================================================================
  describe('create', () => {
    it('should create a booking with the listing flat price', async () => {
      const listing = makeListing({ price: 150, availableWeight: 20 });
      const dto = makeCreateDto({ totalWeight: 5 });
      const expectedPrice = 150; // flat price from listing

      prisma.listing.findUnique.mockResolvedValue(listing);
      prisma.booking.create.mockResolvedValue(makeBooking({ totalPrice: expectedPrice }));

      const result = await service.create(SENDER_ID, dto);

      expect(result.totalPrice).toBe(150);
      expect(prisma.booking.create).toHaveBeenCalledWith({
        data: {
          senderId: SENDER_ID,
          carrierId: CARRIER_ID,
          listingId: LISTING_ID,
          status: 'pending',
          totalWeight: 5,
          totalPrice: expectedPrice,
          items: {
            create: dto.items,
          },
        },
        include: { items: true },
      });
    });

    it('should correctly use flat price from Decimal-like price field', async () => {
      const listing = makeListing({ price: '12.50', availableWeight: '30' });
      const dto = makeCreateDto({ totalWeight: 4 });
      const expectedPrice = 12.5; // flat price, not multiplied by weight

      prisma.listing.findUnique.mockResolvedValue(listing);
      prisma.booking.create.mockResolvedValue(makeBooking({ totalPrice: expectedPrice }));

      await service.create(SENDER_ID, dto);

      expect(prisma.booking.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            totalPrice: expectedPrice,
          }),
        })
      );
    });

    it('should throw NotFoundException when listing does not exist', async () => {
      prisma.listing.findUnique.mockResolvedValue(null);

      await expect(service.create(SENDER_ID, makeCreateDto())).rejects.toThrow(NotFoundException);
      await expect(service.create(SENDER_ID, makeCreateDto())).rejects.toThrow('Listing not found');
    });

    it('should throw BadRequestException when booking own listing', async () => {
      prisma.listing.findUnique.mockResolvedValue(makeListing());

      await expect(service.create(CARRIER_ID, makeCreateDto())).rejects.toThrow(
        BadRequestException
      );
      await expect(service.create(CARRIER_ID, makeCreateDto())).rejects.toThrow(
        'You cannot book your own listing'
      );
    });

    it('should throw BadRequestException when listing is not active', async () => {
      prisma.listing.findUnique.mockResolvedValue(makeListing({ status: 'completed' }));

      await expect(service.create(SENDER_ID, makeCreateDto())).rejects.toThrow(BadRequestException);
      await expect(service.create(SENDER_ID, makeCreateDto())).rejects.toThrow(
        'This listing is no longer available'
      );
    });

    it('should throw BadRequestException when listing is draft', async () => {
      prisma.listing.findUnique.mockResolvedValue(makeListing({ status: 'draft' }));

      await expect(service.create(SENDER_ID, makeCreateDto())).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when weight exceeds available weight', async () => {
      prisma.listing.findUnique.mockResolvedValue(makeListing({ availableWeight: 3 }));

      await expect(service.create(SENDER_ID, makeCreateDto({ totalWeight: 5 }))).rejects.toThrow(
        BadRequestException
      );
    });

    it('should include weight values in error message when weight exceeds available', async () => {
      prisma.listing.findUnique.mockResolvedValue(makeListing({ availableWeight: 3 }));

      await expect(service.create(SENDER_ID, makeCreateDto({ totalWeight: 5 }))).rejects.toThrow(
        /5kg.*exceeds.*3kg/
      );
    });

    it('should throw when weight exceeds available using Decimal-like string values', async () => {
      prisma.listing.findUnique.mockResolvedValue(makeListing({ availableWeight: '2.5' }));

      await expect(service.create(SENDER_ID, makeCreateDto({ totalWeight: 3 }))).rejects.toThrow(
        BadRequestException
      );
    });

    it('should allow booking when weight equals available weight exactly', async () => {
      const listing = makeListing({ availableWeight: 5, price: 10 });
      const dto = makeCreateDto({ totalWeight: 5 });

      prisma.listing.findUnique.mockResolvedValue(listing);
      prisma.booking.create.mockResolvedValue(makeBooking({ totalWeight: 5, totalPrice: 10 }));

      const result = await service.create(SENDER_ID, dto);

      expect(result.totalWeight).toBe(5);
      expect(prisma.booking.create).toHaveBeenCalled();
    });

    it('should set booking status to pending', async () => {
      prisma.listing.findUnique.mockResolvedValue(makeListing());
      prisma.booking.create.mockResolvedValue(makeBooking());

      await service.create(SENDER_ID, makeCreateDto());

      expect(prisma.booking.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: 'pending' }),
        })
      );
    });

    it('should set senderId to the requesting user and carrierId from the listing', async () => {
      prisma.listing.findUnique.mockResolvedValue(makeListing());
      prisma.booking.create.mockResolvedValue(makeBooking());

      await service.create(SENDER_ID, makeCreateDto());

      expect(prisma.booking.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            senderId: SENDER_ID,
            carrierId: CARRIER_ID,
          }),
        })
      );
    });

    it('should pass items via nested create', async () => {
      const dto = makeCreateDto();
      prisma.listing.findUnique.mockResolvedValue(makeListing());
      prisma.booking.create.mockResolvedValue(makeBooking());

      await service.create(SENDER_ID, dto);

      expect(prisma.booking.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            items: { create: dto.items },
          }),
        })
      );
    });

    it('should not call booking.create if listing validation fails', async () => {
      prisma.listing.findUnique.mockResolvedValue(null);

      await expect(service.create(SENDER_ID, makeCreateDto())).rejects.toThrow();

      expect(prisma.booking.create).not.toHaveBeenCalled();
    });
  });

  // =========================================================================
  // accept
  // =========================================================================
  describe('accept', () => {
    it('should accept a pending booking as the carrier', async () => {
      prisma.booking.findUnique.mockResolvedValue(makeBooking({ status: 'pending' }));
      prisma.booking.update.mockResolvedValue(makeBooking({ status: 'accepted' }));

      const result = await service.accept(CARRIER_ID, BOOKING_ID);

      expect(result.status).toBe('accepted');
      expect(prisma.booking.update).toHaveBeenCalledWith({
        where: { id: BOOKING_ID },
        data: { status: 'accepted' },
      });
    });

    it('should throw ForbiddenException when sender tries to accept', async () => {
      prisma.booking.findUnique.mockResolvedValue(makeBooking({ status: 'pending' }));

      await expect(service.accept(SENDER_ID, BOOKING_ID)).rejects.toThrow(ForbiddenException);
      await expect(service.accept(SENDER_ID, BOOKING_ID)).rejects.toThrow(
        'Only the carrier can accept bookings'
      );
    });

    it('should throw ForbiddenException when unrelated user tries to accept', async () => {
      prisma.booking.findUnique.mockResolvedValue(null);

      await expect(service.accept(UNRELATED_USER_ID, BOOKING_ID)).rejects.toThrow();
    });

    it('should throw BadRequestException when booking is already accepted', async () => {
      prisma.booking.findUnique.mockResolvedValue(makeBooking({ status: 'accepted' }));

      await expect(service.accept(CARRIER_ID, BOOKING_ID)).rejects.toThrow(BadRequestException);
      await expect(service.accept(CARRIER_ID, BOOKING_ID)).rejects.toThrow(
        'This booking cannot be accepted'
      );
    });

    it('should throw BadRequestException when booking is rejected', async () => {
      prisma.booking.findUnique.mockResolvedValue(makeBooking({ status: 'rejected' }));

      await expect(service.accept(CARRIER_ID, BOOKING_ID)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when booking is cancelled', async () => {
      prisma.booking.findUnique.mockResolvedValue(makeBooking({ status: 'cancelled' }));

      await expect(service.accept(CARRIER_ID, BOOKING_ID)).rejects.toThrow(BadRequestException);
    });

    it('should not call update when carrier check fails', async () => {
      prisma.booking.findUnique.mockResolvedValue(makeBooking({ status: 'pending' }));

      await expect(service.accept(SENDER_ID, BOOKING_ID)).rejects.toThrow();

      expect(prisma.booking.update).not.toHaveBeenCalled();
    });

    it('should not call update when status check fails', async () => {
      prisma.booking.findUnique.mockResolvedValue(makeBooking({ status: 'accepted' }));

      await expect(service.accept(CARRIER_ID, BOOKING_ID)).rejects.toThrow();

      expect(prisma.booking.update).not.toHaveBeenCalled();
    });
  });

  // =========================================================================
  // reject
  // =========================================================================
  describe('reject', () => {
    it('should reject a pending booking as the carrier', async () => {
      prisma.booking.findUnique.mockResolvedValue(makeBooking({ status: 'pending' }));
      prisma.booking.update.mockResolvedValue(makeBooking({ status: 'rejected' }));

      const result = await service.reject(CARRIER_ID, BOOKING_ID);

      expect(result.status).toBe('rejected');
      expect(prisma.booking.update).toHaveBeenCalledWith({
        where: { id: BOOKING_ID },
        data: { status: 'rejected' },
      });
    });

    it('should throw ForbiddenException when sender tries to reject', async () => {
      prisma.booking.findUnique.mockResolvedValue(makeBooking({ status: 'pending' }));

      await expect(service.reject(SENDER_ID, BOOKING_ID)).rejects.toThrow(ForbiddenException);
      await expect(service.reject(SENDER_ID, BOOKING_ID)).rejects.toThrow(
        'Only the carrier can reject bookings'
      );
    });

    it('should throw BadRequestException when booking is not pending', async () => {
      prisma.booking.findUnique.mockResolvedValue(makeBooking({ status: 'accepted' }));

      await expect(service.reject(CARRIER_ID, BOOKING_ID)).rejects.toThrow(BadRequestException);
      await expect(service.reject(CARRIER_ID, BOOKING_ID)).rejects.toThrow(
        'This booking cannot be rejected'
      );
    });

    it('should throw BadRequestException when booking is already rejected', async () => {
      prisma.booking.findUnique.mockResolvedValue(makeBooking({ status: 'rejected' }));

      await expect(service.reject(CARRIER_ID, BOOKING_ID)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when booking is cancelled', async () => {
      prisma.booking.findUnique.mockResolvedValue(makeBooking({ status: 'cancelled' }));

      await expect(service.reject(CARRIER_ID, BOOKING_ID)).rejects.toThrow(BadRequestException);
    });

    it('should not call update when carrier check fails', async () => {
      prisma.booking.findUnique.mockResolvedValue(makeBooking({ status: 'pending' }));

      await expect(service.reject(SENDER_ID, BOOKING_ID)).rejects.toThrow();

      expect(prisma.booking.update).not.toHaveBeenCalled();
    });
  });

  // =========================================================================
  // cancel
  // =========================================================================
  describe('cancel', () => {
    it('should cancel a pending booking as the sender', async () => {
      prisma.booking.findUnique.mockResolvedValue(makeBooking({ status: 'pending' }));
      prisma.booking.update.mockResolvedValue(
        makeBooking({
          status: 'cancelled',
          cancelledBy: SENDER_ID,
          cancelledAt: expect.any(Date),
        })
      );

      const result = await service.cancel(SENDER_ID, BOOKING_ID);

      expect(result.status).toBe('cancelled');
      expect(result.cancelledBy).toBe(SENDER_ID);
      expect(prisma.booking.update).toHaveBeenCalledWith({
        where: { id: BOOKING_ID },
        data: {
          status: 'cancelled',
          cancelledBy: SENDER_ID,
          cancelledAt: expect.any(Date),
        },
      });
    });

    it('should cancel a pending booking as the carrier', async () => {
      prisma.booking.findUnique.mockResolvedValue(makeBooking({ status: 'pending' }));
      prisma.booking.update.mockResolvedValue(
        makeBooking({
          status: 'cancelled',
          cancelledBy: CARRIER_ID,
          cancelledAt: expect.any(Date),
        })
      );

      const result = await service.cancel(CARRIER_ID, BOOKING_ID);

      expect(result.status).toBe('cancelled');
      expect(result.cancelledBy).toBe(CARRIER_ID);
      expect(prisma.booking.update).toHaveBeenCalledWith({
        where: { id: BOOKING_ID },
        data: {
          status: 'cancelled',
          cancelledBy: CARRIER_ID,
          cancelledAt: expect.any(Date),
        },
      });
    });

    it('should cancel an accepted booking as the sender', async () => {
      prisma.booking.findUnique.mockResolvedValue(makeBooking({ status: 'accepted' }));
      prisma.booking.update.mockResolvedValue(
        makeBooking({
          status: 'cancelled',
          cancelledBy: SENDER_ID,
          cancelledAt: expect.any(Date),
        })
      );

      const result = await service.cancel(SENDER_ID, BOOKING_ID);

      expect(result.status).toBe('cancelled');
    });

    it('should cancel an accepted booking as the carrier', async () => {
      prisma.booking.findUnique.mockResolvedValue(makeBooking({ status: 'accepted' }));
      prisma.booking.update.mockResolvedValue(
        makeBooking({
          status: 'cancelled',
          cancelledBy: CARRIER_ID,
          cancelledAt: expect.any(Date),
        })
      );

      const result = await service.cancel(CARRIER_ID, BOOKING_ID);

      expect(result.status).toBe('cancelled');
      expect(result.cancelledBy).toBe(CARRIER_ID);
    });

    it('should set cancelledAt to a Date instance', async () => {
      prisma.booking.findUnique.mockResolvedValue(makeBooking({ status: 'pending' }));
      prisma.booking.update.mockResolvedValue(makeBooking({ status: 'cancelled' }));

      await service.cancel(SENDER_ID, BOOKING_ID);

      const updateCall = prisma.booking.update.mock.calls[0][0];
      expect(updateCall.data.cancelledAt).toBeInstanceOf(Date);
    });

    it('should throw ForbiddenException when unrelated user tries to cancel', async () => {
      prisma.booking.findUnique.mockResolvedValue(null);

      await expect(service.cancel(UNRELATED_USER_ID, BOOKING_ID)).rejects.toThrow();
    });

    it('should throw BadRequestException when booking is rejected', async () => {
      prisma.booking.findUnique.mockResolvedValue(makeBooking({ status: 'rejected' }));

      await expect(service.cancel(SENDER_ID, BOOKING_ID)).rejects.toThrow(BadRequestException);
      await expect(service.cancel(SENDER_ID, BOOKING_ID)).rejects.toThrow(
        'This booking cannot be cancelled'
      );
    });

    it('should throw BadRequestException when booking is delivered', async () => {
      prisma.booking.findUnique.mockResolvedValue(makeBooking({ status: 'delivered' }));

      await expect(service.cancel(SENDER_ID, BOOKING_ID)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when booking is already cancelled', async () => {
      prisma.booking.findUnique.mockResolvedValue(makeBooking({ status: 'cancelled' }));

      await expect(service.cancel(SENDER_ID, BOOKING_ID)).rejects.toThrow(BadRequestException);
    });

    it('should not call update when status validation fails', async () => {
      prisma.booking.findUnique.mockResolvedValue(makeBooking({ status: 'delivered' }));

      await expect(service.cancel(SENDER_ID, BOOKING_ID)).rejects.toThrow();

      expect(prisma.booking.update).not.toHaveBeenCalled();
    });
  });
});
