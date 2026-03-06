import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsDateString,
  IsArray,
  Min,
  Max,
  MaxLength,
} from 'class-validator';

export class CreateRequestDto {
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
    description: 'Date by which delivery is needed',
    example: '2026-03-20',
  })
  @IsDateString()
  @IsNotEmpty()
  neededByDate: string;

  @ApiProperty({
    description: 'Weight needed in kg',
    example: 5,
    minimum: 0.1,
    maximum: 50,
  })
  @IsNumber()
  @Min(0.1)
  @Max(50)
  weight: number;

  @ApiPropertyOptional({
    description: 'Budget for the delivery',
    example: 100,
    minimum: 0,
    maximum: 5000,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(5000)
  budget?: number;

  @ApiPropertyOptional({
    description: 'Currency code',
    example: 'SAR',
    default: 'SAR',
  })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional({
    description: 'Description of items to be sent',
    example: 'Winter clothing and personal electronics',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({
    description: 'Types of items',
    example: ['clothing', 'electronics'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  itemTypes?: string[];

  @ApiProperty({
    description: 'User declares items do not include prohibited items',
    example: true,
  })
  @IsBoolean()
  prohibitedItemsDeclared: boolean;
}
