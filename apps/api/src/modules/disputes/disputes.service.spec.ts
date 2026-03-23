import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { DisputesService } from './disputes.service';
import { PrismaService } from '../../prisma/prisma.service';

// ---------------------------------------------------------------------------
// Mock factory
// ---------------------------------------------------------------------------
const mockPrismaService = () => ({
  booking: {
    findUnique: jest.fn(),
  },
  dispute: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
  },
});

// ---------------------------------------------------------------------------
// Reusable fixtures
// ---------------------------------------------------------------------------
const SENDER_ID = 'user-sender-111';
const CARRIER_ID = 'user-carrier-222';
const OTHER_USER = 'user-other-333';
const BOOKING_ID = 'booking-aaa-111';
const DISPUTE_ID = 'dispute-bbb-222';

const makeBooking = (overrides: Record<string, unknown> = {}) => ({
  id: BOOKING_ID,
  senderId: SENDER_ID,
  carrierId: CARRIER_ID,
  status: 'delivered',
  ...overrides,
});

const makeDispute = (overrides: Record<string, unknown> = {}) => ({
  id: DISPUTE_ID,
  bookingId: BOOKING_ID,
  reporterId: SENDER_ID,
  reason: 'damaged_items',
  description: 'Items arrived damaged',
  status: 'open',
  reporter: { id: SENDER_ID, name: 'Sender', avatarUrl: null },
  booking: {
    id: BOOKING_ID,
    status: 'delivered',
    listing: { departureCity: 'Riyadh', arrivalCity: 'Cairo' },
  },
  ...overrides,
});

const makeCreateDto = (overrides: Record<string, unknown> = {}) => ({
  reason: 'damaged_items',
  description: 'Items arrived damaged',
  ...overrides,
});

