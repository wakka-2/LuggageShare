import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsDateString,
  Min,
  Max,
  MaxLength,
  ValidateNested,
} from 'class-validator';

export class ListingPreferencesDto {
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

export class CreateListingDto {
  @ApiProperty({
    description: 'City of departure',
    example: 'Riyadh',
  })
  @IsString()
  @IsNotEmpty()
  departureCity: string;

  @ApiProperty({
    description: 'City of arrival',
    example: 'Jeddah',
  })
  @IsString()
  @IsNotEmpty()
  arrivalCity: string;

  @ApiProperty({
    description: 'Departure date in ISO 8601 format',
    example: '2026-03-15',
  })
  @IsDateString()
  @IsNotEmpty()
  departureDate: string;

  @ApiPropertyOptional({
    description: 'Flight number',
    example: 'SV123',
  })
  @IsOptional()
  @IsString()
  flightNumber?: string;

  @ApiProperty({
    description: 'Available luggage weight in kg',
    example: 10,
    minimum: 0.1,
    maximum: 30,
  })
  @IsNumber()
  @Min(0.1)
  @Max(30)
  availableWeight: number;

  @ApiProperty({
    description: 'Price per kilogram',
    example: 50,
    minimum: 0.1,
    maximum: 1000,
  })
  @IsNumber()
  @Min(0.1)
  @Max(1000)
  pricePerKg: number;

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
    type: ListingPreferencesDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => ListingPreferencesDto)
  preferences?: ListingPreferencesDto;

  @ApiPropertyOptional({
    description: 'Additional notes from the carrier',
    example: 'Pickup available near King Fahd Road',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}
