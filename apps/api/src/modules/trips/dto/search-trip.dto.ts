import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, IsDateString, IsIn, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class SearchTripDto {
  @ApiPropertyOptional({ description: 'Departure city', example: 'Jeddah' })
  @IsOptional()
  @IsString()
  from?: string;

  @ApiPropertyOptional({ description: 'Arrival city', example: 'Riyadh' })
  @IsOptional()
  @IsString()
  to?: string;

  @ApiPropertyOptional({ description: 'Departure date', example: '2026-03-15' })
  @IsOptional()
  @IsDateString()
  date?: string;

  @ApiPropertyOptional({ description: 'Minimum available weight in kg', example: 5 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minWeight?: number;

  @ApiPropertyOptional({
    description: 'Transport type filter',
    enum: ['flight', 'car', 'bus', 'train'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['flight', 'car', 'bus', 'train'])
  transportType?: string;

  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number;

  @ApiPropertyOptional({ description: 'Items per page', default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number;
}
