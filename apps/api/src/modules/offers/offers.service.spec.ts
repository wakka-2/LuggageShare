import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { OffersService } from './offers.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

// ---------------------------------------------------------------------------
// Mock factory
// ---------------------------------------------------------------------------
const mockPrismaService = () => {
  const mock: any = {
    flight: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    offer: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn().mockResolvedValue({ count: 0 }),
      count: jest.fn().mockResolvedValue(0),
    },
    booking: {
      create: jest.fn(),
    },
    $transaction: jest.fn(),
  };
  mock.$transaction.mockImplementation((cb: (tx: typeof mock) => Promise<unknown>) => cb(mock));
  return mock;
};

const mockNotificationsService = () => ({
  sendPushNotification: jest.fn(),
});

// ---------------------------------------------------------------------------
// Reusable fixtures
// ---------------------------------------------------------------------------
const POSTER_ID = 'user-poster-111';
const SENDER_ID = 'user-sender-222';
const OTHER_USER = 'user-other-333';
const FLIGHT_ID = 'flight-aaa-111';
const OFFER_ID = 'offer-bbb-222';

const futureDate = () => {
  const d = new Date();
  d.setDate(d.getDate() + 3);
  return d;
};

const nearDate = () => {
  const d = new Date();
  d.setHours(d.getHours() + 12);
  return d;
};

const makeFlight = (overrides: Record<string, unknown> = {}) => ({
  id: FLIGHT_ID,
  posterId: POSTER_ID,
  departureCity: 'Riyadh',
  arrivalCity: 'Cairo',
  departureDate: futureDate(),
  availableWeight: 20,
  remainingWeight: 15,
  currency: 'SAR',
  status: 'active',
  poster: { id: POSTER_ID, name: 'Poster' },
  ...overrides,
});

const makeOffer = (overrides: Record<string, unknown> = {}) => ({
  id: OFFER_ID,
  flightId: FLIGHT_ID,
  senderId: SENDER_ID,
  offeredWeight: 5,
  offeredPrice: 100,
  currency: 'SAR',
  status: 'pending',
  note: null,
  imageUrls: [],
  flight: {
    id: FLIGHT_ID,
    departureCity: 'Riyadh',
    arrivalCity: 'Cairo',
    poster: { id: POSTER_ID, name: 'Poster', avatarUrl: null },
  },
  sender: { id: SENDER_ID, name: 'Sender', avatarUrl: null, isVerified: false },
  booking: null,
  ...overrides,
});

const makeCreateDto = (overrides: Record<string, unknown> = {}) => ({
  offeredWeight: 5,
  offeredPrice: 100,
  currency: 'SAR',
  note: 'Please handle with care',
  imageUrls: [],
  ...overrides,
});

