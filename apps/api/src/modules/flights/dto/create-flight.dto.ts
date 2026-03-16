import { IsString, IsOptional, IsNumber, IsPositive, IsDateString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateFlightDto {
  @ApiProperty({ example: 'Jeddah' })
  @IsString()
  departureCity: string;

  @ApiPropertyOptional({ example: 'JED' })
  @IsOptional()
  @IsString()
  departureCode?: string;

  @ApiProperty({ example: 'Riyadh' })
  @IsString()
  arrivalCity: string;

  @ApiPropertyOptional({ example: 'RUH' })
  @IsOptional()
  @IsString()
  arrivalCode?: string;

  @ApiProperty({ example: '2026-04-15T10:00:00Z' })
  @IsDateString()
  departureDate: string;

  @ApiPropertyOptional({ example: 'SV123' })
  @IsOptional()
  @IsString()
  flightNumber?: string;

  @ApiProperty({ example: 10, description: 'Available kg for senders' })
  @IsNumber()
  @IsPositive()
  availableWeight: number;

  @ApiPropertyOptional({ example: 80, description: 'Suggested price per kg in SAR' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  suggestedPrice?: number;

  @ApiPropertyOptional({ example: 'SAR' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional({ example: 'No liquids or fragile items please' })
  @IsOptional()
  @IsString()
  notes?: string;
}
