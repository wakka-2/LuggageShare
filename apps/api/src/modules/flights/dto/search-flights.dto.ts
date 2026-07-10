import { IsOptional, IsString, IsDateString, IsNumber, IsPositive, IsIn } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class SearchFlightsDto {
  @ApiPropertyOptional({ example: 'Jeddah' })
  @IsOptional()
  @IsString()
  from?: string;

  @ApiPropertyOptional({ example: 'Riyadh' })
  @IsOptional()
  @IsString()
  to?: string;

  @ApiPropertyOptional({ example: '2026-04-15' })
  @IsOptional()
  @IsDateString()
  date?: string;

  @ApiPropertyOptional({
    example: 3,
    description: 'Date flexibility in days (± window around date). 0, 1, or 3.',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @IsIn([0, 1, 3])
  flex?: number;

  @ApiPropertyOptional({ example: 5, description: 'Minimum kg required' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  minWeight?: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number;

  @ApiPropertyOptional({ example: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number;
}
