import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { containsProfanity } from '../../common/utils/content-filter';

// ---------------------------------------------------------------------------
// Module mock – must be hoisted above imports by Jest
// ---------------------------------------------------------------------------
jest.mock('../../common/utils/content-filter', () => ({
  containsProfanity: jest.fn().mockReturnValue(false),
}));

// ---------------------------------------------------------------------------
// Mock factory
// ---------------------------------------------------------------------------
const mockPrismaService = () => ({
  booking: { findUnique: jest.fn() },
  review: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
  },
});

// ---------------------------------------------------------------------------
// Reusable test fixtures
// ---------------------------------------------------------------------------
const SENDER_ID = 'user-sender-111';
const CARRIER_ID = 'user-carrier-222';
const UNRELATED_USER_ID = 'user-unrelated-333';
const BOOKING_ID = 'booking-aaa-111';
const REVIEW_ID = 'review-aaa-111';

const makeBooking = (overrides: Record<string, unknown> = {}) => ({
  id: BOOKING_ID,
  senderId: SENDER_ID,
  carrierId: CARRIER_ID,
  status: 'delivered',
  ...overrides,
});

const makeReview = (overrides: Record<string, unknown> = {}) => ({
  id: REVIEW_ID,
  bookingId: BOOKING_ID,
  reviewerId: SENDER_ID,
  revieweeId: CARRIER_ID,
  rating: 5,
  comment: 'Great carrier!',
  createdAt: new Date('2026-02-20'),
  reviewer: { id: SENDER_ID, name: 'Sender', avatarUrl: null },
  reviewee: { id: CARRIER_ID, name: 'Carrier', avatarUrl: null },
  ...overrides,
});

const makeCreateDto = (overrides: Partial<CreateReviewDto> = {}): CreateReviewDto => ({
  rating: 5,
  comment: 'Great service!',
  ...overrides,
});

