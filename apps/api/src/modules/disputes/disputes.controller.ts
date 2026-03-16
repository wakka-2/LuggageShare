import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { DisputesService } from './disputes.service';
import { CreateDisputeDto } from './dto/create-dispute.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('disputes')
@Controller('disputes')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DisputesController {
  constructor(private readonly disputesService: DisputesService) {}

  @Post('booking/:bookingId')
  @Throttle({ short: { ttl: 60000, limit: 1 } })
  @ApiOperation({ summary: 'File a dispute for a booking' })
  @ApiResponse({ status: 201, description: 'Dispute created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request or dispute already exists' })
  @ApiResponse({ status: 403, description: 'Not a participant in this booking' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  async create(
    @CurrentUser() user: any,
    @Param('bookingId') bookingId: string,
    @Body() createDisputeDto: CreateDisputeDto
  ) {
    return this.disputesService.create(user.id, bookingId, createDisputeDto);
  }

  @Get('booking/:bookingId')
  @ApiOperation({ summary: 'Get dispute for a booking' })
  @ApiResponse({ status: 200, description: 'Returns the booking dispute' })
  @ApiResponse({ status: 403, description: 'Not a participant in this booking' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  async getByBooking(@CurrentUser() user: any, @Param('bookingId') bookingId: string) {
    return this.disputesService.findByBooking(user.id, bookingId);
  }

  @Get('me')
  @ApiOperation({ summary: 'Get all disputes filed by the current user' })
  @ApiResponse({ status: 200, description: 'Returns user disputes' })
  async getMyDisputes(@CurrentUser() user: any) {
    return this.disputesService.findByUser(user.id);
  }
}
