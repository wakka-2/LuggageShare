import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiOkResponse,
  ApiCreatedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OffersService } from './offers.service';
import { CreateOfferDto } from './dto/create-offer.dto';

@ApiTags('offers')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller()
export class OffersController {
  constructor(private readonly offersService: OffersService) {}

  /** POST /api/v1/flights/:flightId/offers — submit an offer */
  @Post('flights/:flightId/offers')
  @ApiOperation({ summary: 'Submit an offer on a flight' })
  @ApiCreatedResponse({ description: 'Offer created' })
  create(@Request() req: any, @Param('flightId') flightId: string, @Body() dto: CreateOfferDto) {
    return this.offersService.create(req.user.id, flightId, dto);
  }

  /** GET /api/v1/flights/:flightId/offers — poster sees all offers on their flight */
  @Get('flights/:flightId/offers')
  @ApiOperation({ summary: 'List offers on a flight (poster only)' })
  @ApiOkResponse({ description: 'List of offers' })
  findByFlight(@Request() req: any, @Param('flightId') flightId: string) {
    return this.offersService.findByFlight(req.user.id, flightId);
  }

  /** GET /api/v1/offers/my — sender sees their own offers */
  @Get('offers/my')
  @ApiOperation({ summary: 'My submitted offers across all flights' })
  findMyOffers(@Request() req: any, @Query('page') page?: number, @Query('limit') limit?: number) {
    return this.offersService.findMyOffers(req.user.id, { page, limit });
  }

  /** GET /api/v1/offers/:id */
  @Get('offers/:id')
  @ApiOperation({ summary: 'Get offer by id' })
  findById(@Param('id') id: string) {
    return this.offersService.findById(id);
  }

  /** PATCH /api/v1/offers/:id/accept — poster accepts → booking auto-created */
  @Patch('offers/:id/accept')
  @ApiOperation({ summary: 'Accept offer (poster only) — auto-creates booking' })
  accept(@Request() req: any, @Param('id') id: string) {
    return this.offersService.accept(req.user.id, id);
  }

  /** PATCH /api/v1/offers/:id/reject */
  @Patch('offers/:id/reject')
  @ApiOperation({ summary: 'Reject offer (poster only)' })
  reject(@Request() req: any, @Param('id') id: string) {
    return this.offersService.reject(req.user.id, id);
  }

  /** PATCH /api/v1/offers/:id/withdraw */
  @Patch('offers/:id/withdraw')
  @ApiOperation({ summary: 'Withdraw offer (sender only, only if pending)' })
  withdraw(@Request() req: any, @Param('id') id: string) {
    return this.offersService.withdraw(req.user.id, id);
  }
}
