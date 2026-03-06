import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, Min, Max, MaxLength } from 'class-validator';

export class CreateOfferDto {
  @ApiProperty({
    description: 'Weight offered in kg',
    example: 5,
    minimum: 0.1,
    maximum: 50,
  })
  @IsNumber()
  @Min(0.1)
  @Max(50)
  offeredWeight: number;

  @ApiProperty({
    description: 'Price offered for carrying',
    example: 150,
    minimum: 0.1,
    maximum: 10000,
  })
  @IsNumber()
  @Min(0.1)
  @Max(10000)
  offeredPrice: number;

  @ApiPropertyOptional({
    description: 'Currency code',
    example: 'SAR',
    default: 'SAR',
  })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional({
    description: 'Optional message with the offer',
    example: 'I can pick up from your location',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  message?: string;
}
