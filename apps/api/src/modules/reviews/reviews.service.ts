import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateReviewDto) {
    // Verify booking exists and user is a participant
    const booking = await this.prisma.booking.findUnique({
      where: { id: dto.bookingId },
      include: {
        listing: { select: { departureCity: true, arrivalCity: true } },
      },
    });

    if (!booking) {
      throw new NotFoundException('الحجز غير موجود');
    }

    if (booking.senderId !== userId && booking.carrierId !== userId) {
      throw new ForbiddenException('ليس لديك صلاحية لتقييم هذا الحجز');
    }

    // Only allow review for delivered/completed bookings
    if (!['delivered', 'completed'].includes(booking.status)) {
      throw new BadRequestException('لا يمكن التقييم إلا بعد اكتمال التوصيل');
    }

    // Check if user already reviewed this booking
    const existingReview = await this.prisma.review.findUnique({
      where: { bookingId: dto.bookingId },
    });

    if (existingReview) {
      throw new BadRequestException('تم تقييم هذا الحجز مسبقاً');
    }

    // Determine reviewee (the other party)
    const revieweeId = booking.senderId === userId ? booking.carrierId : booking.senderId;

    const review = await this.prisma.review.create({
      data: {
        bookingId: dto.bookingId,
        reviewerId: userId,
        revieweeId,
        rating: dto.rating,
        comment: dto.comment,
      },
      include: {
        reviewer: { select: { id: true, name: true, avatarUrl: true } },
        reviewee: { select: { id: true, name: true } },
      },
    });

    return review;
  }

  async getByUser(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      this.prisma.review.findMany({
        where: { revieweeId: userId },
        include: {
          reviewer: { select: { id: true, name: true, avatarUrl: true } },
          booking: {
            select: {
              bookingRef: true,
              listing: {
                select: { departureCity: true, arrivalCity: true },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.review.count({ where: { revieweeId: userId } }),
    ]);

    // Calculate rating summary
    const allRatings = await this.prisma.review.findMany({
      where: { revieweeId: userId },
      select: { rating: true },
    });

    const averageRating =
      allRatings.length > 0
        ? allRatings.reduce((sum, r) => sum + r.rating, 0) / allRatings.length
        : 0;

    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    allRatings.forEach((r) => {
      distribution[r.rating as keyof typeof distribution]++;
    });

    return {
      summary: {
        averageRating: Math.round(averageRating * 10) / 10,
        totalReviews: total,
        ratingDistribution: distribution,
      },
      reviews,
      meta: {
        page,
        limit,
        total,
        hasMore: skip + limit < total,
      },
    };
  }

  async getByBooking(userId: string, bookingId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      throw new NotFoundException('الحجز غير موجود');
    }

    if (booking.senderId !== userId && booking.carrierId !== userId) {
      throw new ForbiddenException('ليس لديك صلاحية للوصول لهذا التقييم');
    }

    const review = await this.prisma.review.findUnique({
      where: { bookingId },
      include: {
        reviewer: { select: { id: true, name: true, avatarUrl: true } },
        reviewee: { select: { id: true, name: true, avatarUrl: true } },
      },
    });

    return review;
  }
}
