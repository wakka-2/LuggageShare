import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { FlightsService } from './flights.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

// ---------------------------------------------------------------------------
// Mock factory
// ---------------------------------------------------------------------------
const mockPrismaService = () => {
  const mock: any = {
    flight: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn().mockResolvedValue(0),
    },
    offer: {
      findFirst: jest.fn(),
      updateMany: jest.fn(),
    },
    booking: {
      updateMany: jest.fn(),
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
const OTHER_USER = 'user-other-222';
const FLIGHT_ID = 'flight-aaa-111';

const futureDate = () => {
  const d = new Date();
  d.setDate(d.getDate() + 3);
  return d;
};

const pastDate = () => {
  const d = new Date();
  d.setHours(d.getHours() - 1);
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
  departureCode: 'RUH',
  arrivalCity: 'Cairo',
  arrivalCode: 'CAI',
  departureDate: futureDate(),
  flightNumber: 'SV123',
  availableWeight: 20,
  remainingWeight: 15,
  suggestedPrice: 50,
  currency: 'SAR',
  notes: null,
  status: 'active',
  poster: { id: POSTER_ID, name: 'Poster', avatarUrl: null, isVerified: true, city: 'Riyadh' },
  _count: { offers: 2, bookings: 1 },
  offers: [],
  bookings: [],
  ...overrides,
});

const makeCreateDto = (overrides: Record<string, unknown> = {}) => ({
  departureCity: 'Riyadh',
  departureCode: 'RUH',
  arrivalCity: 'Cairo',
  arrivalCode: 'CAI',
  departureDate: futureDate().toISOString(),
  flightNumber: 'SV123',
  availableWeight: 20,
  suggestedPrice: 50,
  currency: 'SAR',
  notes: null,
  ...overrides,
});

// ---------------------------------------------------------------------------
// Test suite
// ---------------------------------------------------------------------------
describe('FlightsService', () => {
  let service: FlightsService;
  let prisma: ReturnType<typeof mockPrismaService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FlightsService,
        { provide: PrismaService, useFactory: mockPrismaService },
        { provide: NotificationsService, useFactory: mockNotificationsService },
      ],
    }).compile();

    service = module.get<FlightsService>(FlightsService);
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
    it('should return paginated results', async () => {
      const flights = [makeFlight(), makeFlight({ id: 'flight-2' })];
      prisma.flight.findMany.mockResolvedValue(flights);
      prisma.flight.count.mockResolvedValue(2);

      const result = await service.search({});

      expect(result.data).toEqual(flights);
      expect(result.meta).toEqual({ total: 2, page: 1, limit: 20, totalPages: 1 });
    });

    it('should filter by departure city (case insensitive)', async () => {
      prisma.flight.findMany.mockResolvedValue([]);
      prisma.flight.count.mockResolvedValue(0);

      await service.search({ from: 'riyadh' });

      const whereArg = prisma.flight.findMany.mock.calls[0][0].where;
      expect(whereArg.departureCity).toEqual({ contains: 'riyadh', mode: 'insensitive' });
    });

    it('should filter by arrival city', async () => {
      prisma.flight.findMany.mockResolvedValue([]);
      prisma.flight.count.mockResolvedValue(0);

      await service.search({ to: 'cairo' });

      const whereArg = prisma.flight.findMany.mock.calls[0][0].where;
      expect(whereArg.arrivalCity).toEqual({ contains: 'cairo', mode: 'insensitive' });
    });

    it('should filter by minimum weight', async () => {
      prisma.flight.findMany.mockResolvedValue([]);
      prisma.flight.count.mockResolvedValue(0);

      await service.search({ minWeight: 5 });

      const whereArg = prisma.flight.findMany.mock.calls[0][0].where;
      expect(whereArg.remainingWeight).toEqual({ gte: 5 });
    });

    it('should cap limit at 100', async () => {
      prisma.flight.findMany.mockResolvedValue([]);
      prisma.flight.count.mockResolvedValue(0);

      const result = await service.search({ limit: 999 });

      expect(result.meta.limit).toBe(100);
    });
  });

  // =========================================================================
  // findById
  // =========================================================================
  describe('findById', () => {
    it('should return the flight', async () => {
      prisma.flight.findUnique.mockResolvedValue(makeFlight());

      const result = await service.findById(FLIGHT_ID);

      expect(result.id).toBe(FLIGHT_ID);
    });

    it('should throw NotFoundException when flight does not exist', async () => {
      prisma.flight.findUnique.mockResolvedValue(null);

      await expect(service.findById('nonexistent')).rejects.toThrow(NotFoundException);
      await expect(service.findById('nonexistent')).rejects.toThrow('Flight not found');
    });
  });

  // =========================================================================
  // findMyFlights
  // =========================================================================
  describe('findMyFlights', () => {
    it('should return paginated flights for the user', async () => {
      prisma.flight.findMany.mockResolvedValue([makeFlight()]);
      prisma.flight.count.mockResolvedValue(1);

      const result = await service.findMyFlights(POSTER_ID);

      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
    });

    it('should respect pagination params', async () => {
      prisma.flight.findMany.mockResolvedValue([]);
      prisma.flight.count.mockResolvedValue(50);

      const result = await service.findMyFlights(POSTER_ID, { page: 3, limit: 10 });

      expect(result.meta.page).toBe(3);
      expect(result.meta.limit).toBe(10);
      expect(result.meta.totalPages).toBe(5);
      expect(prisma.flight.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 20, take: 10 })
      );
    });
  });

  // =========================================================================
  // create
  // =========================================================================
  describe('create', () => {
    it('should create a flight with remainingWeight equal to availableWeight', async () => {
      const dto = makeCreateDto({ availableWeight: 25 });
      prisma.flight.create.mockResolvedValue(
        makeFlight({ availableWeight: 25, remainingWeight: 25 })
      );

      const result = await service.create(POSTER_ID, dto as any);

      expect(prisma.flight.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            posterId: POSTER_ID,
            availableWeight: 25,
            remainingWeight: 25,
          }),
        })
      );
      expect(result.availableWeight).toBe(25);
    });

    it('should throw BadRequestException when departure is less than 24h away', async () => {
      const dto = makeCreateDto({ departureDate: nearDate().toISOString() });

      await expect(service.create(POSTER_ID, dto as any)).rejects.toThrow(BadRequestException);
      await expect(service.create(POSTER_ID, dto as any)).rejects.toThrow(
        'Departure date must be at least 24 hours from now'
      );
    });

    it('should throw BadRequestException when departure is in the past', async () => {
      const dto = makeCreateDto({ departureDate: pastDate().toISOString() });

      await expect(service.create(POSTER_ID, dto as any)).rejects.toThrow(BadRequestException);
    });

    it('should default currency to SAR when not provided', async () => {
      const dto = makeCreateDto({ currency: undefined });
      prisma.flight.create.mockResolvedValue(makeFlight());

      await service.create(POSTER_ID, dto as any);

      expect(prisma.flight.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ currency: 'SAR' }),
        })
      );
    });

    it('should not call create if validation fails', async () => {
      const dto = makeCreateDto({ departureDate: nearDate().toISOString() });

      await expect(service.create(POSTER_ID, dto as any)).rejects.toThrow();

      expect(prisma.flight.create).not.toHaveBeenCalled();
    });
  });

  // =========================================================================
  // update
  // =========================================================================
  describe('update', () => {
    it('should update the flight when user is poster and no accepted offers', async () => {
      prisma.flight.findUnique.mockResolvedValue(makeFlight());
      prisma.offer.findFirst.mockResolvedValue(null);
      prisma.flight.update.mockResolvedValue(makeFlight({ notes: 'Updated' }));

      const result = await service.update(POSTER_ID, FLIGHT_ID, { notes: 'Updated' } as any);

      expect(result.notes).toBe('Updated');
    });

    it('should throw NotFoundException when flight does not exist', async () => {
      prisma.flight.findUnique.mockResolvedValue(null);

      await expect(service.update(POSTER_ID, 'nonexistent', {} as any)).rejects.toThrow(
        NotFoundException
      );
    });

    it('should throw ForbiddenException when user is not the poster', async () => {
      prisma.flight.findUnique.mockResolvedValue(makeFlight());

      await expect(service.update(OTHER_USER, FLIGHT_ID, {} as any)).rejects.toThrow(
        ForbiddenException
      );
      await expect(service.update(OTHER_USER, FLIGHT_ID, {} as any)).rejects.toThrow(
        'Only the poster can update this flight'
      );
    });

    it('should throw BadRequestException when accepted offers exist', async () => {
      prisma.flight.findUnique.mockResolvedValue(makeFlight());
      prisma.offer.findFirst.mockResolvedValue({ id: 'offer-1', status: 'accepted' });

      await expect(service.update(POSTER_ID, FLIGHT_ID, {} as any)).rejects.toThrow(
        BadRequestException
      );
      await expect(service.update(POSTER_ID, FLIGHT_ID, {} as any)).rejects.toThrow(
        'Cannot update a flight that has accepted offers'
      );
    });

    it('should not call update when validation fails', async () => {
      prisma.flight.findUnique.mockResolvedValue(makeFlight());
      prisma.offer.findFirst.mockResolvedValue({ id: 'offer-1', status: 'accepted' });

      await expect(service.update(POSTER_ID, FLIGHT_ID, {} as any)).rejects.toThrow();

      expect(prisma.flight.update).not.toHaveBeenCalled();
    });
  });

  // =========================================================================
  // cancel
  // =========================================================================
  describe('cancel', () => {
    it('should cancel the flight and reject pending offers', async () => {
      prisma.flight.findUnique.mockResolvedValue(
        makeFlight({
          offers: [{ id: 'o1', status: 'pending', sender: { id: 'sender-1' } }],
          bookings: [],
        })
      );

      const result = await service.cancel(POSTER_ID, FLIGHT_ID);

      expect(result).toEqual({ success: true });
      expect(prisma.flight.update).toHaveBeenCalledWith({
        where: { id: FLIGHT_ID },
        data: { status: 'cancelled' },
      });
      expect(prisma.offer.updateMany).toHaveBeenCalledWith({
        where: { flightId: FLIGHT_ID, status: 'pending' },
        data: { status: 'rejected' },
      });
    });

    it('should cancel active bookings', async () => {
      prisma.flight.findUnique.mockResolvedValue(
        makeFlight({
          offers: [],
          bookings: [
            {
              id: 'b1',
              status: 'accepted',
              sender: { id: 'sender-1' },
              carrier: { id: POSTER_ID },
            },
          ],
        })
      );

      await service.cancel(POSTER_ID, FLIGHT_ID);

      expect(prisma.booking.updateMany).toHaveBeenCalledWith({
        where: {
          flightId: FLIGHT_ID,
          status: { in: ['pending', 'accepted', 'picked_up', 'in_transit'] },
        },
        data: {
          status: 'cancelled',
          cancelledBy: POSTER_ID,
          cancelledAt: expect.any(Date),
        },
      });
    });

    it('should throw NotFoundException when flight does not exist', async () => {
      prisma.flight.findUnique.mockResolvedValue(null);

      await expect(service.cancel(POSTER_ID, FLIGHT_ID)).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when user is not the poster', async () => {
      prisma.flight.findUnique.mockResolvedValue(makeFlight({ offers: [], bookings: [] }));

      await expect(service.cancel(OTHER_USER, FLIGHT_ID)).rejects.toThrow(ForbiddenException);
      await expect(service.cancel(OTHER_USER, FLIGHT_ID)).rejects.toThrow(
        'Only the poster can cancel this flight'
      );
    });

    it('should throw BadRequestException when flight is already cancelled', async () => {
      prisma.flight.findUnique.mockResolvedValue(
        makeFlight({ status: 'cancelled', offers: [], bookings: [] })
      );

      await expect(service.cancel(POSTER_ID, FLIGHT_ID)).rejects.toThrow(BadRequestException);
      await expect(service.cancel(POSTER_ID, FLIGHT_ID)).rejects.toThrow(
        'Flight is already cancelled'
      );
    });

    it('should not cancel bookings if there are none', async () => {
      prisma.flight.findUnique.mockResolvedValue(makeFlight({ offers: [], bookings: [] }));

      await service.cancel(POSTER_ID, FLIGHT_ID);

      expect(prisma.booking.updateMany).not.toHaveBeenCalled();
    });

    it('should not reject offers if there are none', async () => {
      prisma.flight.findUnique.mockResolvedValue(makeFlight({ offers: [], bookings: [] }));

      await service.cancel(POSTER_ID, FLIGHT_ID);

      expect(prisma.offer.updateMany).not.toHaveBeenCalled();
    });
  });
});
