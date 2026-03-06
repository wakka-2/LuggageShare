import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsDateString,
  IsIn,
  Min,
  Max,
  MaxLength,
  ValidateNested,
} from 'class-validator';

export class TripPreferencesDto {
  @ApiPropertyOptional({
    description: 'Whether fragile items are accepted',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  acceptsFragile?: boolean;

  @ApiPropertyOptional({
    description: 'Whether electronic items are accepted',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  acceptsElectronics?: boolean;

  @ApiPropertyOptional({
    description: 'Whether documents are accepted',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  acceptsDocuments?: boolean;

  @ApiPropertyOptional({
    description: 'Whether clothing items are accepted',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  acceptsClothing?: boolean;

  @ApiPropertyOptional({
    description: 'Maximum declared value per item',
    example: 300,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxItemValue?: number;
}

export class CreateTripDto {
  @ApiProperty({
    description: 'City of departure',
    example: 'Jeddah',
  })
  @IsString()
  @IsNotEmpty()
  departureCity: string;

  @ApiPropertyOptional({
    description: 'Airport/station code',
    example: 'JED',
  })
  @IsOptional()
  @IsString()
  departureCode?: string;

  @ApiProperty({
    description: 'City of arrival',
    example: 'Riyadh',
  })
  @IsString()
  @IsNotEmpty()
  arrivalCity: string;

  @ApiPropertyOptional({
    description: 'Airport/station code',
    example: 'RUH',
  })
  @IsOptional()
  @IsString()
  arrivalCode?: string;

  @ApiProperty({
    description: 'Departure date in ISO 8601 format',
    example: '2026-03-15',
  })
  @IsDateString()
  @IsNotEmpty()
  departureDate: string;

  @ApiPropertyOptional({
    description: 'Transport type',
    example: 'flight',
    enum: ['flight', 'car', 'bus', 'train'],
    default: 'flight',
  })
  @IsOptional()
  @IsString()
  @IsIn(['flight', 'car', 'bus', 'train'])
  transportType?: string;

  @ApiPropertyOptional({
    description: 'Flight number (if transport is flight)',
    example: 'SV123',
  })
  @IsOptional()
  @IsString()
  flightNumber?: string;

  @ApiProperty({
    description: 'Available luggage weight in kg',
    example: 10,
    minimum: 0.1,
    maximum: 50,
  })
  @IsNumber()
  @Min(0.1)
  @Max(50)
  availableWeight: number;

  @ApiPropertyOptional({
    description: 'Suggested price per kg hint',
    example: 50,
    minimum: 0,
    maximum: 1000,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1000)
  suggestedPrice?: number;

  @ApiPropertyOptional({
    description: 'Currency code',
    example: 'SAR',
    default: 'SAR',
  })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional({
    description: 'Carrier preferences for accepted item types',
    type: TripPreferencesDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => TripPreferencesDto)
  preferences?: TripPreferencesDto;

  @ApiPropertyOptional({
    description: 'Additional notes',
    example: 'Pickup available near King Fahd Road',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}
