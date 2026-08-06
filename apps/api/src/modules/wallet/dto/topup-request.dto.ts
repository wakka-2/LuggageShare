import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsString, IsOptional, Min, Max, MaxLength } from 'class-validator';
import { WALLET } from '../../../common/constants/wallet.constants';

export class TopUpRequestDto {
  @ApiProperty({ description: 'Amount to top up in SAR', example: 50 })
  @IsNumber()
  @Min(WALLET.TOPUP_MIN, { message: `Minimum top-up is ${WALLET.TOPUP_MIN} SAR` })
  @Max(WALLET.TOPUP_MAX, { message: `Maximum top-up is ${WALLET.TOPUP_MAX} SAR per request` })
  amount: number;

  @ApiPropertyOptional({ description: 'Optional transfer reference/note' })
  @IsString()
  @IsOptional()
  @MaxLength(140)
  reference?: string;
}
