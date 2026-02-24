import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { ListingsService } from './listings.service';
import { CreateListingDto } from './dto/create-listing.dto';
import { UpdateListingDto } from './dto/update-listing.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('listings')
@Controller('listings')
export class ListingsController {
  constructor(private readonly listingsService: ListingsService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'Search listings' })
  @ApiResponse({ status: 200, description: 'Returns listings matching criteria' })
  @ApiQuery({ name: 'from', required: false })
  @ApiQuery({ name: 'to', required: false })
  @ApiQuery({ name: 'date', required: false })
  @ApiQuery({ name: 'minWeight', required: false, type: Number })
  @ApiQuery({ name: 'maxPrice', required: false, type: Number })
  @ApiQuery({ name: 'type', required: false, enum: ['offer', 'request'] })
  async search(
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('date') date?: string,
    @Query('minWeight') minWeight?: number,
    @Query('maxPrice') maxPrice?: number,
    @Query('type') type?: string,
  ) {
    return this.listingsService.search({ from, to, date, minWeight, maxPrice, type });
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get listing by ID' })
  @ApiResponse({ status: 200, description: 'Returns listing details' })
  async getById(@Param('id') id: string) {
    return this.listingsService.findById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new listing' })
  @ApiResponse({ status: 201, description: 'Listing created successfully' })
  async create(@CurrentUser() user: any, @Body() createListingDto: CreateListingDto) {
    return this.listingsService.create(user.id, createListingDto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a listing' })
  @ApiResponse({ status: 200, description: 'Listing updated successfully' })
  async update(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() updateListingDto: UpdateListingDto,
  ) {
    return this.listingsService.update(user.id, id, updateListingDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a listing' })
  @ApiResponse({ status: 200, description: 'Listing deleted successfully' })
  async delete(@CurrentUser() user: any, @Param('id') id: string) {
    return this.listingsService.delete(user.id, id);
  }
}
