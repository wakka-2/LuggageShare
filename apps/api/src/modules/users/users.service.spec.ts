import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { UsersService } from './users.service';
import { PrismaService } from '../../prisma/prisma.service';

const mockPrismaService = () => ({
  user: {
    create: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  userSettings: {
    update: jest.fn(),
  },
  review: {
    aggregate: jest.fn(),
  },
});

const USER_ID = 'user-111';

const makeUser = (overrides: Record<string, unknown> = {}) => ({
  id: USER_ID,
  email: 'test@example.com',
  name: 'Test User',
  avatarUrl: null,
  isVerified: false,
  bio: 'Hello',
  city: 'Riyadh',
  phone: '+966500000000',
  googleId: 'google-123',
  appleId: null,
  iban: null,
  bankName: null,
  tosAcceptedAt: null,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
  settings: { language: 'ar', currency: 'SAR', notifications: true },
  ...overrides,
});

describe('UsersService', () => {
  let service: UsersService;
  let prisma: ReturnType<typeof mockPrismaService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService, { provide: PrismaService, useFactory: mockPrismaService }],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prisma = module.get(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a user with default settings', async () => {
      const created = makeUser();
      prisma.user.create.mockResolvedValue(created);

      const result = await service.create({
        email: 'test@example.com',
        name: 'Test User',
        provider: 'google',
      });

      expect(result).toEqual(created);
      expect(prisma.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            email: 'test@example.com',
            settings: {
              create: { language: 'ar', currency: 'SAR', notifications: true },
            },
          }),
        })
      );
    });
  });

  describe('findById', () => {
    it('should return user when found', async () => {
      prisma.user.findUnique.mockResolvedValue(makeUser());

      const result = await service.findById(USER_ID);

      expect(result.id).toBe(USER_ID);
    });

    it('should throw NotFoundException when user not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(service.findById('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByEmail', () => {
    it('should return user when found', async () => {
      prisma.user.findUnique.mockResolvedValue(makeUser());

      const result = await service.findByEmail('test@example.com');

      expect(result?.email).toBe('test@example.com');
    });

    it('should return null when not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      const result = await service.findByEmail('no@example.com');

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update user when found', async () => {
      prisma.user.findUnique.mockResolvedValue(makeUser());
      prisma.user.update.mockResolvedValue(makeUser({ name: 'Updated' }));

      const result = await service.update(USER_ID, { name: 'Updated' });

      expect(result.name).toBe('Updated');
    });

    it('should throw NotFoundException when user not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(service.update('nonexistent', { name: 'Updated' })).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe('getPublicProfile', () => {
    it('should return public fields without PII', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: USER_ID,
        name: 'Test User',
        avatarUrl: null,
        isVerified: false,
        bio: 'Hello',
        city: 'Riyadh',
        createdAt: new Date('2026-01-01'),
        _count: {
          carrierListings: 5,
          carrierBookings: 3,
          senderBookings: 2,
          reviews: 4,
        },
      });
      prisma.review.aggregate.mockResolvedValue({
        _avg: { rating: 4.5 },
        _count: 4,
      });

      const result = await service.getPublicProfile(USER_ID);

      expect(result.name).toBe('Test User');
      expect(result.stats.totalTrips).toBe(5);
      expect(result.stats.averageRating).toBe(4.5);
      // Should NOT contain PII fields
      expect((result as any).email).toBeUndefined();
      expect((result as any).phone).toBeUndefined();
      expect((result as any).iban).toBeUndefined();
      expect((result as any).googleId).toBeUndefined();
    });

    it('should throw NotFoundException when user not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(service.getPublicProfile('nonexistent')).rejects.toThrow(NotFoundException);
    });

    it('should return 0 averageRating when no reviews', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: USER_ID,
        name: 'Test',
        avatarUrl: null,
        isVerified: false,
        bio: null,
        city: null,
        createdAt: new Date(),
        _count: {
          carrierListings: 0,
          carrierBookings: 0,
          senderBookings: 0,
          reviews: 0,
        },
      });
      prisma.review.aggregate.mockResolvedValue({
        _avg: { rating: null },
        _count: 0,
      });

      const result = await service.getPublicProfile(USER_ID);

      expect(result.stats.averageRating).toBe(0);
    });
  });

  describe('requestVerification', () => {
    it('should throw BadRequestException when user already verified', async () => {
      prisma.user.findUnique.mockResolvedValue(makeUser({ isVerified: true }));

      await expect(
        service.requestVerification(USER_ID, {
          documentType: 'national_id',
          documentNumber: '1234567890',
        })
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('acceptTos', () => {
    it('should update tosAcceptedAt', async () => {
      const now = new Date();
      prisma.user.update.mockResolvedValue({
        id: USER_ID,
        tosAcceptedAt: now,
      });

      const result = await service.acceptTos(USER_ID);

      expect(result.tosAcceptedAt).toBe(now);
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: USER_ID },
        data: { tosAcceptedAt: expect.any(Date) },
        select: { id: true, tosAcceptedAt: true },
      });
    });
  });
});
