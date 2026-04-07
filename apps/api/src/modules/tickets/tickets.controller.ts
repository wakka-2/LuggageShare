import { Controller, Get, Post, Body, Param, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { JwtService } from '@nestjs/jwt';
import { TicketsService } from './tickets.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('tickets')
@Controller('tickets')
export class TicketsController {
  constructor(
    private readonly ticketsService: TicketsService,
    private readonly jwtService: JwtService
  ) {}

  @Post()
  @Throttle({ short: { ttl: 60000, limit: 3 } })
  @ApiOperation({ summary: 'Submit a support ticket (auth optional)' })
  @ApiResponse({ status: 201, description: 'Ticket created' })
  async create(@Body() dto: CreateTicketDto, @Req() req: any) {
    let userId: string | undefined;
    try {
      const authHeader = req.headers.authorization;
      if (authHeader?.startsWith('Bearer ')) {
        const payload = this.jwtService.verify(authHeader.slice(7));
        userId = payload.sub;
      }
    } catch {
      // No valid token — guest ticket
    }
    return this.ticketsService.create(dto, userId);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get my tickets' })
  @ApiResponse({ status: 200, description: 'Returns user tickets' })
  async getMyTickets(@CurrentUser() user: any) {
    return this.ticketsService.findByUser(user.id);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a ticket by ID' })
  @ApiResponse({ status: 200, description: 'Returns ticket details' })
  async getById(@CurrentUser() user: any, @Param('id') id: string) {
    return this.ticketsService.findById(id, user.id);
  }
}
