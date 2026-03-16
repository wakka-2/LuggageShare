import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsDateString, IsIn } from 'class-validator';

export class WalletHistoryQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by transaction type',
    enum: ['credit', 'debit', 'commission', 'refund'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['credit', 'debit', 'commission', 'refund'])
  type?: string;

  @ApiPropertyOptional({ description: 'Start date for filtering', example: '2026-01-01' })
  @IsOptional()
  @IsDateString()
  from?: string;

  @ApiPropertyOptional({ description: 'End date for filtering', example: '2026-12-31' })
  @IsOptional()
  @IsDateString()
  to?: string;
}