// ---------------------------------------------------------------------------
// Test suite
// ---------------------------------------------------------------------------
describe('OffersService', () => {
  let service: OffersService;
  let prisma: ReturnType<typeof mockPrismaService>;
  let notifications: ReturnType<typeof mockNotificationsService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OffersService,
        { provide: PrismaService, useFactory: mockPrismaService },
        { provide: NotificationsService, useFactory: mockNotificationsService },
      ],
    }).compile();

    service = module.get<OffersService>(OffersService);
    prisma = module.get(PrismaService);
    notifications = module.get(NotificationsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // =========================================================================
  // create
  // =========================================================================
  describe('create', () => {
    it('should create an offer and notify the poster', async () => {
      prisma.flight.findUnique.mockResolvedValue(makeFlight());
      prisma.offer.findFirst.mockResolvedValue(null);
      prisma.offer.create.mockResolvedValue(makeOffer());

      const result = await service.create(SENDER_ID, FLIGHT_ID, makeCreateDto() as any);

      expect(result.id).toBe(OFFER_ID);
      expect(prisma.offer.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            flightId: FLIGHT_ID,
            senderId: SENDER_ID,
            offeredWeight: 5,
            offeredPrice: 100,
          }),
        })
      );
      expect(notifications.sendPushNotification).toHaveBeenCalledWith(
        POSTER_ID,
        'New Offer on Your Flight',
        expect.stringContaining('Riyadh'),
        expect.objectContaining({ type: 'offer_created' })
      );
    });

    it('should throw NotFoundException when flight does not exist', async () => {
      prisma.flight.findUnique.mockResolvedValue(null);

      await expect(service.create(SENDER_ID, FLIGHT_ID, makeCreateDto() as any)).rejects.toThrow(
        NotFoundException
      );
      await expect(service.create(SENDER_ID, FLIGHT_ID, makeCreateDto() as any)).rejects.toThrow(
        'Flight not found'
      );
    });

    it('should throw BadRequestException when offering on own flight', async () => {
      prisma.flight.findUnique.mockResolvedValue(makeFlight());

      await expect(service.create(POSTER_ID, FLIGHT_ID, makeCreateDto() as any)).rejects.toThrow(
        BadRequestException
      );
      await expect(service.create(POSTER_ID, FLIGHT_ID, makeCreateDto() as any)).rejects.toThrow(
        'You cannot make an offer on your own flight'
      );
    });

    it('should throw BadRequestException when flight is not active', async () => {
      prisma.flight.findUnique.mockResolvedValue(makeFlight({ status: 'completed' }));

      await expect(service.create(SENDER_ID, FLIGHT_ID, makeCreateDto() as any)).rejects.toThrow(
        'This flight is no longer accepting offers'
      );
    });

    it('should throw BadRequestException when less than 24h before departure', async () => {
      prisma.flight.findUnique.mockResolvedValue(makeFlight({ departureDate: nearDate() }));

      await expect(service.create(SENDER_ID, FLIGHT_ID, makeCreateDto() as any)).rejects.toThrow(
        'Cannot submit offers less than 24 hours before departure'
      );
    });

    it('should throw BadRequestException when weight exceeds remaining capacity', async () => {
      prisma.flight.findUnique.mockResolvedValue(makeFlight({ remainingWeight: 3 }));

      await expect(
        service.create(SENDER_ID, FLIGHT_ID, makeCreateDto({ offeredWeight: 5 }) as any)
      ).rejects.toThrow(/exceeds remaining capacity/);
    });

    it('should throw BadRequestException when user has an existing pending offer', async () => {
      prisma.flight.findUnique.mockResolvedValue(makeFlight());
      prisma.offer.findFirst.mockResolvedValue({ id: 'existing-offer' });

      await expect(service.create(SENDER_ID, FLIGHT_ID, makeCreateDto() as any)).rejects.toThrow(
        'You already have a pending offer on this flight'
      );
    });

    it('should use flight currency when not specified in dto', async () => {
      prisma.flight.findUnique.mockResolvedValue(makeFlight({ currency: 'USD' }));
      prisma.offer.findFirst.mockResolvedValue(null);
      prisma.offer.create.mockResolvedValue(makeOffer());

      await service.create(SENDER_ID, FLIGHT_ID, makeCreateDto({ currency: undefined }) as any);

      expect(prisma.offer.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ currency: 'USD' }),
        })
      );
    });

    it('should store imageUrls when provided', async () => {
      const urls = ['https://cdn.example.com/img1.jpg'];
      prisma.flight.findUnique.mockResolvedValue(makeFlight());
      prisma.offer.findFirst.mockResolvedValue(null);
      prisma.offer.create.mockResolvedValue(makeOffer({ imageUrls: urls }));

      await service.create(SENDER_ID, FLIGHT_ID, makeCreateDto({ imageUrls: urls }) as any);

      expect(prisma.offer.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ imageUrls: urls }),
        })
      );
    });
  });

  // =========================================================================
  // findByFlight
  // =========================================================================
  describe('findByFlight', () => {
    it('should return offers when user is the poster', async () => {
      prisma.flight.findUnique.mockResolvedValue({ posterId: POSTER_ID });
      prisma.offer.findMany.mockResolvedValue([makeOffer()]);

      const result = await service.findByFlight(POSTER_ID, FLIGHT_ID);

      expect(result).toHaveLength(1);
    });

    it('should throw NotFoundException when flight does not exist', async () => {
      prisma.flight.findUnique.mockResolvedValue(null);

      await expect(service.findByFlight(POSTER_ID, 'nonexistent')).rejects.toThrow(
        NotFoundException
      );
    });

    it('should throw ForbiddenException when user is not the poster', async () => {
      prisma.flight.findUnique.mockResolvedValue({ posterId: POSTER_ID });

      await expect(service.findByFlight(OTHER_USER, FLIGHT_ID)).rejects.toThrow(ForbiddenException);
      await expect(service.findByFlight(OTHER_USER, FLIGHT_ID)).rejects.toThrow(
        'Only the poster can view offers on this flight'
      );
    });
  });

  // =========================================================================
  // findMyOffers
  // =========================================================================
  describe('findMyOffers', () => {
    it('should return paginated offers for the sender', async () => {
      prisma.offer.findMany.mockResolvedValue([makeOffer()]);
      prisma.offer.count.mockResolvedValue(1);

      const result = await service.findMyOffers(SENDER_ID);

      expect(result.data).toHaveLength(1);
      expect(result.meta).toEqual({ total: 1, page: 1, limit: 20, totalPages: 1 });
    });

    it('should cap limit at 100', async () => {
      prisma.offer.findMany.mockResolvedValue([]);
      prisma.offer.count.mockResolvedValue(0);

      const result = await service.findMyOffers(SENDER_ID, { limit: 999 });

      expect(result.meta.limit).toBe(100);
    });
  });

  // =========================================================================
  // findById
  // =========================================================================
  describe('findById', () => {
    it('should return the offer with includes', async () => {
      prisma.offer.findUnique.mockResolvedValue(makeOffer());

      const result = await service.findById(OFFER_ID);

      expect(result.id).toBe(OFFER_ID);
    });

    it('should throw NotFoundException when offer does not exist', async () => {
      prisma.offer.findUnique.mockResolvedValue(null);

      await expect(service.findById('nonexistent')).rejects.toThrow(NotFoundException);
      await expect(service.findById('nonexistent')).rejects.toThrow('Offer not found');
    });
  });

  // =========================================================================
  // accept (transactional)
  // =========================================================================
  describe('accept', () => {
    beforeEach(() => {
      // findById is called internally — mock offer.findUnique
      prisma.offer.findUnique.mockResolvedValue(makeOffer());
    });

    it('should accept offer, deduct capacity, and create booking', async () => {
      prisma.flight.findUnique.mockResolvedValue(makeFlight({ remainingWeight: 15 }));
      prisma.offer.update.mockResolvedValue(makeOffer({ status: 'accepted' }));
      prisma.offer.findMany.mockResolvedValue([]);
      prisma.booking.create.mockResolvedValue({ id: 'booking-1', status: 'pending' });

      const result = await service.accept(POSTER_ID, OFFER_ID);

      expect(result.id).toBe('booking-1');
      // Flight capacity deducted
      expect(prisma.flight.update).toHaveBeenCalledWith({
        where: { id: FLIGHT_ID },
        data: { remainingWeight: 10, status: 'active' },
      });
      // Offer marked accepted
      expect(prisma.offer.update).toHaveBeenCalledWith({
        where: { id: OFFER_ID },
        data: { status: 'accepted' },
      });
      // Booking created
      expect(prisma.booking.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          offerId: OFFER_ID,
          flightId: FLIGHT_ID,
          senderId: SENDER_ID,
          carrierId: POSTER_ID,
          status: 'pending',
        }),
      });
    });

    it('should set flight status to full when remaining weight hits zero', async () => {
      prisma.offer.findUnique.mockResolvedValue(makeOffer({ offeredWeight: 15 }));
      prisma.flight.findUnique.mockResolvedValue(makeFlight({ remainingWeight: 15 }));
      prisma.offer.update.mockResolvedValue(makeOffer({ status: 'accepted' }));
      prisma.offer.findMany.mockResolvedValue([]);
      prisma.booking.create.mockResolvedValue({ id: 'booking-1' });

      await service.accept(POSTER_ID, OFFER_ID);

      expect(prisma.flight.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ remainingWeight: 0, status: 'full' }),
        })
      );
    });

    it('should auto-reject oversized pending offers after capacity deduction', async () => {
      prisma.flight.findUnique.mockResolvedValue(makeFlight({ remainingWeight: 10 }));
      prisma.offer.update.mockResolvedValue(makeOffer({ status: 'accepted' }));
      prisma.booking.create.mockResolvedValue({ id: 'booking-1' });
      // Oversized offers found
      prisma.offer.findMany.mockResolvedValue([
        { id: 'oversized-1', senderId: 'sender-x' },
        { id: 'oversized-2', senderId: 'sender-y' },
      ]);
      prisma.offer.updateMany.mockResolvedValue({ count: 2 });

      await service.accept(POSTER_ID, OFFER_ID);

      expect(prisma.offer.updateMany).toHaveBeenCalledWith({
        where: { id: { in: ['oversized-1', 'oversized-2'] } },
        data: { status: 'rejected' },
      });
    });

    it('should notify sender of acceptance', async () => {
      prisma.flight.findUnique.mockResolvedValue(makeFlight({ remainingWeight: 15 }));
      prisma.offer.update.mockResolvedValue(makeOffer({ status: 'accepted' }));
      prisma.offer.findMany.mockResolvedValue([]);
      prisma.booking.create.mockResolvedValue({ id: 'booking-1' });

      await service.accept(POSTER_ID, OFFER_ID);

      expect(notifications.sendPushNotification).toHaveBeenCalledWith(
        SENDER_ID,
        'Offer Accepted!',
        expect.any(String),
        expect.objectContaining({ type: 'offer_accepted' })
      );
    });

    it('should throw ForbiddenException when user is not the poster', async () => {
      await expect(service.accept(OTHER_USER, OFFER_ID)).rejects.toThrow(ForbiddenException);
      await expect(service.accept(OTHER_USER, OFFER_ID)).rejects.toThrow(
        'Only the flight poster can accept offers'
      );
    });

    it('should throw BadRequestException when offer is not pending', async () => {
      prisma.offer.findUnique.mockResolvedValue(makeOffer({ status: 'accepted' }));

      await expect(service.accept(POSTER_ID, OFFER_ID)).rejects.toThrow(BadRequestException);
      await expect(service.accept(POSTER_ID, OFFER_ID)).rejects.toThrow(
        /accepted.*cannot be accepted/
      );
    });

    it('should throw BadRequestException when flight is no longer active', async () => {
      prisma.flight.findUnique.mockResolvedValue(makeFlight({ status: 'cancelled' }));

      await expect(service.accept(POSTER_ID, OFFER_ID)).rejects.toThrow(
        'Flight is no longer active'
      );
    });

    it('should throw BadRequestException when insufficient capacity in transaction', async () => {
      prisma.flight.findUnique.mockResolvedValue(makeFlight({ remainingWeight: 3 }));

      await expect(service.accept(POSTER_ID, OFFER_ID)).rejects.toThrow(/Insufficient capacity/);
    });
  });

  // =========================================================================
  // reject
  // =========================================================================
  describe('reject', () => {
    it('should reject a pending offer and notify sender', async () => {
      prisma.offer.findUnique.mockResolvedValue(makeOffer());
      prisma.offer.update.mockResolvedValue(makeOffer({ status: 'rejected' }));

      const result = await service.reject(POSTER_ID, OFFER_ID);

      expect(result).toEqual({ success: true });
      expect(prisma.offer.update).toHaveBeenCalledWith({
        where: { id: OFFER_ID },
        data: { status: 'rejected' },
      });
      expect(notifications.sendPushNotification).toHaveBeenCalledWith(
        SENDER_ID,
        'Offer Not Accepted',
        expect.any(String),
        expect.objectContaining({ type: 'offer_rejected' })
      );
    });

    it('should throw ForbiddenException when user is not the poster', async () => {
      prisma.offer.findUnique.mockResolvedValue(makeOffer());

      await expect(service.reject(OTHER_USER, OFFER_ID)).rejects.toThrow(ForbiddenException);
    });

    it('should throw BadRequestException when offer is not pending', async () => {
      prisma.offer.findUnique.mockResolvedValue(makeOffer({ status: 'withdrawn' }));

      await expect(service.reject(POSTER_ID, OFFER_ID)).rejects.toThrow(BadRequestException);
    });
  });

  // =========================================================================
  // withdraw
  // =========================================================================
  describe('withdraw', () => {
    it('should withdraw a pending offer as the sender', async () => {
      prisma.offer.findUnique.mockResolvedValue(makeOffer());
      prisma.offer.update.mockResolvedValue(makeOffer({ status: 'withdrawn' }));

      const result = await service.withdraw(SENDER_ID, OFFER_ID);

      expect(result).toEqual({ success: true });
      expect(prisma.offer.update).toHaveBeenCalledWith({
        where: { id: OFFER_ID },
        data: { status: 'withdrawn' },
      });
    });

    it('should throw ForbiddenException when user is not the sender', async () => {
      prisma.offer.findUnique.mockResolvedValue(makeOffer());

      await expect(service.withdraw(POSTER_ID, OFFER_ID)).rejects.toThrow(ForbiddenException);
      await expect(service.withdraw(POSTER_ID, OFFER_ID)).rejects.toThrow(
        'Only the offer sender can withdraw it'
      );
    });

    it('should throw BadRequestException when offer is not pending', async () => {
      prisma.offer.findUnique.mockResolvedValue(makeOffer({ status: 'accepted' }));

      await expect(service.withdraw(SENDER_ID, OFFER_ID)).rejects.toThrow(BadRequestException);
      await expect(service.withdraw(SENDER_ID, OFFER_ID)).rejects.toThrow(
        'Only pending offers can be withdrawn'
      );
    });
  });

  // =========================================================================
  // expirePendingOffers
  // =========================================================================
  describe('expirePendingOffers', () => {
    it('should expire pending offers on departed flights and return count', async () => {
      prisma.offer.updateMany.mockResolvedValue({ count: 3 });

      const result = await service.expirePendingOffers();

      expect(result).toBe(3);
      expect(prisma.offer.updateMany).toHaveBeenCalledWith({
        where: {
          status: 'pending',
          flight: { departureDate: { lt: expect.any(Date) } },
        },
        data: { status: 'expired' },
      });
    });

    it('should return 0 when no offers to expire', async () => {
      prisma.offer.updateMany.mockResolvedValue({ count: 0 });

      const result = await service.expirePendingOffers();

      expect(result).toBe(0);
    });
  });
});
