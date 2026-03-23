import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('reviews')
@Controller('reviews')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get('booking/:bookingId')
  @ApiOperation({ summary: 'Get review for a booking' })
  @ApiResponse({ status: 200, description: 'Returns the booking review' })
  async getByBooking(@CurrentUser() user: any, @Param('bookingId') bookingId: string) {
    return this.reviewsService.findByBooking(user.id, bookingId);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get reviews for a user' })
  @ApiResponse({ status: 200, description: 'Returns user reviews' })
  async getByUser(@Param('userId') userId: string) {
    return this.reviewsService.findByUser(userId);
  }

  @Post('booking/:bookingId')
  @Throttle({ short: { ttl: 60000, limit: 1 } })
  @ApiOperation({ summary: 'Create a review for a booking' })
  @ApiResponse({ status: 201, description: 'Review created successfully' })
  async create(
    @CurrentUser() user: any,
    @Param('bookingId') bookingId: string,
    @Body() createReviewDto: CreateReviewDto
  ) {
    return this.reviewsService.create(user.id, bookingId, createReviewDto);
  }
}
