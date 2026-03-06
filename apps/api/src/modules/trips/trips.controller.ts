import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { TripsService } from './trips.service';
import { CreateTripDto } from './dto/create-trip.dto';
import { UpdateTripDto } from './dto/update-trip.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('trips')
@Controller('trips')
export class TripsController {
  constructor(private readonly tripsService: TripsService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'Search trips' })
  @ApiResponse({ status: 200, description: 'Returns trips matching criteria' })
  async search(
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('date') date?: string,
    @Query('minWeight') minWeight?: number,
    @Query('transportType') transportType?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number
  ) {
    return this.tripsService.search({ from, to, date, minWeight, transportType, page, limit });
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get my trips' })
  @ApiResponse({ status: 200, description: 'Returns trips posted by current user' })
  async getMyTrips(
    @CurrentUser() user: any,
    @Query('page') page?: number,
    @Query('limit') limit?: number
  ) {
    return this.tripsService.findByUser(user.id, { page, limit });
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get trip by ID' })
  @ApiResponse({ status: 200, description: 'Returns trip details' })
  async getById(@Param('id') id: string) {
    return this.tripsService.findById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new trip' })
  @ApiResponse({ status: 201, description: 'Trip created successfully' })
  async create(@CurrentUser() user: any, @Body() createTripDto: CreateTripDto) {
    return this.tripsService.create(user.id, createTripDto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a trip' })
  @ApiResponse({ status: 200, description: 'Trip updated successfully' })
  async update(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() updateTripDto: UpdateTripDto
  ) {
    return this.tripsService.update(user.id, id, updateTripDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cancel a trip' })
  @ApiResponse({ status: 200, description: 'Trip cancelled successfully' })
  async cancel(@CurrentUser() user: any, @Param('id') id: string) {
    return this.tripsService.cancel(user.id, id);
  }
}
