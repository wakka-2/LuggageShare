import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { BookingsService } from './bookings.service';
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
  async getMyBookings(@CurrentUser() user: any) {
    return this.bookingsService.findByUser(user.id);
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
  async create(@CurrentUser() user: any, @Body() createBookingDto: any) {
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

  @Put(':id/cancel')
  @ApiOperation({ summary: 'Cancel a booking' })
  @ApiResponse({ status: 200, description: 'Booking cancelled' })
  async cancel(@CurrentUser() user: any, @Param('id') id: string) {
    return this.bookingsService.cancel(user.id, id);
  }
}
