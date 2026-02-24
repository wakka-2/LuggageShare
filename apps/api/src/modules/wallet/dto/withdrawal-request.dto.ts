import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, Min, Matches } from 'class-validator';

export class WithdrawalRequestDto {
  @ApiProperty({ description: 'Amount to withdraw in SAR', example: 50 })
  @IsNumber()
  @Min(10, { message: 'Minimum withdrawal amount is 10 SAR' })
  amount: number;

  @ApiProperty({ description: 'IBAN for bank transfer', example: 'SA0380000000608010167519' })
  @IsString()
  @Matches(/^SA\d{22}$/, { message: 'Please enter a valid Saudi IBAN (SA followed by 22 digits)' })
  iban: string;

  @ApiProperty({ description: 'Account holder name' })
  @IsString()
  bankAccountName: string;
}
