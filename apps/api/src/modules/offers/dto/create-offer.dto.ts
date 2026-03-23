import { IsNumber, IsPositive, IsOptional, IsString, IsArray, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateOfferDto {
  @ApiProperty({ example: 5, description: 'Weight in kg the sender wants to ship' })
  @IsNumber()
  @IsPositive()
  offeredWeight: number;

  @ApiProperty({ example: 400, description: 'Total price offered in SAR' })
  @IsNumber()
  @Min(0)
  offeredPrice: number;

  @ApiPropertyOptional({ example: 'SAR' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional({ example: 'Perfume set for my sister, original packaging' })
  @IsOptional()
  @IsString()
  note?: string;

  @ApiPropertyOptional({
    example: ['https://cdn.luggageshare.com/images/items/abc123.jpg'],
    description: 'Photo URLs of items to ship (max 3)',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  imageUrls?: string[];
}
