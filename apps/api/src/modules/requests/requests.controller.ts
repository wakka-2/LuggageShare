import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { RequestsService } from './requests.service';
import { CreateRequestDto } from './dto/create-request.dto';
import { UpdateRequestDto } from './dto/update-request.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('requests')
@Controller('requests')
export class RequestsController {
  constructor(private readonly requestsService: RequestsService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'Search sender requests' })
  @ApiResponse({ status: 200, description: 'Returns requests matching criteria' })
  async search(
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('date') date?: string,
    @Query('maxWeight') maxWeight?: number,
    @Query('page') page?: number,
    @Query('limit') limit?: number
  ) {
    return this.requestsService.search({ from, to, date, maxWeight, page, limit });
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get my requests' })
  @ApiResponse({ status: 200, description: 'Returns requests posted by current user' })
  async getMyRequests(
    @CurrentUser() user: any,
    @Query('page') page?: number,
    @Query('limit') limit?: number
  ) {
    return this.requestsService.findByUser(user.id, { page, limit });
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get request by ID' })
  @ApiResponse({ status: 200, description: 'Returns request details' })
  async getById(@Param('id') id: string) {
    return this.requestsService.findById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new sender request' })
  @ApiResponse({ status: 201, description: 'Request created successfully' })
  async create(@CurrentUser() user: any, @Body() createRequestDto: CreateRequestDto) {
    return this.requestsService.create(user.id, createRequestDto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a request' })
  @ApiResponse({ status: 200, description: 'Request updated successfully' })
  async update(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() updateRequestDto: UpdateRequestDto
  ) {
    return this.requestsService.update(user.id, id, updateRequestDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cancel a request' })
  @ApiResponse({ status: 200, description: 'Request cancelled successfully' })
  async cancel(@CurrentUser() user: any, @Param('id') id: string) {
    return this.requestsService.cancel(user.id, id);
  }
}
