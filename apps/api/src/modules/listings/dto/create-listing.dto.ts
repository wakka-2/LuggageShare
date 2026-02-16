import {
  IsString,
  IsNumber,
  IsBoolean,
  IsOptional,
  IsDateString,
  IsIn,
  Min,
  Max,
  IsObject,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateListingDto {
  @ApiProperty({ enum: ['offer', 'request'], default: 'offer' })
  @IsString()
  @IsIn(['offer', 'request'])
  type: string = 'offer';

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  titleAr?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  descriptionAr?: string;

  @ApiProperty()
  @IsString()
  departureCity: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  departureCode?: string;

  @ApiProperty()
  @IsString()
  arrivalCity: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  arrivalCode?: string;

  @ApiProperty()
  @IsDateString()
  departureDate: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  flightNumber?: string;

  @ApiProperty({ minimum: 0.1, maximum: 30 })
  @IsNumber()
  @Type(() => Number)
  @Min(0.1)
  @Max(30)
  availableWeight: number;

  @ApiProperty({ description: 'Price for small package (up to 5kg)' })
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  priceSmall: number;

  @ApiProperty({ description: 'Price for medium package (5-10kg)' })
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  priceMedium: number;

  @ApiProperty({ description: 'Price for large package (10-20kg)' })
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  priceLarge: number;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  negotiable?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0.1)
  neededWeight?: number;

  @ApiPropertyOptional({ description: 'Item restriction preferences' })
  @IsOptional()
  @IsObject()
  restrictions?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Handoff options: airport, delivery, meetup' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  handoffOptions?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  currency?: string;
}