// ---------------------------------------------------------------------------
// Test suite
// ---------------------------------------------------------------------------
describe('ReviewsService', () => {
  let service: ReviewsService;
  let prisma: ReturnType<typeof mockPrismaService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ReviewsService, { provide: PrismaService, useFactory: mockPrismaService }],
    }).compile();

    service = module.get<ReviewsService>(ReviewsService);
    prisma = module.get(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // =========================================================================
  // findByBooking
  // =========================================================================
  describe('findByBooking', () => {
    it('should return the review for a booking when user is the sender', async () => {
      const booking = makeBooking();
      const review = makeReview();
      prisma.booking.findUnique.mockResolvedValue(booking);
      prisma.review.findUnique.mockResolvedValue(review);

      const result = await service.findByBooking(SENDER_ID, BOOKING_ID);

      expect(result).toEqual(review);
      expect(prisma.booking.findUnique).toHaveBeenCalledWith({
        where: { id: BOOKING_ID },
      });
      expect(prisma.review.findUnique).toHaveBeenCalledWith({
        where: { bookingId: BOOKING_ID },
        include: {
          reviewer: {
            select: { id: true, name: true, avatarUrl: true },
          },
          reviewee: {
            select: { id: true, name: true, avatarUrl: true },
          },
        },
      });
    });

    it('should return the review for a booking when user is the carrier', async () => {
      prisma.booking.findUnique.mockResolvedValue(makeBooking());
      prisma.review.findUnique.mockResolvedValue(makeReview());

      const result = await service.findByBooking(CARRIER_ID, BOOKING_ID);

      expect(result).toBeDefined();
    });

    it('should return null when no review exists for the booking', async () => {
      prisma.booking.findUnique.mockResolvedValue(makeBooking());
      prisma.review.findUnique.mockResolvedValue(null);

      const result = await service.findByBooking(SENDER_ID, BOOKING_ID);

      expect(result).toBeNull();
    });

    it('should throw NotFoundException when booking does not exist', async () => {
      prisma.booking.findUnique.mockResolvedValue(null);

      await expect(service.findByBooking(SENDER_ID, 'nonexistent-id')).rejects.toThrow(
        NotFoundException
      );
    });

    it('should include the correct error message for not found', async () => {
      prisma.booking.findUnique.mockResolvedValue(null);

      await expect(service.findByBooking(SENDER_ID, 'nonexistent-id')).rejects.toThrow(
        'Booking not found'
      );
    });

    it('should throw ForbiddenException when user is neither sender nor carrier', async () => {
      prisma.booking.findUnique.mockResolvedValue(makeBooking());

      await expect(service.findByBooking(UNRELATED_USER_ID, BOOKING_ID)).rejects.toThrow(
        ForbiddenException
      );
    });

    it('should include the correct error message for forbidden access', async () => {
      prisma.booking.findUnique.mockResolvedValue(makeBooking());

      await expect(service.findByBooking(UNRELATED_USER_ID, BOOKING_ID)).rejects.toThrow(
        'You do not have access to this booking'
      );
    });

    it('should not query reviews when access check fails', async () => {
      prisma.booking.findUnique.mockResolvedValue(makeBooking());

      await expect(service.findByBooking(UNRELATED_USER_ID, BOOKING_ID)).rejects.toThrow();

      expect(prisma.review.findUnique).not.toHaveBeenCalled();
    });
  });

  // =========================================================================
  // findByUser
  // =========================================================================
  describe('findByUser', () => {
    it('should return reviews where the user is the reviewee', async () => {
      const reviews = [makeReview(), makeReview({ id: 'review-2', rating: 4, comment: 'Good' })];
      prisma.review.findMany.mockResolvedValue(reviews);

      const result = await service.findByUser(CARRIER_ID);

      expect(result).toEqual(reviews);
      expect(prisma.review.findMany).toHaveBeenCalledWith({
        where: { revieweeId: CARRIER_ID },
        include: {
          reviewer: {
            select: { id: true, name: true, avatarUrl: true },
          },
          booking: {
            select: {
              id: true,
              listing: {
                select: { departureCity: true, arrivalCity: true },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should return empty array when user has no reviews', async () => {
      prisma.review.findMany.mockResolvedValue([]);

      const result = await service.findByUser(UNRELATED_USER_ID);

      expect(result).toEqual([]);
    });

    it('should order reviews by createdAt descending', async () => {
      prisma.review.findMany.mockResolvedValue([]);

      await service.findByUser(CARRIER_ID);

      const findManyCall = prisma.review.findMany.mock.calls[0][0];
      expect(findManyCall.orderBy).toEqual({ createdAt: 'desc' });
    });
  });

  // =========================================================================
  // create
  // =========================================================================
  describe('create', () => {
    it('should create a review for a delivered booking', async () => {
      const booking = makeBooking({ status: 'delivered' });
      const createdReview = makeReview();
      prisma.booking.findUnique.mockResolvedValue(booking);
      prisma.review.findUnique.mockResolvedValue(null); // no existing review
      prisma.review.create.mockResolvedValue(createdReview);

      const result = await service.create(SENDER_ID, BOOKING_ID, makeCreateDto());

      expect(result).toEqual(createdReview);
      expect(prisma.review.create).toHaveBeenCalledWith({
        data: {
          bookingId: BOOKING_ID,
          reviewerId: SENDER_ID,
          revieweeId: CARRIER_ID,
          rating: 5,
          comment: 'Great service!',
        },
        include: {
          reviewer: {
            select: { id: true, name: true, avatarUrl: true },
          },
          reviewee: {
            select: { id: true, name: true, avatarUrl: true },
          },
        },
      });
    });

    it('should set revieweeId to the carrier when the sender creates the review', async () => {
      prisma.booking.findUnique.mockResolvedValue(makeBooking({ status: 'delivered' }));
      prisma.review.findUnique.mockResolvedValue(null);
      prisma.review.create.mockResolvedValue(makeReview());

      await service.create(SENDER_ID, BOOKING_ID, makeCreateDto());

      const createCall = prisma.review.create.mock.calls[0][0];
      expect(createCall.data.reviewerId).toBe(SENDER_ID);
      expect(createCall.data.revieweeId).toBe(CARRIER_ID);
    });

    it('should set revieweeId to the sender when the carrier creates the review', async () => {
      prisma.booking.findUnique.mockResolvedValue(makeBooking({ status: 'delivered' }));
      prisma.review.findUnique.mockResolvedValue(null);
      prisma.review.create.mockResolvedValue(
        makeReview({ reviewerId: CARRIER_ID, revieweeId: SENDER_ID })
      );

      await service.create(CARRIER_ID, BOOKING_ID, makeCreateDto());

      const createCall = prisma.review.create.mock.calls[0][0];
      expect(createCall.data.reviewerId).toBe(CARRIER_ID);
      expect(createCall.data.revieweeId).toBe(SENDER_ID);
    });

    it('should allow review without a comment', async () => {
      prisma.booking.findUnique.mockResolvedValue(makeBooking({ status: 'delivered' }));
      prisma.review.findUnique.mockResolvedValue(null);
      prisma.review.create.mockResolvedValue(makeReview({ comment: undefined }));

      await service.create(SENDER_ID, BOOKING_ID, makeCreateDto({ comment: undefined }));

      const createCall = prisma.review.create.mock.calls[0][0];
      expect(createCall.data.comment).toBeUndefined();
    });

    // -----------------------------------------------------------------------
    // Validation: booking not found
    // -----------------------------------------------------------------------
    it('should throw NotFoundException when booking not found', async () => {
      prisma.booking.findUnique.mockResolvedValue(null);

      await expect(service.create(SENDER_ID, 'nonexistent-id', makeCreateDto())).rejects.toThrow(
        NotFoundException
      );
    });

    it('should include the correct error message when booking not found', async () => {
      prisma.booking.findUnique.mockResolvedValue(null);

      await expect(service.create(SENDER_ID, 'nonexistent-id', makeCreateDto())).rejects.toThrow(
        'Booking not found'
      );
    });

    // -----------------------------------------------------------------------
    // Validation: user not part of booking
    // -----------------------------------------------------------------------
    it('should throw ForbiddenException when user not part of booking', async () => {
      prisma.booking.findUnique.mockResolvedValue(makeBooking({ status: 'delivered' }));

      await expect(service.create(UNRELATED_USER_ID, BOOKING_ID, makeCreateDto())).rejects.toThrow(
        ForbiddenException
      );
    });

    it('should include the correct error message for forbidden access', async () => {
      prisma.booking.findUnique.mockResolvedValue(makeBooking({ status: 'delivered' }));

      await expect(service.create(UNRELATED_USER_ID, BOOKING_ID, makeCreateDto())).rejects.toThrow(
        'You are not part of this booking'
      );
    });

    // -----------------------------------------------------------------------
    // Validation: booking not delivered
    // -----------------------------------------------------------------------
    it('should throw BadRequestException when booking is not delivered', async () => {
      prisma.booking.findUnique.mockResolvedValue(makeBooking({ status: 'accepted' }));

      await expect(service.create(SENDER_ID, BOOKING_ID, makeCreateDto())).rejects.toThrow(
        BadRequestException
      );
    });

    it('should include the correct error message when booking not delivered', async () => {
      prisma.booking.findUnique.mockResolvedValue(makeBooking({ status: 'accepted' }));

      await expect(service.create(SENDER_ID, BOOKING_ID, makeCreateDto())).rejects.toThrow(
        'You can only review delivered bookings'
      );
    });

    it('should throw BadRequestException when booking is pending', async () => {
      prisma.booking.findUnique.mockResolvedValue(makeBooking({ status: 'pending' }));

      await expect(service.create(SENDER_ID, BOOKING_ID, makeCreateDto())).rejects.toThrow(
        BadRequestException
      );
    });

    it('should throw BadRequestException when booking is cancelled', async () => {
      prisma.booking.findUnique.mockResolvedValue(makeBooking({ status: 'cancelled' }));

      await expect(service.create(SENDER_ID, BOOKING_ID, makeCreateDto())).rejects.toThrow(
        BadRequestException
      );
    });

    it('should throw BadRequestException when booking is in_transit', async () => {
      prisma.booking.findUnique.mockResolvedValue(makeBooking({ status: 'in_transit' }));

      await expect(service.create(SENDER_ID, BOOKING_ID, makeCreateDto())).rejects.toThrow(
        BadRequestException
      );
    });

    // -----------------------------------------------------------------------
    // Validation: already reviewed
    // -----------------------------------------------------------------------
    it('should throw BadRequestException when booking has already been reviewed', async () => {
      prisma.booking.findUnique.mockResolvedValue(makeBooking({ status: 'delivered' }));
      prisma.review.findUnique.mockResolvedValue(makeReview()); // existing review

      await expect(service.create(SENDER_ID, BOOKING_ID, makeCreateDto())).rejects.toThrow(
        BadRequestException
      );
    });

    it('should include the correct error message when already reviewed', async () => {
      prisma.booking.findUnique.mockResolvedValue(makeBooking({ status: 'delivered' }));
      prisma.review.findUnique.mockResolvedValue(makeReview());

      await expect(service.create(SENDER_ID, BOOKING_ID, makeCreateDto())).rejects.toThrow(
        'This booking has already been reviewed'
      );
    });

    // -----------------------------------------------------------------------
    // Validation: invalid rating
    // -----------------------------------------------------------------------
    it('should throw BadRequestException for rating below 1', async () => {
      prisma.booking.findUnique.mockResolvedValue(makeBooking({ status: 'delivered' }));
      prisma.review.findUnique.mockResolvedValue(null);

      await expect(
        service.create(SENDER_ID, BOOKING_ID, makeCreateDto({ rating: 0 }))
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for rating above 5', async () => {
      prisma.booking.findUnique.mockResolvedValue(makeBooking({ status: 'delivered' }));
      prisma.review.findUnique.mockResolvedValue(null);

      await expect(
        service.create(SENDER_ID, BOOKING_ID, makeCreateDto({ rating: 6 }))
      ).rejects.toThrow(BadRequestException);
    });

    it('should include the correct error message for invalid rating', async () => {
      prisma.booking.findUnique.mockResolvedValue(makeBooking({ status: 'delivered' }));
      prisma.review.findUnique.mockResolvedValue(null);

      await expect(
        service.create(SENDER_ID, BOOKING_ID, makeCreateDto({ rating: 0 }))
      ).rejects.toThrow('Rating must be between 1 and 5');
    });

    it('should throw BadRequestException for negative rating', async () => {
      prisma.booking.findUnique.mockResolvedValue(makeBooking({ status: 'delivered' }));
      prisma.review.findUnique.mockResolvedValue(null);

      await expect(
        service.create(SENDER_ID, BOOKING_ID, makeCreateDto({ rating: -1 }))
      ).rejects.toThrow(BadRequestException);
    });

    it('should accept rating of exactly 1', async () => {
      prisma.booking.findUnique.mockResolvedValue(makeBooking({ status: 'delivered' }));
      prisma.review.findUnique.mockResolvedValue(null);
      prisma.review.create.mockResolvedValue(makeReview({ rating: 1 }));

      await service.create(SENDER_ID, BOOKING_ID, makeCreateDto({ rating: 1 }));

      const createCall = prisma.review.create.mock.calls[0][0];
      expect(createCall.data.rating).toBe(1);
    });

    it('should accept rating of exactly 5', async () => {
      prisma.booking.findUnique.mockResolvedValue(makeBooking({ status: 'delivered' }));
      prisma.review.findUnique.mockResolvedValue(null);
      prisma.review.create.mockResolvedValue(makeReview({ rating: 5 }));

      await service.create(SENDER_ID, BOOKING_ID, makeCreateDto({ rating: 5 }));

      const createCall = prisma.review.create.mock.calls[0][0];
      expect(createCall.data.rating).toBe(5);
    });

    // -----------------------------------------------------------------------
    // Validation: profanity
    // -----------------------------------------------------------------------
    it('should throw BadRequestException when comment contains profanity', async () => {
      prisma.booking.findUnique.mockResolvedValue(makeBooking({ status: 'delivered' }));
      prisma.review.findUnique.mockResolvedValue(null);
      (containsProfanity as jest.Mock).mockReturnValueOnce(true);

      await expect(
        service.create(SENDER_ID, BOOKING_ID, makeCreateDto({ comment: 'bad words here' }))
      ).rejects.toThrow(BadRequestException);
    });

    it('should include the correct error message for profanity', async () => {
      prisma.booking.findUnique.mockResolvedValue(makeBooking({ status: 'delivered' }));
      prisma.review.findUnique.mockResolvedValue(null);
      (containsProfanity as jest.Mock).mockReturnValueOnce(true);

      await expect(
        service.create(SENDER_ID, BOOKING_ID, makeCreateDto({ comment: 'bad words here' }))
      ).rejects.toThrow('Review contains inappropriate content');
    });

    it('should not check profanity when comment is not provided', async () => {
      prisma.booking.findUnique.mockResolvedValue(makeBooking({ status: 'delivered' }));
      prisma.review.findUnique.mockResolvedValue(null);
      prisma.review.create.mockResolvedValue(makeReview({ comment: undefined }));

      await service.create(SENDER_ID, BOOKING_ID, makeCreateDto({ comment: undefined }));

      expect(containsProfanity).not.toHaveBeenCalled();
    });

    it('should call containsProfanity with the comment text', async () => {
      prisma.booking.findUnique.mockResolvedValue(makeBooking({ status: 'delivered' }));
      prisma.review.findUnique.mockResolvedValue(null);
      prisma.review.create.mockResolvedValue(makeReview());

      await service.create(
        SENDER_ID,
        BOOKING_ID,
        makeCreateDto({ comment: 'Wonderful experience' })
      );

      expect(containsProfanity).toHaveBeenCalledWith('Wonderful experience');
    });

    // -----------------------------------------------------------------------
    // Guard: no side-effects on validation failure
    // -----------------------------------------------------------------------
    it('should not call review.create when booking not found', async () => {
      prisma.booking.findUnique.mockResolvedValue(null);

      await expect(service.create(SENDER_ID, 'nonexistent-id', makeCreateDto())).rejects.toThrow();

      expect(prisma.review.create).not.toHaveBeenCalled();
    });

    it('should not call review.create when user not part of booking', async () => {
      prisma.booking.findUnique.mockResolvedValue(makeBooking({ status: 'delivered' }));

      await expect(
        service.create(UNRELATED_USER_ID, BOOKING_ID, makeCreateDto())
      ).rejects.toThrow();

      expect(prisma.review.create).not.toHaveBeenCalled();
    });

    it('should not call review.create when booking not delivered', async () => {
      prisma.booking.findUnique.mockResolvedValue(makeBooking({ status: 'accepted' }));

      await expect(service.create(SENDER_ID, BOOKING_ID, makeCreateDto())).rejects.toThrow();

      expect(prisma.review.create).not.toHaveBeenCalled();
    });

    it('should not call review.create when already reviewed', async () => {
      prisma.booking.findUnique.mockResolvedValue(makeBooking({ status: 'delivered' }));
      prisma.review.findUnique.mockResolvedValue(makeReview());

      await expect(service.create(SENDER_ID, BOOKING_ID, makeCreateDto())).rejects.toThrow();

      expect(prisma.review.create).not.toHaveBeenCalled();
    });

    it('should not call review.create when rating is invalid', async () => {
      prisma.booking.findUnique.mockResolvedValue(makeBooking({ status: 'delivered' }));
      prisma.review.findUnique.mockResolvedValue(null);

      await expect(
        service.create(SENDER_ID, BOOKING_ID, makeCreateDto({ rating: 0 }))
      ).rejects.toThrow();

      expect(prisma.review.create).not.toHaveBeenCalled();
    });

    it('should not call review.create when comment contains profanity', async () => {
      prisma.booking.findUnique.mockResolvedValue(makeBooking({ status: 'delivered' }));
      prisma.review.findUnique.mockResolvedValue(null);
      (containsProfanity as jest.Mock).mockReturnValueOnce(true);

      await expect(
        service.create(SENDER_ID, BOOKING_ID, makeCreateDto({ comment: 'bad words' }))
      ).rejects.toThrow();

      expect(prisma.review.create).not.toHaveBeenCalled();
    });
  });
});
