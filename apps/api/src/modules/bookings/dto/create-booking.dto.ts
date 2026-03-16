import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsArray,
  IsOptional,
  Min,
  Max,
  MaxLength,
  ValidateNested,
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

  @ApiPropertyOptional({
    description: 'URLs of uploaded item images',
    example: ['https://storage.example.com/items/photo1.jpg'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  imageUrls?: string[];
}

export class CreateBookingDto {
  @ApiProperty({
    description: 'ID of the listing to book',
    example: 'clx1234567890abcdef',
  })
  @IsString()
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

  @ApiPropertyOptional({
    description: 'List of items to be transported',
    type: [BookingItemDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BookingItemDto)
  items?: BookingItemDto[];
}
