import { Controller, Get, Post, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { SubmitPaymentProofDto } from './dto/submit-payment-proof.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('bookings')
@Controller('bookings')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Get()
  @ApiOperation({ summary: 'Get my bookings' })
  @ApiResponse({ status: 200, description: 'Returns user bookings' })
  async getMyBookings(
    @CurrentUser() user: any,
    @Query('page') page?: number,
    @Query('limit') limit?: number
  ) {
    return this.bookingsService.findByUser(user.id, { page, limit });
  }

  @Get('by-listing/:listingId')
  @ApiOperation({ summary: 'Get bookings for a listing (carrier only)' })
  @ApiResponse({ status: 200, description: 'Returns bookings for the listing' })
  async getByListing(
    @CurrentUser() user: any,
    @Param('listingId') listingId: string,
    @Query('limit') limit?: number
  ) {
    return this.bookingsService.findByListing(user.id, listingId, { limit });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get booking by ID' })
  @ApiResponse({ status: 200, description: 'Returns booking details' })
  async getById(@CurrentUser() user: any, @Param('id') id: string) {
    return this.bookingsService.findById(user.id, id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a booking request' })
  @ApiResponse({ status: 201, description: 'Booking created successfully' })
  async create(@CurrentUser() user: any, @Body() createBookingDto: CreateBookingDto) {
    return this.bookingsService.create(user.id, createBookingDto);
  }

  @Put(':id/accept')
  @ApiOperation({ summary: 'Accept a booking (carrier)' })
  @ApiResponse({ status: 200, description: 'Booking accepted' })
  async accept(@CurrentUser() user: any, @Param('id') id: string) {
    return this.bookingsService.accept(user.id, id);
  }

  @Put(':id/reject')
  @ApiOperation({ summary: 'Reject a booking (carrier)' })
  @ApiResponse({ status: 200, description: 'Booking rejected' })
  async reject(@CurrentUser() user: any, @Param('id') id: string) {
    return this.bookingsService.reject(user.id, id);
  }

  @Post(':id/payment-proof')
  @ApiOperation({ summary: 'Submit payment proof (sender)' })
  @ApiResponse({ status: 200, description: 'Payment proof submitted' })
  async submitPaymentProof(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: SubmitPaymentProofDto
  ) {
    return this.bookingsService.submitPaymentProof(user.id, id, dto);
  }

  @Put(':id/confirm-payment')
  @ApiOperation({ summary: 'Confirm payment received (carrier)' })
  @ApiResponse({ status: 200, description: 'Payment confirmed' })
  async confirmPayment(@CurrentUser() user: any, @Param('id') id: string) {
    return this.bookingsService.confirmPayment(user.id, id);
  }

  @Put(':id/pickup')
  @ApiOperation({ summary: 'Mark items as picked up (carrier)' })
  @ApiResponse({ status: 200, description: 'Booking marked as picked up' })
  async markPickedUp(@CurrentUser() user: any, @Param('id') id: string) {
    return this.bookingsService.markPickedUp(user.id, id);
  }

  @Put(':id/in-transit')
  @ApiOperation({ summary: 'Mark items as in transit (carrier)' })
  @ApiResponse({ status: 200, description: 'Booking marked as in transit' })
  async markInTransit(@CurrentUser() user: any, @Param('id') id: string) {
    return this.bookingsService.markInTransit(user.id, id);
  }

  @Put(':id/deliver')
  @ApiOperation({ summary: 'Mark items as delivered (carrier)' })
  @ApiResponse({ status: 200, description: 'Booking marked as delivered' })
  async markDelivered(@CurrentUser() user: any, @Param('id') id: string) {
    return this.bookingsService.markDelivered(user.id, id);
  }

  @Put(':id/cancel')
  @ApiOperation({ summary: 'Cancel a booking' })
  @ApiResponse({ status: 200, description: 'Booking cancelled' })
  async cancel(@CurrentUser() user: any, @Param('id') id: string) {
    return this.bookingsService.cancel(user.id, id);
  }
}
