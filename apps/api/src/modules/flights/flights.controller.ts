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
import { Public } from '../auth/decorators/public.decorator';
import { FlightsService } from './flights.service';
import { CreateFlightDto } from './dto/create-flight.dto';
import { UpdateFlightDto } from './dto/update-flight.dto';
import { SearchFlightsDto } from './dto/search-flights.dto';

@ApiTags('flights')
@UseGuards(JwtAuthGuard)
@Controller('flights')
export class FlightsController {
  constructor(private readonly flightsService: FlightsService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'Search available flights' })
  @ApiOkResponse({ description: 'Paginated list of flights' })
  search(@Query() dto: SearchFlightsDto) {
    return this.flightsService.search(dto);
  }

  @Get('my')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'My posted flights' })
  findMyFlights(@Request() req: any, @Query('page') page?: number, @Query('limit') limit?: number) {
    return this.flightsService.findMyFlights(req.user.id, { page, limit });
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get flight by id' })
  findById(@Param('id') id: string) {
    return this.flightsService.findById(id);
  }

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Post a new flight' })
  @ApiCreatedResponse({ description: 'Flight created' })
  create(@Request() req: any, @Body() dto: CreateFlightDto) {
    return this.flightsService.create(req.user.id, dto);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update flight details (poster only, no accepted offers)' })
  update(@Request() req: any, @Param('id') id: string, @Body() dto: UpdateFlightDto) {
    return this.flightsService.update(req.user.id, id, dto);
  }

  @Patch(':id/cancel')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cancel flight (cascades to pending offers and active bookings)' })
  cancel(@Request() req: any, @Param('id') id: string) {
    return this.flightsService.cancel(req.user.id, id);
  }
}
