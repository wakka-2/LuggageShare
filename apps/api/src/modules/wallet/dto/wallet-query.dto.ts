import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsDateString, IsIn } from 'class-validator';

export class WalletHistoryQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by transaction type',
    enum: ['signup_bonus', 'referral_bonus', 'commission', 'topup', 'withdrawal', 'refund'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['signup_bonus', 'referral_bonus', 'commission', 'topup', 'withdrawal', 'refund'])
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