// ---------------------------------------------------------------------------
// Test suite
// ---------------------------------------------------------------------------
describe('DisputesService', () => {
  let service: DisputesService;
  let prisma: ReturnType<typeof mockPrismaService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DisputesService, { provide: PrismaService, useFactory: mockPrismaService }],
    }).compile();

    service = module.get<DisputesService>(DisputesService);
    prisma = module.get(PrismaService);
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
    it('should create a dispute as the sender', async () => {
      prisma.booking.findUnique.mockResolvedValue(makeBooking());
      prisma.dispute.findUnique.mockResolvedValue(null);
      prisma.dispute.create.mockResolvedValue(makeDispute());

      const result = await service.create(SENDER_ID, BOOKING_ID, makeCreateDto() as any);

      expect(result.id).toBe(DISPUTE_ID);
      expect(prisma.dispute.create).toHaveBeenCalledWith({
        data: {
          bookingId: BOOKING_ID,
          reporterId: SENDER_ID,
          reason: 'damaged_items',
          description: 'Items arrived damaged',
        },
        include: expect.any(Object),
      });
    });

    it('should create a dispute as the carrier', async () => {
      prisma.booking.findUnique.mockResolvedValue(makeBooking());
      prisma.dispute.findUnique.mockResolvedValue(null);
      prisma.dispute.create.mockResolvedValue(makeDispute({ reporterId: CARRIER_ID }));

      const result = await service.create(CARRIER_ID, BOOKING_ID, makeCreateDto() as any);

      expect(result.reporterId).toBe(CARRIER_ID);
    });

    it('should throw NotFoundException when booking does not exist', async () => {
      prisma.booking.findUnique.mockResolvedValue(null);

      await expect(
        service.create(SENDER_ID, 'nonexistent', makeCreateDto() as any)
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.create(SENDER_ID, 'nonexistent', makeCreateDto() as any)
      ).rejects.toThrow('Booking not found');
    });

    it('should throw ForbiddenException when user is not part of booking', async () => {
      prisma.booking.findUnique.mockResolvedValue(makeBooking());

      await expect(service.create(OTHER_USER, BOOKING_ID, makeCreateDto() as any)).rejects.toThrow(
        ForbiddenException
      );
      await expect(service.create(OTHER_USER, BOOKING_ID, makeCreateDto() as any)).rejects.toThrow(
        'You are not part of this booking'
      );
    });

    it('should throw BadRequestException when booking is not delivered', async () => {
      prisma.booking.findUnique.mockResolvedValue(makeBooking({ status: 'accepted' }));

      await expect(service.create(SENDER_ID, BOOKING_ID, makeCreateDto() as any)).rejects.toThrow(
        BadRequestException
      );
      await expect(service.create(SENDER_ID, BOOKING_ID, makeCreateDto() as any)).rejects.toThrow(
        'You can only dispute delivered bookings'
      );
    });

    it('should throw BadRequestException when booking is pending', async () => {
      prisma.booking.findUnique.mockResolvedValue(makeBooking({ status: 'pending' }));

      await expect(service.create(SENDER_ID, BOOKING_ID, makeCreateDto() as any)).rejects.toThrow(
        BadRequestException
      );
    });

    it('should throw BadRequestException when dispute already exists', async () => {
      prisma.booking.findUnique.mockResolvedValue(makeBooking());
      prisma.dispute.findUnique.mockResolvedValue(makeDispute());

      await expect(service.create(SENDER_ID, BOOKING_ID, makeCreateDto() as any)).rejects.toThrow(
        BadRequestException
      );
      await expect(service.create(SENDER_ID, BOOKING_ID, makeCreateDto() as any)).rejects.toThrow(
        'A dispute has already been filed for this booking'
      );
    });

    it('should not call create if validation fails', async () => {
      prisma.booking.findUnique.mockResolvedValue(null);

      await expect(service.create(SENDER_ID, BOOKING_ID, makeCreateDto() as any)).rejects.toThrow();

      expect(prisma.dispute.create).not.toHaveBeenCalled();
    });
  });

  // =========================================================================
  // findByBooking
  // =========================================================================
  describe('findByBooking', () => {
    it('should return dispute when user is the sender', async () => {
      prisma.booking.findUnique.mockResolvedValue(makeBooking());
      prisma.dispute.findUnique.mockResolvedValue(makeDispute());

      const result = await service.findByBooking(SENDER_ID, BOOKING_ID);

      expect(result?.id).toBe(DISPUTE_ID);
    });

    it('should return dispute when user is the carrier', async () => {
      prisma.booking.findUnique.mockResolvedValue(makeBooking());
      prisma.dispute.findUnique.mockResolvedValue(makeDispute());

      const result = await service.findByBooking(CARRIER_ID, BOOKING_ID);

      expect(result?.id).toBe(DISPUTE_ID);
    });

    it('should return null when no dispute exists', async () => {
      prisma.booking.findUnique.mockResolvedValue(makeBooking());
      prisma.dispute.findUnique.mockResolvedValue(null);

      const result = await service.findByBooking(SENDER_ID, BOOKING_ID);

      expect(result).toBeNull();
    });

    it('should throw NotFoundException when booking does not exist', async () => {
      prisma.booking.findUnique.mockResolvedValue(null);

      await expect(service.findByBooking(SENDER_ID, 'nonexistent')).rejects.toThrow(
        NotFoundException
      );
    });

    it('should throw ForbiddenException when user is not part of booking', async () => {
      prisma.booking.findUnique.mockResolvedValue(makeBooking());

      await expect(service.findByBooking(OTHER_USER, BOOKING_ID)).rejects.toThrow(
        ForbiddenException
      );
      await expect(service.findByBooking(OTHER_USER, BOOKING_ID)).rejects.toThrow(
        'You do not have access to this booking'
      );
    });
  });

  // =========================================================================
  // findByUser
  // =========================================================================
  describe('findByUser', () => {
    it('should return all disputes reported by the user', async () => {
      prisma.dispute.findMany.mockResolvedValue([makeDispute(), makeDispute({ id: 'dispute-2' })]);

      const result = await service.findByUser(SENDER_ID);

      expect(result).toHaveLength(2);
      expect(prisma.dispute.findMany).toHaveBeenCalledWith({
        where: { reporterId: SENDER_ID },
        include: expect.any(Object),
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should return empty array when user has no disputes', async () => {
      prisma.dispute.findMany.mockResolvedValue([]);

      const result = await service.findByUser(OTHER_USER);

      expect(result).toEqual([]);
    });
  });
});
