import {
  IsString,
  IsNumber,
  IsOptional,
  IsIn,
  IsArray,
  ValidateNested,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class CreateItemDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty()
  @IsNumber()
  @Type(() => Number)
  @Min(0.1)
  weight: number;

  @ApiProperty()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  value: number;

  @ApiPropertyOptional({ default: 'SAR' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  imageUrls?: string[];
}

export class CreateBookingDto {
  @ApiProperty()
  @IsString()
  listingId: string;

  @ApiPropertyOptional({ enum: ['small', 'medium', 'large'] })
  @IsOptional()
  @IsString()
  @IsIn(['small', 'medium', 'large'])
  packageSize?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0.1)
  totalWeight?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateItemDto)
  items?: CreateItemDto[];

  @ApiPropertyOptional({ description: 'Initial message to the carrier' })
  @IsOptional()
  @IsString()
  message?: string;
}
