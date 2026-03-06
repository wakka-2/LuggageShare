import { Controller, Get, Post, Param, Query, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { OffersService } from './offers.service';
import { CreateOfferDto } from './dto/create-offer.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';

// ==========================================
// Trip Offers: POST /trips/:tripId/offers
// ==========================================

@ApiTags('trips')
@Controller('trips')
export class TripsOffersController {
  constructor(private readonly offersService: OffersService) {}

  @Get(':tripId/offers')
  @Public()
  @ApiOperation({ summary: 'Get offers on a trip' })
  @ApiResponse({ status: 200, description: 'Returns offers for the trip' })
  async getTripOffers(
    @Param('tripId') tripId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number
  ) {
    return this.offersService.findTripOffers(tripId, { page, limit });
  }

  @Post(':tripId/offers')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Make an offer on a trip' })
  @ApiResponse({ status: 201, description: 'Offer created successfully' })
  async createTripOffer(
    @CurrentUser() user: any,
    @Param('tripId') tripId: string,
    @Body() dto: CreateOfferDto
  ) {
    return this.offersService.createTripOffer(user.id, tripId, dto);
  }
}

// ==========================================
// Request Offers: POST /requests/:requestId/offers
// ==========================================

@ApiTags('requests')
@Controller('requests')
export class RequestsOffersController {
  constructor(private readonly offersService: OffersService) {}

  @Get(':requestId/offers')
  @Public()
  @ApiOperation({ summary: 'Get offers on a request' })
  @ApiResponse({ status: 200, description: 'Returns offers for the request' })
  async getRequestOffers(
    @Param('requestId') requestId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number
  ) {
    return this.offersService.findRequestOffers(requestId, { page, limit });
  }

  @Post(':requestId/offers')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Make an offer on a request' })
  @ApiResponse({ status: 201, description: 'Offer created successfully' })
  async createRequestOffer(
    @CurrentUser() user: any,
    @Param('requestId') requestId: string,
    @Body() dto: CreateOfferDto
  ) {
    return this.offersService.createRequestOffer(user.id, requestId, dto);
  }
}

// ==========================================
// Offer Actions: /offers/:id/accept, reject, withdraw
// ==========================================

@ApiTags('offers')
@Controller('offers')
export class OffersController {
  constructor(private readonly offersService: OffersService) {}

  @Get('my')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get my offers' })
  @ApiResponse({ status: 200, description: 'Returns offers made by current user' })
  async getMyOffers(
    @CurrentUser() user: any,
    @Query('page') page?: number,
    @Query('limit') limit?: number
  ) {
    return this.offersService.findMyOffers(user.id, { page, limit });
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get offer by ID' })
  @ApiResponse({ status: 200, description: 'Returns offer details' })
  async getById(@Param('id') id: string) {
    return this.offersService.findById(id);
  }

  @Post(':id/accept')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Accept an offer (creates booking)' })
  @ApiResponse({ status: 200, description: 'Offer accepted and booking created' })
  async accept(@CurrentUser() user: any, @Param('id') id: string) {
    return this.offersService.acceptOffer(user.id, id);
  }

  @Post(':id/reject')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Reject an offer' })
  @ApiResponse({ status: 200, description: 'Offer rejected' })
  async reject(@CurrentUser() user: any, @Param('id') id: string) {
    return this.offersService.rejectOffer(user.id, id);
  }

  @Post(':id/withdraw')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Withdraw my offer' })
  @ApiResponse({ status: 200, description: 'Offer withdrawn' })
  async withdraw(@CurrentUser() user: any, @Param('id') id: string) {
    return this.offersService.withdrawOffer(user.id, id);
  }
}
