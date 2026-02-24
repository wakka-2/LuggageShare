import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsArray,
  IsOptional,
  IsUUID,
  Min,
  Max,
  MaxLength,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator';

export class BookingItemDto {
  @ApiProperty({
    description: 'Name of the item',
    example: 'Winter jacket',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({
    description: 'Description of the item',
    example: 'Heavy winter jacket, packed in garment bag',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiProperty({
    description: 'Weight of the item in kg',
    example: 2.5,
    minimum: 0.1,
    maximum: 30,
  })
  @IsNumber()
  @Min(0.1)
  @Max(30)
  weight: number;

  @ApiProperty({
    description: 'Declared value of the item',
    example: 150,
    minimum: 0,
    maximum: 500,
  })
  @IsNumber()
  @Min(0)
  @Max(500)
  value: number;

  @ApiPropertyOptional({
    description: 'Currency for the item value',
    example: 'SAR',
  })
  @IsOptional()
  @IsString()
  currency?: string;
}

export class CreateBookingDto {
  @ApiProperty({
    description: 'ID of the listing to book',
    example: '550e8400-e29b-41d4-a716-446655440000',
    format: 'uuid',
  })
  @IsUUID()
  @IsNotEmpty()
  listingId: string;

  @ApiProperty({
    description: 'Total weight of all items in kg',
    example: 5.0,
    minimum: 0.1,
    maximum: 30,
  })
  @IsNumber()
  @Min(0.1)
  @Max(30)
  totalWeight: number;

  @ApiProperty({
    description: 'List of items to be transported',
    type: [BookingItemDto],
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => BookingItemDto)
  items: BookingItemDto[];
}
